import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { addAdminSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import { createOrRefreshAdminInvite } from "@/lib/weddings/admin-invite";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const membership = await requireWeddingAccess(session.user.id, id);
  if (!membership) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const admins = await prisma.weddingAdmin.findMany({
    where: { weddingId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const invites = await prisma.weddingAdminInvite.findMany({
    where: { weddingId: id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    admins: admins.map((admin) => ({
      id: admin.id,
      role: admin.role,
      user: admin.user,
    })),
    invites: invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request, context: Ctx) {
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
      action: "invite_admin",
    });
    return NextResponse.json(
      { error: "Only the owner can manage administrators." },
      { status: 403 },
    );
  }

  const parsed = addAdminSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }

  const result = await createOrRefreshAdminInvite({
    weddingId: id,
    email: parsed.data.email,
    invitedByUserId: session.user.id,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  logger.info("admin_invite_created", {
    weddingId: id,
    inviteId: result.invite.id,
    userId: session.user.id,
    refreshed: result.refreshed,
  });

  return NextResponse.json({
    invite: result.invite,
    url: result.url,
    refreshed: result.refreshed,
  });
}
