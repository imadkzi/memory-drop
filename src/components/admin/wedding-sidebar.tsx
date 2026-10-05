"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardDrive, Images, Link2, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function WeddingSidebar({
  weddingId,
  weddingName,
  driveConnected,
  subtitle,
}: {
  weddingId: string;
  weddingName: string;
  driveConnected: boolean;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const base = `/admin/weddings/${weddingId}`;

  const items = [
    { href: `${base}/media`, label: "Photos & Videos", icon: Images, key: "media" },
    { href: `${base}/sharing`, label: "Link & Sharing", icon: Link2, key: "sharing" },
    { href: `${base}/settings`, label: "Settings", icon: Settings, key: "settings" },
    { href: `${base}/admins`, label: "Team", icon: Users, key: "admins" },
  ] as const;

  return (
    <aside className="flex w-full flex-col gap-4 md:sticky md:top-6 md:w-64 md:shrink-0">
      <div className="rounded-2xl border border-ink/8 bg-white/90 p-5 shadow-[0_12px_40px_-28px_rgba(40,20,20,0.28)]">
        <p className="font-serif text-2xl tracking-tight text-ink">{weddingName}</p>
        {subtitle ? (
          <p className="mt-1 font-sans text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <nav className="rounded-2xl border border-ink/8 bg-white/90 p-2 shadow-[0_12px_40px_-28px_rgba(40,20,20,0.2)]">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.key === "media"
              ? pathname.includes("/media") || pathname === base
              : pathname.includes(`/${item.key}`);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-sm transition",
                active
                  ? "bg-bloom-soft font-medium text-bloom"
                  : "text-ink/70 hover:bg-ink/5 hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href={`${base}/settings`}
        className="rounded-2xl border border-ink/8 bg-white/90 p-4 shadow-[0_12px_40px_-28px_rgba(40,20,20,0.2)] transition hover:border-ink/15 md:mt-auto"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg",
              driveConnected ? "bg-bloom-soft text-bloom" : "bg-ink/5 text-ink/45",
            )}
          >
            <HardDrive className="size-5" strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <p className="font-sans text-sm font-medium text-ink">Google Drive</p>
            <p
              className={cn(
                "truncate font-sans text-xs",
                driveConnected ? "text-bloom" : "text-muted-foreground",
              )}
            >
              {driveConnected ? "Connected" : "Not connected"}
            </p>
          </div>
        </div>
      </Link>
    </aside>
  );
}
