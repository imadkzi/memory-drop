import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { addAdminSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const membership = await requireWeddingAccess(session.user.id, id);
  if (!membership) {
    return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
  }

  const admins = await prisma.weddingAdmin.findMany({
    where: { weddingId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({
    admins: admins.map((admin) => ({
      id: admin.id,
      role: admin.role,
      user: admin.user,
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
    logger.warn("permission_denied", { userId: session.user.id, weddingId: id, action: "add_admin" });
    return NextResponse.json({ error: "Only the owner can manage administrators." }, { status: 403 });
  }

  const parsed = addAdminSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json(
      { error: "No account found with that email. Ask them to register first." },
      { status: 404 },
    );
  }

  const existing = await prisma.weddingAdmin.findUnique({
    where: { weddingId_userId: { weddingId: id, userId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "That person is already an administrator." }, { status: 409 });
  }

  const admin = await prisma.weddingAdmin.create({
    data: {
      weddingId: id,
      userId: user.id,
      role: "ADMIN",
    },
  });

  return NextResponse.json({ admin: { id: admin.id, role: admin.role, userId: user.id } });
}
