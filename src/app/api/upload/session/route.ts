import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { findWeddingByUploadToken } from "@/lib/weddings/upload-token";
import { uploadSessionSchema } from "@/lib/validation/schemas";
import { validateUploadFile } from "@/lib/validation/upload";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getEnv } from "@/lib/validation/env";
import { getStorageForWedding } from "@/lib/storage";
import { logger } from "@/lib/logging/logger";

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
    return NextResponse.json({ error: "Uploads are temporarily closed for this event." }, { status: 403 });
  }
  if (!wedding.driveConnectionId || !wedding.driveFolderId) {
    return NextResponse.json(
      { error: "This event isn't ready to receive uploads yet." },
      { status: 503 },
    );
  }

  const env = getEnv();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipLimit = await consumeRateLimit(
    `upload:ip:${ip}`,
    env.RATE_LIMIT_UPLOAD_PER_IP,
    env.RATE_LIMIT_WINDOW_MS,
  );
  const tokenLimit = await consumeRateLimit(
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

  const parsed = uploadSessionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const validated = validateUploadFile({
    filename: parsed.data.filename,
    mimeType: parsed.data.mimeType,
    size: parsed.data.size,
    maxPhotoSizeBytes: wedding.maxPhotoSizeBytes,
    maxVideoSizeBytes: wedding.maxVideoSizeBytes,
  });
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const media = await prisma.media.create({
    data: {
      weddingId: wedding.id,
      filename: validated.value.filename,
      mimeType: validated.value.mimeType,
      size: BigInt(parsed.data.size),
      mediaType: validated.value.mediaType,
      status: "UPLOADING",
    },
  });

  try {
    const { storage, folderId } = await getStorageForWedding(wedding.id);
    const session = await storage.createResumableUpload({
      folderId,
      filename: validated.value.filename,
      mimeType: validated.value.mimeType,
      size: parsed.data.size,
    });

    logger.info("upload_session_started", {
      weddingId: wedding.id,
      mediaId: media.id,
      mediaType: validated.value.mediaType,
      size: parsed.data.size,
    });

    return NextResponse.json({
      mediaId: media.id,
      uploadUrl: session.uploadUrl,
    });
  } catch (error) {
    await prisma.media.update({
      where: { id: media.id },
      data: { status: "FAILED" },
    });
    logger.error("upload_session_failed", {
      weddingId: wedding.id,
      mediaId: media.id,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "We couldn't start this upload. Please try again." },
      { status: 502 },
    );
  }
}
