import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { getStorageForWedding } from "@/lib/storage";
import { logger } from "@/lib/logging/logger";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media || media.status === "DELETED") {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  const membership = await requireWeddingAccess(session.user.id, media.weddingId);
  if (!membership) {
    logger.warn("permission_denied", {
      userId: session.user.id,
      mediaId: id,
      action: "delete_media",
    });
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  try {
    if (media.driveFileId) {
      const { storage } = await getStorageForWedding(media.weddingId);
      await storage.deleteFile(media.driveFileId);
    }
  } catch (error) {
    logger.error("drive_delete_failed", {
      mediaId: id,
      error: error instanceof Error ? error.message : "unknown",
    });
    // Keep metadata transition even if Drive delete fails after auth issues.
    // Mark deleted locally; admin can reconnect Drive later.
  }

  await prisma.media.update({
    where: { id },
    data: { status: "DELETED" },
  });

  logger.info("media_deleted", {
    mediaId: id,
    weddingId: media.weddingId,
    userId: session.user.id,
  });

  return NextResponse.json({ ok: true });
}
