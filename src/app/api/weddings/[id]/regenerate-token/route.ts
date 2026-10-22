import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { requireWeddingAccess } from "@/lib/auth/session";
import { logger } from "@/lib/logging/logger";
import { guestUploadUrl, issueUploadToken } from "@/lib/weddings/upload-token";

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

  const token = await issueUploadToken(id, session.user.id);

  return NextResponse.json({
    url: guestUploadUrl(token),
  });
}
