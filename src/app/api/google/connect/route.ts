import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth/auth";
import { getGoogleAuthUrl } from "@/lib/google/oauth";
import { getEnv } from "@/lib/validation/env";
import { logger } from "@/lib/logging/logger";
import { requireWeddingAccess } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", getEnv().NEXT_PUBLIC_APP_URL));
  }

  const weddingId = new URL(request.url).searchParams.get("weddingId");
  if (!weddingId) {
    return NextResponse.json({ error: "Missing event." }, { status: 400 });
  }

  const membership = await requireWeddingAccess(session.user.id, weddingId, ["OWNER"]);
  if (!membership) {
    return NextResponse.json({ error: "Only the owner can connect Google Drive." }, { status: 403 });
  }

  const env = getEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." },
      { status: 503 },
    );
  }

  const state = Buffer.from(
    JSON.stringify({
      weddingId,
      userId: session.user.id,
      nonce: randomBytes(16).toString("hex"),
    }),
  ).toString("base64url");

  const url = getGoogleAuthUrl(state);
  logger.info("google_oauth_start", { userId: session.user.id, weddingId });
  return NextResponse.redirect(url);
}
