import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { logger } from "@/lib/logging/logger";
import {
  createOrRefreshAdminInvite,
} from "@/lib/weddings/admin-invite";

type Ctx = { params: Promise<{ id: string; inviteId: string }> };

export async function DELETE(_request: Request, context: Ctx) {
  const { id, inviteId } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const membership = await requireWeddingAccess(session.user.id, id, ["OWNER"]);
  if (!membership) {
    return NextResponse.json(
      { error: "Only the owner can manage administrators." },
      { status: 403 },
    );
  }

  const invite = await prisma.weddingAdminInvite.findFirst({
    where: { id: inviteId, weddingId: id },
  });
  if (!invite || invite.status !== "PENDING") {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  await prisma.weddingAdminInvite.update({
    where: { id: invite.id },
    data: { status: "REVOKED" },
  });

  logger.info("admin_invite_revoked", {
    weddingId: id,
    inviteId: invite.id,
    userId: session.user.id,
  });

  return NextResponse.json({ ok: true });
}

/** Refresh token + expiry and return a new copyable URL. */
export async function POST(_request: Request, context: Ctx) {
  const { id, inviteId } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const membership = await requireWeddingAccess(session.user.id, id, ["OWNER"]);
  if (!membership) {
    return NextResponse.json(
      { error: "Only the owner can manage administrators." },
      { status: 403 },
    );
  }

  const invite = await prisma.weddingAdminInvite.findFirst({
    where: { id: inviteId, weddingId: id },
  });
  if (!invite || invite.status !== "PENDING") {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  const result = await createOrRefreshAdminInvite({
    weddingId: id,
    email: invite.email,
    invitedByUserId: session.user.id,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    invite: result.invite,
    url: result.url,
  });
}
