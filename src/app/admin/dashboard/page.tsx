import Link from "next/link";
import { HardDrive } from "lucide-react";
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
      <div className="space-y-6">
        <div className="rounded-2xl border border-ink/8 bg-white/95 p-6 shadow-[0_12px_40px_-28px_rgba(40,20,20,0.25)] sm:p-8 lg:p-10">
          <p className="font-sans text-[11px] tracking-[0.28em] text-bloom uppercase">
            Collections
          </p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink sm:text-5xl">
            Your weddings
          </h1>
          <p className="mt-4 max-w-lg font-sans text-base leading-relaxed text-muted-foreground">
            Private collections for the people who matter.
          </p>
        </div>

        <CreateWeddingForm />

        {memberships.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/70 px-6 py-16 text-center shadow-[0_12px_40px_-28px_rgba(40,20,20,0.15)]">
            <p className="font-serif text-2xl text-ink">No weddings yet</p>
            <p className="mt-2 font-sans text-muted-foreground">
              Create your first collection above.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map(({ wedding, role }) => {
              const eventDate = formatEventDate(wedding.eventDate);
              const driveConnected = Boolean(wedding.driveFolderId);
              return (
                <li
                  key={wedding.id}
                  className="flex flex-col rounded-2xl border border-ink/8 bg-white/95 p-6 shadow-[0_12px_40px_-28px_rgba(40,20,20,0.25)]"
                >
                  <p className="font-sans text-[11px] tracking-[0.2em] text-ink/40 uppercase">
                    {role}
                  </p>
                  <h2 className="mt-3 font-serif text-2xl tracking-tight text-ink">
                    {wedding.name}
                  </h2>
                  <p className="mt-2 font-sans text-sm text-muted-foreground">
                    {eventDate ?? "Event date not set"}
                  </p>
                  <p className="mt-1 font-sans text-sm text-muted-foreground">
                    {wedding._count.media}{" "}
                    {wedding._count.media === 1 ? "memory" : "memories"}
                  </p>

                  <div className="mt-5 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-lg",
                        driveConnected
                          ? "bg-bloom-soft text-bloom"
                          : "bg-ink/5 text-ink/40",
                      )}
                    >
                      <HardDrive className="size-4" strokeWidth={1.6} />
                    </span>
                    <span
                      className={cn(
                        "font-sans text-xs",
                        driveConnected ? "text-bloom" : "text-muted-foreground",
                      )}
                    >
                      {driveConnected ? "Drive connected" : "Drive not connected"}
                    </span>
                  </div>

                  <div className="mt-auto pt-6">
                    <Button
                      nativeButton={false}
                      render={<Link href={`/admin/weddings/${wedding.id}/media`} />}
                      className="h-11 bg-bloom px-5 font-semibold text-white hover:bg-bloom/90"
                    >
                      Open
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
