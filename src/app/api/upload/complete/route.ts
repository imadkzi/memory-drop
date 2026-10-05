import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { findWeddingByUploadToken } from "@/lib/weddings/upload-token";
import { uploadCompleteSchema } from "@/lib/validation/schemas";
import { getStorageForWedding } from "@/lib/storage";
import { logger } from "@/lib/logging/logger";

export async function POST(request: Request) {
  const token = request.headers.get("x-upload-token");
  if (!token) {
    return NextResponse.json({ error: "This upload link isn't valid." }, { status: 401 });
  }

  const wedding = await findWeddingByUploadToken(token);
  if (!wedding) {
    return NextResponse.json({ error: "This upload link isn't valid." }, { status: 401 });
  }

  const parsed = uploadCompleteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload completion." }, { status: 400 });
  }

  const media = await prisma.media.findFirst({
    where: {
      id: parsed.data.mediaId,
      weddingId: wedding.id,
    },
  });
  if (!media) {
    return NextResponse.json({ error: "Upload not found." }, { status: 404 });
  }

  try {
    const { storage } = await getStorageForWedding(wedding.id);
    const file = await storage.getFile(parsed.data.driveFileId);

    await prisma.media.update({
      where: { id: media.id },
      data: {
        driveFileId: file.id,
        status: "READY",
        mimeType: file.mimeType || media.mimeType,
        size: BigInt(file.size || Number(media.size)),
        filename: file.name || media.filename,
      },
    });

    logger.info("upload_completed", {
      weddingId: wedding.id,
      mediaId: media.id,
      driveFileId: file.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    await prisma.media.update({
      where: { id: media.id },
      data: { status: "FAILED" },
    });
    logger.error("upload_complete_failed", {
      weddingId: wedding.id,
      mediaId: media.id,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "We couldn't finish this upload. Please try again." },
      { status: 502 },
    );
  }
}
