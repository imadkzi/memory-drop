import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { encryptSecret, generateSlug, generateUploadToken, hashUploadToken } from "@/lib/security/crypto";
import { createWeddingSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import { getEnv } from "@/lib/validation/env";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const memberships = await prisma.weddingAdmin.findMany({
    where: { userId: session.user.id },
    include: { wedding: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    weddings: memberships.map((m) => ({
      id: m.wedding.id,
      name: m.wedding.name,
      role: m.role,
      driveConnected: Boolean(m.wedding.driveConnectionId),
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createWeddingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid event name." }, { status: 400 });
  }

  const token = generateUploadToken();
  const env = getEnv();

  const wedding = await prisma.wedding.create({
    data: {
      name: parsed.data.name,
      slug: generateSlug(parsed.data.name),
      ownerId: session.user.id,
      uploadTokenHash: hashUploadToken(token),
      encryptedUploadToken: encryptSecret(token),
      maxPhotoSizeBytes: env.MAX_PHOTO_SIZE_BYTES,
      maxVideoSizeBytes: env.MAX_VIDEO_SIZE_BYTES,
      admins: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
  });

  logger.info("wedding_created", { weddingId: wedding.id, userId: session.user.id });

  return NextResponse.json({
    wedding: {
      id: wedding.id,
      name: wedding.name,
    },
    uploadUrl: `${env.NEXT_PUBLIC_APP_URL}/upload/${token}`,
  });
}
