import { notFound } from "next/navigation";
import Link from "next/link";
import { MediaGallery } from "@/components/admin/media-gallery";
import { requireSession, requireWeddingAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function WeddingMediaPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type } = await searchParams;
  const session = await requireSession();
  const membership = await requireWeddingAccess(session.user.id, id);
  if (!membership) notFound();

  const wedding = await prisma.wedding.findUnique({ where: { id } });
  if (!wedding) notFound();

  const driveConnected = Boolean(
    wedding.driveConnectionId && wedding.driveFolderId,
  );

  const mediaType = type === "PHOTO" || type === "VIDEO" ? type : undefined;

  const take = 48;
  const media = await prisma.media.findMany({
    where: {
      weddingId: id,
      status: "READY",
      ...(mediaType ? { mediaType } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
  });

  const hasMore = media.length > take;
  const page = hasMore ? media.slice(0, take) : media;
  const nextCursor = hasMore ? page[page.length - 1]?.id : null;

  const serialized = page.map((item) => ({
    id: item.id,
    filename: item.filename,
    mediaType: item.mediaType,
    mimeType: item.mimeType,
    size: Number(item.size),
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <div className="rounded-2xl border border-ink/8 bg-white/95 p-6 shadow-[0_12px_40px_-28px_rgba(40,20,20,0.25)] sm:p-8 lg:p-10">
      <div>
        <h1 className="font-serif text-4xl tracking-tight text-ink">
          Photos &amp; Videos
        </h1>
        <p className="mt-2 max-w-lg font-sans text-muted-foreground">
          All uploads from your guests, saved directly to your Google Drive.
        </p>
      </div>

      {!driveConnected ? (
        <div className="mt-6 rounded-2xl border border-bloom/20 bg-bloom-soft/70 px-5 py-4">
          <p className="font-sans text-sm font-medium text-ink">
            Google Drive is not connected
          </p>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            Guests can&apos;t upload until Drive is connected. Connect it in
            Settings before sharing your link.
          </p>
          <Link
            href={`/admin/weddings/${id}/settings`}
            className="mt-3 inline-flex h-10 items-center rounded-md bg-bloom px-4 font-sans text-sm font-semibold text-white hover:bg-bloom/90"
          >
            Open settings
          </Link>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
        <div className="flex gap-5">
          <FilterTab
            href={`/admin/weddings/${id}/media`}
            active={!mediaType}
            label="All"
          />
          <FilterTab
            href={`/admin/weddings/${id}/media?type=PHOTO`}
            active={mediaType === "PHOTO"}
            label="Photos"
          />
          <FilterTab
            href={`/admin/weddings/${id}/media?type=VIDEO`}
            active={mediaType === "VIDEO"}
            label="Videos"
          />
        </div>
        <p className="font-sans text-sm text-muted-foreground">Newest first</p>
      </div>

      <div className="mt-6">
        <MediaGallery
          key={mediaType ?? "all"}
          weddingId={id}
          items={serialized}
          nextCursor={nextCursor}
          type={mediaType}
        />
      </div>
    </div>
  );
}

function FilterTab({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "border-b-2 border-bloom pb-2 font-sans text-sm font-medium text-bloom"
          : "pb-2 font-sans text-sm text-muted-foreground hover:text-ink"
      }
    >
      {label}
    </Link>
  );
}
