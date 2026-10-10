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
    <div className="space-y-10">
      <header className="border-b border-ink/10 pb-8">
        <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">
          Settings
        </h1>
        <p className="mt-3 max-w-xl font-sans text-base leading-relaxed text-ink/60">
          Manage your event details and storage settings.
        </p>
      </header>

      <div>
        <WeddingSettingsForm
          wedding={{
            id: wedding.id,
            name: wedding.name,
            eventDate: wedding.eventDate
              ? wedding.eventDate.toISOString().slice(0, 10)
              : null,
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
