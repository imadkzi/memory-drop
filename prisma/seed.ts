import "dotenv/config";
import { auth } from "../src/lib/auth/auth";
import { prisma } from "../src/lib/db/prisma";
import { encryptSecret, generateUploadToken, hashUploadToken, generateSlug } from "../src/lib/security/crypto";
import { getEnv } from "../src/lib/validation/env";

async function main() {
  const env = getEnv();
  const email = "dev@example.com";
  const password = "password123";
  const name = "Development User";

  const existing = await prisma.user.findUnique({ where: { email } });
  let userId = existing?.id;

  if (!userId) {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });
    if (!result.user) {
      throw new Error("Failed to create development user");
    }
    userId = result.user.id;
    console.log("Created development user:", email);
  } else {
    console.log("Development user already exists:", email);
  }

  const existingWedding = await prisma.wedding.findFirst({
    where: { ownerId: userId, name: "Development Wedding" },
  });

  if (existingWedding) {
    console.log("Development wedding already exists:", existingWedding.id);
    console.log("Sign in with", email, "/", password);
    console.log("Note: Connect Google Drive via the UI: no fake Drive credentials are seeded.");
    return;
  }

  const token = generateUploadToken();
  const wedding = await prisma.wedding.create({
    data: {
      name: "Development Wedding",
      slug: generateSlug("Development Wedding"),
      ownerId: userId!,
      uploadTokenHash: hashUploadToken(token),
      encryptedUploadToken: encryptSecret(token),
      maxPhotoSizeBytes: env.MAX_PHOTO_SIZE_BYTES,
      maxVideoSizeBytes: env.MAX_VIDEO_SIZE_BYTES,
      admins: {
        create: {
          userId: userId!,
          role: "OWNER",
        },
      },
    },
  });

  console.log("Created development wedding:", wedding.id);
  console.log("Guest upload URL:", `${env.NEXT_PUBLIC_APP_URL}/upload/${token}`);
  console.log("Sign in with", email, "/", password);
  console.log("Note: Connect Google Drive via the UI: no fake Drive credentials are seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
