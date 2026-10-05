import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { encryptSecret, generateUploadToken, hashUploadToken } from "@/lib/security/crypto";
import { getEnv } from "@/lib/validation/env";
import { logger } from "@/lib/logging/logger";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const membership = await requireWeddingAccess(session.user.id, id, ["OWNER"]);
  if (!membership) {
    logger.warn("permission_denied", {
      userId: session.user.id,
      weddingId: id,
      action: "regenerate_token",
    });
    return NextResponse.json({ error: "Only the owner can regenerate the upload link." }, { status: 403 });
  }

  const token = generateUploadToken();
  await prisma.wedding.update({
    where: { id },
    data: {
      uploadTokenHash: hashUploadToken(token),
      encryptedUploadToken: encryptSecret(token),
    },
  });

  logger.info("upload_token_regenerated", { weddingId: id, userId: session.user.id });

  return NextResponse.json({
    url: `${getEnv().NEXT_PUBLIC_APP_URL}/upload/${token}`,
  });
}
