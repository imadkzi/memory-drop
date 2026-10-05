import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import type { WeddingAdminRole } from "@/generated/prisma/client";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function getWeddingMembership(userId: string, weddingId: string) {
  return prisma.weddingAdmin.findUnique({
    where: {
      weddingId_userId: { weddingId, userId },
    },
  });
}

export async function requireWeddingAccess(
  userId: string,
  weddingId: string,
  roles?: WeddingAdminRole[],
) {
  const membership = await getWeddingMembership(userId, weddingId);
  if (!membership) {
    return null;
  }
  if (roles && !roles.includes(membership.role)) {
    return null;
  }
  return membership;
}

export function isOwner(role: WeddingAdminRole) {
  return role === "OWNER";
}
