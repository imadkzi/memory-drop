import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createGoogleOAuthClient } from "@/lib/google/oauth";
import { encryptSecret } from "@/lib/security/crypto";
import { GoogleDriveStorageProvider } from "@/lib/storage/google-drive";
import { getEnv } from "@/lib/validation/env";
import { logger } from "@/lib/logging/logger";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  const appUrl = getEnv().NEXT_PUBLIC_APP_URL;

  if (!code || !stateRaw) {
    return NextResponse.redirect(`${appUrl}/admin/dashboard?drive=error`);
  }

  let state: { weddingId: string; userId: string };
  try {
    state = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf8"));
  } catch {
    return NextResponse.redirect(`${appUrl}/admin/dashboard?drive=error`);
  }

  try {
    const client = createGoogleOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.access_token || !tokens.refresh_token) {
      logger.error("google_oauth_missing_tokens", { userId: state.userId });
      return NextResponse.redirect(`${appUrl}/admin/weddings/${state.weddingId}/settings?drive=reconnect`);
    }

    const expiresAt = new Date(tokens.expiry_date ?? Date.now() + 3600_000);
    const storage = new GoogleDriveStorageProvider({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    });

    const wedding = await prisma.wedding.findUnique({ where: { id: state.weddingId } });
    if (!wedding || wedding.ownerId !== state.userId) {
      return NextResponse.redirect(`${appUrl}/admin/dashboard?drive=error`);
    }

    const folders = await storage.createWeddingFolder(wedding.name);

    const connection = await prisma.googleDriveConnection.create({
      data: {
        userId: state.userId,
        encryptedAccessToken: encryptSecret(tokens.access_token),
        encryptedRefreshToken: encryptSecret(tokens.refresh_token),
        expiresAt,
        rootFolderId: folders.rootFolderId,
      },
    });

    await prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        driveConnectionId: connection.id,
        driveFolderId: folders.folderId,
      },
    });

    logger.info("google_oauth_connected", {
      userId: state.userId,
      weddingId: wedding.id,
      connectionId: connection.id,
    });

    return NextResponse.redirect(`${appUrl}/admin/weddings/${wedding.id}/settings?drive=connected`);
  } catch (error) {
    logger.error("google_oauth_callback_failed", {
      error: error instanceof Error ? error.message : "unknown",
      userId: state.userId,
    });
    return NextResponse.redirect(`${appUrl}/admin/weddings/${state.weddingId}/settings?drive=error`);
  }
}
