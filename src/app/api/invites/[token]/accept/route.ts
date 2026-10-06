import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import { normalizeAuthEmail } from "@/lib/security/auth-lockout";
import {
  findInviteByToken,
  inviteIsAcceptable,
} from "@/lib/weddings/admin-invite";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(_request: Request, context: Ctx) {
  const { token } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in to accept this invite." }, { status: 401 });
  }

  const invite = await findInviteByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  if (invite.status === "PENDING" && invite.expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "This invite has expired." }, { status: 410 });
  }

  const check = inviteIsAcceptable(invite);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 410 });
  }

  const sessionEmail = normalizeAuthEmail(session.user.email);
  if (sessionEmail !== invite.email) {
    return NextResponse.json(
      {
        error: `Sign in as ${invite.email} to accept this invite.`,
      },
      { status: 403 },
    );
  }

  const existing = await prisma.weddingAdmin.findUnique({
    where: {
      weddingId_userId: {
        weddingId: invite.weddingId,
        userId: session.user.id,
      },
    },
  });
  if (existing) {
    await prisma.weddingAdminInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
    return NextResponse.json({
      ok: true,
      weddingId: invite.weddingId,
      alreadyMember: true,
    });
  }

  await prisma.$transaction([
    prisma.weddingAdmin.create({
      data: {
        weddingId: invite.weddingId,
        userId: session.user.id,
        role: "ADMIN",
      },
    }),
    prisma.weddingAdminInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    }),
  ]);

  logger.info("admin_invite_accepted", {
    inviteId: invite.id,
    weddingId: invite.weddingId,
    userId: session.user.id,
  });

  return NextResponse.json({
    ok: true,
    weddingId: invite.weddingId,
    alreadyMember: false,
  });
}
