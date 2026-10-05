import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { logger } from "@/lib/logging/logger";

type Ctx = { params: Promise<{ id: string; adminId: string }> };

export async function DELETE(_request: Request, context: Ctx) {
  const { id, adminId } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const membership = await requireWeddingAccess(session.user.id, id, ["OWNER"]);
  if (!membership) {
    logger.warn("permission_denied", {
      userId: session.user.id,
      weddingId: id,
      action: "remove_admin",
    });
    return NextResponse.json({ error: "Only the owner can manage administrators." }, { status: 403 });
  }

  const target = await prisma.weddingAdmin.findFirst({
    where: { id: adminId, weddingId: id },
  });
  if (!target) {
    return NextResponse.json({ error: "Administrator not found." }, { status: 404 });
  }
  if (target.role === "OWNER") {
    return NextResponse.json({ error: "The owner cannot be removed." }, { status: 403 });
  }

  await prisma.weddingAdmin.delete({ where: { id: adminId } });
  return NextResponse.json({ ok: true });
}
