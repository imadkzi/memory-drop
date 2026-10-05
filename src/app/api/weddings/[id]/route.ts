import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { updateWeddingSettingsSchema } from "@/lib/validation/schemas";
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
    logger.warn("permission_denied", { userId: session.user.id, weddingId: id, action: "get" });
    return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
  }

  const wedding = await prisma.wedding.findUnique({ where: { id } });
  if (!wedding) {
    return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
  }

  return NextResponse.json({
    wedding: {
      id: wedding.id,
      name: wedding.name,
      uploadEnabled: wedding.uploadEnabled,
      driveConnected: Boolean(wedding.driveConnectionId),
      role: membership.role,
    },
  });
}

export async function PATCH(request: Request, context: Ctx) {
  const { id } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const membership = await requireWeddingAccess(session.user.id, id);
  if (!membership) {
    return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateWeddingSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings." }, { status: 400 });
  }

  const { eventDate, ...rest } = parsed.data;
  const wedding = await prisma.wedding.update({
    where: { id },
    data: {
      ...rest,
      ...(eventDate !== undefined
        ? { eventDate: eventDate ? new Date(`${eventDate}T00:00:00.000Z`) : null }
        : {}),
    },
  });

  return NextResponse.json({
    wedding: {
      id: wedding.id,
      name: wedding.name,
      uploadEnabled: wedding.uploadEnabled,
      eventDate: wedding.eventDate
        ? wedding.eventDate.toISOString().slice(0, 10)
        : null,
    },
  });
}
