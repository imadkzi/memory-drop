import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { tryDecryptSecret } from "@/lib/security/crypto";
import { guestUploadUrl } from "@/lib/weddings/upload-token";

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

  const wedding = await prisma.wedding.findUnique({ where: { id } });
  if (!wedding?.encryptedUploadToken) {
    return NextResponse.json(
      { error: "Guest link unavailable." },
      { status: 404 },
    );
  }

  const token = tryDecryptSecret(wedding.encryptedUploadToken);
  if (!token) {
    return NextResponse.json(
      { error: "Create a new guest link from the sharing page." },
      { status: 409 },
    );
  }

  const url = guestUploadUrl(token);
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 2,
    width: 512,
    color: { dark: "#3a322c", light: "#ffffff" },
  });

  return NextResponse.json({ dataUrl, url });
}
