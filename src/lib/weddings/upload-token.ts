import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import {
  encryptSecret,
  generateUploadToken,
  hashUploadToken,
} from "@/lib/security/crypto";
import { getEnv } from "@/lib/validation/env";

export async function findWeddingByUploadToken(token: string) {
  const uploadTokenHash = hashUploadToken(token);
  return prisma.wedding.findFirst({
    where: { uploadTokenHash },
  });
}

export function guestUploadUrl(token: string) {
  return `${getEnv().NEXT_PUBLIC_APP_URL}/upload/${token}`;
}

export async function issueUploadToken(weddingId: string, userId?: string) {
  const token = generateUploadToken();
  await prisma.wedding.update({
    where: { id: weddingId },
    data: {
      uploadTokenHash: hashUploadToken(token),
      encryptedUploadToken: encryptSecret(token),
    },
  });
  logger.info("upload_token_regenerated", { weddingId, userId });
  return token;
}
