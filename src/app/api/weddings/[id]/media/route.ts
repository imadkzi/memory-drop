import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";

type Ctx = { params: Promise<{ id: string }> };

const PAGE_SIZE = 48;

export async function GET(request: Request, context: Ctx) {
  const { id } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const membership = await requireWeddingAccess(session.user.id, id);
  if (!membership) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const cursor = url.searchParams.get("cursor");
  const mediaType = type === "PHOTO" || type === "VIDEO" ? type : undefined;

  const media = await prisma.media.findMany({
    where: {
      weddingId: id,
      status: "READY",
      ...(mediaType ? { mediaType } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = media.length > PAGE_SIZE;
  const page = hasMore ? media.slice(0, PAGE_SIZE) : media;
  const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null;

  return NextResponse.json({
    items: page.map((item) => ({
      id: item.id,
      filename: item.filename,
      mediaType: item.mediaType,
      mimeType: item.mimeType,
      size: Number(item.size),
      createdAt: item.createdAt.toISOString(),
    })),
    nextCursor,
  });
}
