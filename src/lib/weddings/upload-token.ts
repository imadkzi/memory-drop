import { prisma } from "@/lib/db/prisma";
import { hashUploadToken } from "@/lib/security/crypto";

export async function findWeddingByUploadToken(token: string) {
  const uploadTokenHash = hashUploadToken(token);
  return prisma.wedding.findFirst({
    where: { uploadTokenHash },
  });
}
