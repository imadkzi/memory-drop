import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { decryptSecret } from "@/lib/security/crypto";
import { getEnv } from "@/lib/validation/env";

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

  const wedding = await prisma.wedding.findUnique({ where: { id } });
  if (!wedding?.encryptedUploadToken) {
    return NextResponse.json({ error: "Guest link unavailable." }, { status: 404 });
  }

  const token = decryptSecret(wedding.encryptedUploadToken);
  return NextResponse.json({
    url: `${getEnv().NEXT_PUBLIC_APP_URL}/upload/${token}`,
  });
}
