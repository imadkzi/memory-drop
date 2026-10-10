"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function GoogleDriveLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 87.3 78"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        fill="#0066da"
        d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z"
      />
      <path
        fill="#00ac47"
        d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.25c-.8 1.4-1.2 2.95-1.2 4.5h27.5z"
      />
      <path
        fill="#ea4335"
        d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.85L73.55 76.8z"
      />
      <path
        fill="#00832d"
        d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z"
      />
      <path
        fill="#2684fc"
        d="M59.85 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
      />
      <path
        fill="#ffba00"
        d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.85 53h27.45c0-1.55-.4-3.1-1.2-4.5z"
      />
    </svg>
  );
}

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
    { href: `${base}/media`, label: "Photos & Videos", key: "media" },
    { href: `${base}/sharing`, label: "Link & Sharing", key: "sharing" },
    { href: `${base}/settings`, label: "Settings", key: "settings" },
    { href: `${base}/admins`, label: "Team", key: "admins" },
  ] as const;

  return (
    <aside className="flex w-full flex-col gap-3 md:sticky md:top-6 md:w-56 md:shrink-0">
      <div className="border border-ink/10 bg-white p-5">
        <div className="chapter-rule mb-3 bg-ink" />
        <p className="font-serif text-2xl tracking-tight text-ink">
          {weddingName}
        </p>
        {subtitle ? (
          <p className="mt-1 font-sans text-sm text-ink/55">{subtitle}</p>
        ) : null}

        <nav className="mt-5 flex flex-col gap-0.5 border-t border-ink/10 pt-4">
          {items.map((item) => {
            const active =
              item.key === "media"
                ? pathname.includes("/media") || pathname === base
                : pathname.includes(`/${item.key}`);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "border-l-2 px-3 py-2 font-sans text-sm transition",
                  active
                    ? "border-bloom font-medium text-bloom"
                    : "border-transparent text-ink/65 hover:border-ink/20 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Link
        href={`${base}/settings`}
        className="flex items-center gap-3 border border-ink/10 bg-white px-4 py-3.5 transition hover:border-ink/20"
      >
        <GoogleDriveLogo className="size-6 shrink-0" />
        <div className="min-w-0">
          <p className="font-sans text-sm font-medium text-ink">Google Drive</p>
          <p
            className={cn(
              "mt-0.5 font-sans text-xs",
              driveConnected ? "text-bloom" : "text-ink/45",
            )}
          >
            {driveConnected ? "Connected" : "Not connected"}
          </p>
        </div>
      </Link>
    </aside>
  );
}
