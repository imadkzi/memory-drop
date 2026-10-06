import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PassThrough, Readable } from "stream";
import { ZipArchive } from "archiver";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { requireWeddingAccess } from "@/lib/auth/session";
import { getStorageForWedding } from "@/lib/storage";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string }> };

const zipSchema = z.object({
  ids: z.array(z.string().min(1)).max(100).optional(),
});

function toNodeStream(
  stream: ReadableStream<Uint8Array> | NodeJS.ReadableStream,
): Readable {
  if (typeof (stream as ReadableStream).getReader === "function") {
    return Readable.fromWeb(
      stream as import("stream/web").ReadableStream<Uint8Array>,
    );
  }
  return stream as unknown as Readable;
}

export async function POST(request: Request, context: Ctx) {
  const { id: weddingId } = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const membership = await requireWeddingAccess(session.user.id, weddingId);
  if (!membership) {
    return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = zipSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid download request." }, { status: 400 });
  }

  const media = await prisma.media.findMany({
    where: {
      weddingId,
      status: "READY",
      ...(parsed.data.ids?.length ? { id: { in: parsed.data.ids } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (!media.length) {
    return NextResponse.json({ error: "No memories to download." }, { status: 404 });
  }

  let storage;
  try {
    ({ storage } = await getStorageForWedding(weddingId));
  } catch {
    return NextResponse.json(
      { error: "Google Drive is not connected for this wedding." },
      { status: 503 },
    );
  }

  const passThrough = new PassThrough();
  const archive = new ZipArchive({ zlib: { level: 1 } });
  archive.on("error", (error: Error) => {
    logger.error("media_zip_failed", {
      weddingId,
      error: error.message,
    });
    passThrough.destroy(error);
  });
  archive.pipe(passThrough);

  const usedNames = new Map<string, number>();

  void (async () => {
    try {
      for (const item of media) {
        if (!item.driveFileId) continue;
        try {
          const fileStream = await storage.downloadFile(item.driveFileId);
          let name = item.filename.replace(/[/\\]/g, "-") || `memory-${item.id}`;
          const count = usedNames.get(name) ?? 0;
          usedNames.set(name, count + 1);
          if (count > 0) {
            const dot = name.lastIndexOf(".");
            name =
              dot > 0
                ? `${name.slice(0, dot)}-${count}${name.slice(dot)}`
                : `${name}-${count}`;
          }
          archive.append(toNodeStream(fileStream), { name });
        } catch (error) {
          logger.error("media_zip_file_failed", {
            mediaId: item.id,
            error: error instanceof Error ? error.message : "unknown",
          });
        }
      }
      await archive.finalize();
    } catch (error) {
      logger.error("media_zip_build_failed", {
        weddingId,
        error: error instanceof Error ? error.message : "unknown",
      });
      archive.abort();
      passThrough.destroy(
        error instanceof Error ? error : new Error("Zip failed"),
      );
    }
  })();

  logger.info("media_zip_started", {
    weddingId,
    userId: session.user.id,
    count: media.length,
  });

  const webStream = Readable.toWeb(passThrough) as ReadableStream;
  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="memory-drop-${weddingId.slice(0, 8)}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
