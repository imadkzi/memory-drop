import { prisma } from "@/lib/db/prisma";
import {
  generateInviteToken,
  hashInviteToken,
} from "@/lib/security/crypto";
import { getEnv } from "@/lib/validation/env";
import { normalizeAuthEmail } from "@/lib/security/auth-lockout";

export const ADMIN_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function inviteUrl(token: string) {
  return `${getEnv().NEXT_PUBLIC_APP_URL}/invite/${token}`;
}

export async function createOrRefreshAdminInvite(input: {
  weddingId: string;
  email: string;
  invitedByUserId: string;
}) {
  const email = normalizeAuthEmail(input.email);
  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + ADMIN_INVITE_TTL_MS);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const membership = await prisma.weddingAdmin.findUnique({
      where: {
        weddingId_userId: {
          weddingId: input.weddingId,
          userId: existingUser.id,
        },
      },
    });
    if (membership) {
      return { error: "That person is already an administrator." as const, status: 409 as const };
    }
  }

  const pending = await prisma.weddingAdminInvite.findFirst({
    where: {
      weddingId: input.weddingId,
      email,
      status: "PENDING",
    },
  });

  const invite = pending
    ? await prisma.weddingAdminInvite.update({
        where: { id: pending.id },
        data: {
          tokenHash,
          expiresAt,
          invitedByUserId: input.invitedByUserId,
          role: "ADMIN",
        },
      })
    : await prisma.weddingAdminInvite.create({
        data: {
          weddingId: input.weddingId,
          email,
          role: "ADMIN",
          tokenHash,
          expiresAt,
          invitedByUserId: input.invitedByUserId,
          status: "PENDING",
        },
      });

  return {
    invite: {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString(),
    },
    url: inviteUrl(token),
    refreshed: Boolean(pending),
  };
}

export async function findInviteByToken(token: string) {
  const tokenHash = hashInviteToken(token);
  return prisma.weddingAdminInvite.findUnique({
    where: { tokenHash },
    include: {
      wedding: { select: { id: true, name: true } },
    },
  });
}

export function inviteIsAcceptable(
  invite: {
    status: string;
    expiresAt: Date;
  },
  now = new Date(),
) {
  if (invite.status !== "PENDING") {
    return { ok: false as const, reason: "This invite is no longer valid." };
  }
  if (invite.expiresAt.getTime() <= now.getTime()) {
    return { ok: false as const, reason: "This invite has expired." };
  }
  return { ok: true as const };
}
