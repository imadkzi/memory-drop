import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { getStorageForWedding } from "@/lib/storage";
import { logger } from "@/lib/logging/logger";

type Ctx = { params: Promise<{ id: string }> };

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

  const sizeParam = new URL(request.url).searchParams.get("size");
  const size = sizeParam === "large" ? "large" : "thumb";

  try {
    const { storage } = await getStorageForWedding(media.weddingId);
    const preview = await storage.getFilePreview(media.driveFileId, size);
    if (preview.thumbnailLink) {
      // Proxy thumbnail to avoid exposing long-lived Drive URLs in HTML
      const thumb = await fetch(preview.thumbnailLink);
      if (thumb.ok) {
        const buffer = await thumb.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": thumb.headers.get("content-type") ?? "image/jpeg",
            "Cache-Control":
              size === "large"
                ? "private, max-age=600"
                : "private, max-age=300",
          },
        });
      }
    }

    // Fallback: stream original for photos when no thumbnail
    if (media.mediaType === "PHOTO") {
      const stream = await storage.downloadFile(media.driveFileId);
      return new NextResponse(stream as unknown as BodyInit, {
        headers: {
          "Content-Type": media.mimeType,
          "Cache-Control": "private, max-age=60",
        },
      });
    }

    return NextResponse.json({ error: "Preview unavailable." }, { status: 404 });
  } catch (error) {
    logger.error("media_preview_failed", {
      mediaId: id,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Your Google Drive connection needs to be reconnected." },
      { status: 502 },
    );
  }
}
