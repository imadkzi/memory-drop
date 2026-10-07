import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { singleByteRange } from "@/lib/http/byte-range";
import { getStorageForWedding } from "@/lib/storage";
import { logger } from "@/lib/logging/logger";

type Ctx = { params: Promise<{ id: string }> };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

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
  const range = singleByteRange(request.headers.get("range"));

  try {
    const { storage } = await getStorageForWedding(media.weddingId);
    const file = await storage.openFile(media.driveFileId, range);
    const safeName = media.filename.replace(/"/g, "");
    const responseHeaders = new Headers({
      "Accept-Ranges": "bytes",
      "Content-Type": file.contentType || media.mimeType,
      "Content-Disposition": inline
        ? `inline; filename="${safeName}"`
        : `attachment; filename="${safeName}"`,
      "Cache-Control": inline ? "private, max-age=86400" : "private, no-store",
    });
    if (file.contentLength) {
      responseHeaders.set("Content-Length", file.contentLength);
    } else if (!range && media.size > 0) {
      responseHeaders.set("Content-Length", String(media.size));
    }
    if (file.contentRange) {
      responseHeaders.set("Content-Range", file.contentRange);
    }

    if (file.status === 416 || !file.body) {
      return new NextResponse(null, {
        status: file.status === 416 ? 416 : 502,
        headers: responseHeaders,
      });
    }

    return new NextResponse(file.body, {
      status: file.status,
      headers: responseHeaders,
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
