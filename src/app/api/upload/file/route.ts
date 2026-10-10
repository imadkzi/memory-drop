import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { findWeddingByUploadToken } from "@/lib/weddings/upload-token";
import { validateUploadFile } from "@/lib/validation/upload";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getEnv } from "@/lib/validation/env";
import { getStorageForWedding } from "@/lib/storage";
import { logger } from "@/lib/logging/logger";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const token = request.headers.get("x-upload-token");
  if (!token) {
    return NextResponse.json({ error: "This upload link isn't valid." }, { status: 401 });
  }

  const wedding = await findWeddingByUploadToken(token);
  if (!wedding) {
    logger.warn("upload_invalid_token");
    return NextResponse.json({ error: "This upload link isn't valid." }, { status: 401 });
  }
  if (!wedding.uploadEnabled) {
    return NextResponse.json(
      { error: "Uploads are temporarily closed for this event." },
      { status: 403 },
    );
  }
  if (!wedding.driveConnectionId || !wedding.driveFolderId) {
    return NextResponse.json(
      { error: "This event isn't ready to receive uploads yet." },
      { status: 503 },
    );
  }

  const filenameHeader = request.headers.get("x-filename");
  const mimeHeader = request.headers.get("x-mime-type") || "application/octet-stream";
  const sizeHeader = request.headers.get("content-length") || request.headers.get("x-file-size");

  if (!filenameHeader || !sizeHeader) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  let filename: string;
  try {
    filename = decodeURIComponent(filenameHeader);
  } catch {
    filename = filenameHeader;
  }

  const size = Number(sizeHeader);
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const env = getEnv();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipLimit = checkRateLimit(
    `upload:ip:${ip}`,
    env.RATE_LIMIT_UPLOAD_PER_IP,
    env.RATE_LIMIT_WINDOW_MS,
  );
  const tokenLimit = checkRateLimit(
    `upload:token:${wedding.id}`,
    env.RATE_LIMIT_UPLOAD_PER_TOKEN,
    env.RATE_LIMIT_WINDOW_MS,
  );

  if (!ipLimit.allowed || !tokenLimit.allowed) {
    logger.warn("rate_limit_upload", { weddingId: wedding.id, ip });
    return NextResponse.json(
      { error: "Too many uploads right now. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const validated = validateUploadFile({
    filename,
    mimeType: mimeHeader,
    size,
    maxPhotoSizeBytes: wedding.maxPhotoSizeBytes,
    maxVideoSizeBytes: wedding.maxVideoSizeBytes,
  });
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  if (!request.body) {
    return NextResponse.json({ error: "Missing file body." }, { status: 400 });
  }

  const media = await prisma.media.create({
    data: {
      weddingId: wedding.id,
      filename: validated.value.filename,
      mimeType: validated.value.mimeType,
      size: BigInt(size),
      mediaType: validated.value.mediaType,
      status: "UPLOADING",
    },
  });

  try {
    const { storage, folderId } = await getStorageForWedding(wedding.id);
    const file = await storage.uploadFileStream({
      folderId,
      filename: validated.value.filename,
      mimeType: validated.value.mimeType,
      body: request.body,
    });

    await prisma.media.update({
      where: { id: media.id },
      data: {
        driveFileId: file.id,
        status: "READY",
        mimeType: file.mimeType || validated.value.mimeType,
        size: BigInt(file.size || size),
        filename: file.name || validated.value.filename,
      },
    });

    logger.info("upload_completed", {
      weddingId: wedding.id,
      mediaId: media.id,
      driveFileId: file.id,
      mediaType: validated.value.mediaType,
      size,
    });

    return NextResponse.json({ ok: true, mediaId: media.id });
  } catch (error) {
    await prisma.media.update({
      where: { id: media.id },
      data: { status: "FAILED" },
    });
    logger.error("upload_failed", {
      weddingId: wedding.id,
      mediaId: media.id,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "We couldn't upload this file. Please try again." },
      { status: 502 },
    );
  }
}
