import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { getStorageForWedding } from "@/lib/storage";
import { logger } from "@/lib/logging/logger";
import { bulkDeleteMediaSchema } from "@/lib/validation/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
  const { id: weddingId } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const membership = await requireWeddingAccess(session.user.id, weddingId);
  if (!membership) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bulkDeleteMediaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Select at least one memory to delete." }, { status: 400 });
  }

  const media = await prisma.media.findMany({
    where: {
      id: { in: parsed.data.ids },
      weddingId,
      status: "READY",
    },
  });

  if (!media.length) {
    return NextResponse.json({ error: "No matching memories found." }, { status: 404 });
  }

  let storage: Awaited<ReturnType<typeof getStorageForWedding>>["storage"] | null = null;
  try {
    ({ storage } = await getStorageForWedding(weddingId));
  } catch {
    storage = null;
  }

  for (const item of media) {
    try {
      if (storage && item.driveFileId) {
        await storage.deleteFile(item.driveFileId);
      }
    } catch (error) {
      logger.error("drive_delete_failed", {
        mediaId: item.id,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  await prisma.media.updateMany({
    where: {
      id: { in: media.map((item) => item.id) },
      weddingId,
    },
    data: { status: "DELETED" },
  });

  logger.info("media_bulk_deleted", {
    weddingId,
    userId: session.user.id,
    count: media.length,
  });

  return NextResponse.json({ ok: true, deleted: media.length });
}
