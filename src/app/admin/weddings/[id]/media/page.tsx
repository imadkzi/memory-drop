import { notFound } from "next/navigation";
import Link from "next/link";
import { MediaGallery } from "@/components/admin/media-gallery";
import { requireSession, requireWeddingAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; cursor?: string }>;
};

export default async function WeddingMediaPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type, cursor } = await searchParams;
  const session = await requireSession();
  const membership = await requireWeddingAccess(session.user.id, id);
  if (!membership) notFound();

  const wedding = await prisma.wedding.findUnique({ where: { id } });
  if (!wedding) notFound();

  const mediaType = type === "PHOTO" || type === "VIDEO" ? type : undefined;

  const take = 48;
  const media = await prisma.media.findMany({
    where: {
      weddingId: id,
      status: "READY",
      ...(mediaType ? { mediaType } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl tracking-tight text-ink">
          Photos &amp; Videos
        </h1>
        <p className="mt-2 max-w-lg font-sans text-muted-foreground">
          All uploads from your guests, saved directly to your Google Drive.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
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

      <MediaGallery
        weddingId={id}
        items={serialized}
        nextCursor={nextCursor}
        type={mediaType}
      />
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
