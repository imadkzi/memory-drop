import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Readable } from "stream";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { getStorageForWedding } from "@/lib/storage";
import { logger } from "@/lib/logging/logger";

type Ctx = { params: Promise<{ id: string }> };

function nodeToWebStream(stream: NodeJS.ReadableStream): ReadableStream {
  return Readable.toWeb(stream as Readable) as ReadableStream;
}

export async function GET(request: Request, context: Ctx) {
  const { id } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media || media.status !== "READY" || !media.driveFileId) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  const membership = await requireWeddingAccess(session.user.id, media.weddingId);
  if (!membership) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  const inline = new URL(request.url).searchParams.get("view") === "1";

  try {
    const { storage } = await getStorageForWedding(media.weddingId);
    const stream = await storage.downloadFile(media.driveFileId);
    const webStream =
      typeof (stream as ReadableStream).getReader === "function"
        ? (stream as ReadableStream)
        : nodeToWebStream(stream as NodeJS.ReadableStream);

    const safeName = media.filename.replace(/"/g, "");
    return new NextResponse(webStream, {
      headers: {
        "Content-Type": media.mimeType,
        "Content-Disposition": inline
          ? `inline; filename="${safeName}"`
          : `attachment; filename="${safeName}"`,
        "Cache-Control": inline ? "private, max-age=60" : "private, no-store",
      },
    });
  } catch (error) {
    logger.error("media_download_failed", {
      mediaId: id,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Your Google Drive connection needs to be reconnected." },
      { status: 502 },
    );
  }
}
