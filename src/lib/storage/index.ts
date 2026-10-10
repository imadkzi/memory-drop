import { prisma } from "@/lib/db/prisma";
import { decryptSecret } from "@/lib/security/crypto";
import { GoogleDriveStorageProvider } from "@/lib/storage/google-drive";
import type { StorageProvider } from "@/lib/storage/types";

export async function getStorageForConnection(
  connectionId: string,
): Promise<StorageProvider> {
  const connection = await prisma.googleDriveConnection.findUnique({
    where: { id: connectionId },
  });
  if (!connection) {
    throw new Error("Google Drive is not connected");
  }

  return new GoogleDriveStorageProvider({
    accessToken: decryptSecret(connection.encryptedAccessToken),
    refreshToken: decryptSecret(connection.encryptedRefreshToken),
    expiresAt: connection.expiresAt,
  });
}

export async function getStorageForWedding(weddingId: string): Promise<{
  storage: StorageProvider;
  folderId: string;
  connectionId: string;
}> {
  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: {
      driveFolderId: true,
      driveConnectionId: true,
    },
  });

  if (!wedding?.driveConnectionId || !wedding.driveFolderId) {
    throw new Error("Google Drive is not connected for this event");
  }

  const storage = await getStorageForConnection(wedding.driveConnectionId);
  return {
    storage,
    folderId: wedding.driveFolderId,
    connectionId: wedding.driveConnectionId,
  };
}
