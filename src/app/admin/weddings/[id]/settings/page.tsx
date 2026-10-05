import { notFound } from "next/navigation";
import { WeddingSettingsForm } from "@/components/admin/wedding-settings-form";
import { requireSession, requireWeddingAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function WeddingSettingsPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const membership = await requireWeddingAccess(session.user.id, id);
  if (!membership) notFound();

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    include: { driveConnection: true },
  });
  if (!wedding) notFound();

  return (
    <div className="max-w-2xl rounded-2xl border border-ink/8 bg-white/95 p-6 shadow-[0_12px_40px_-28px_rgba(40,20,20,0.25)] sm:p-8 lg:p-10">
      <p className="font-sans text-[11px] tracking-[0.28em] text-bloom uppercase">
        Collection
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">
        Settings
      </h1>
      <p className="mt-4 font-sans text-muted-foreground">{wedding.name}</p>

      <div className="mt-12">
        <WeddingSettingsForm
          wedding={{
            id: wedding.id,
            name: wedding.name,
            eventDate: wedding.eventDate
              ? wedding.eventDate.toISOString().slice(0, 10)
              : null,
            uploadEnabled: wedding.uploadEnabled,
            maxPhotoSizeBytes: wedding.maxPhotoSizeBytes,
            maxVideoSizeBytes: wedding.maxVideoSizeBytes,
            driveConnected: Boolean(wedding.driveConnectionId),
            isOwner: membership.role === "OWNER",
          }}
        />
      </div>
    </div>
  );
}
