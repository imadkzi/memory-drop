import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  findInviteByToken,
  inviteIsAcceptable,
} from "@/lib/weddings/admin-invite";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { token } = await context.params;
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

  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
    select: { id: true },
  });

  return NextResponse.json({
    invite: {
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt.toISOString(),
      weddingName: invite.wedding.name,
      weddingId: invite.wedding.id,
      accountExists: Boolean(existingUser),
    },
  });
}
