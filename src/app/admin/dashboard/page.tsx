import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CreateWeddingForm } from "@/components/admin/create-wedding-form";
import { cn } from "@/lib/utils";

function formatEventDate(date: Date | null) {
  if (!date) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const memberships = await prisma.weddingAdmin.findMany({
    where: { userId: session.user.id },
    include: {
      wedding: {
        include: {
          _count: {
            select: {
              media: { where: { status: "READY" } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-8">
        <div className="border-b border-ink/10 pb-8">
          <div className="chapter-rule mb-5 bg-ink" />
          <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">
            Your events
          </h1>
          <p className="mt-3 max-w-lg font-sans text-base leading-relaxed text-ink/60">
            Private collections for the people who matter.
          </p>
        </div>

        <CreateWeddingForm />

        {memberships.length === 0 ? (
          <div className="border border-dashed border-ink/15 px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">No events yet</p>
            <p className="mt-2 font-sans text-ink/55">
              Create your first collection above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {memberships.map(({ wedding, role }) => {
              const eventDate = formatEventDate(wedding.eventDate);
              const driveConnected = Boolean(wedding.driveFolderId);
              return (
                <li
                  key={wedding.id}
                  className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-sans text-xs text-ink/45">{role}</p>
                    <h2 className="mt-1 font-serif text-2xl tracking-tight text-ink">
                      {wedding.name}
                    </h2>
                    <p className="mt-1 font-sans text-sm text-ink/55">
                      {eventDate ?? "Event date not set"}
                      {" · "}
                      {wedding._count.media}{" "}
                      {wedding._count.media === 1 ? "memory" : "memories"}
                      {" · "}
                      <span
                        className={cn(
                          driveConnected ? "text-bloom" : "text-ink/40",
                        )}
                      >
                        {driveConnected ? "Drive connected" : "Drive not connected"}
                      </span>
                    </p>
                  </div>

                  <Button
                    nativeButton={false}
                    render={<Link href={`/admin/weddings/${wedding.id}/media`} />}
                    className="h-10 shrink-0 bg-bloom px-5 font-semibold text-white hover:bg-bloom/90"
                  >
                    Open
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
