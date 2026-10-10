import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WeddingSidebar } from "@/components/admin/wedding-sidebar";
import { MotionProvider } from "@/components/motion/lazy-provider";
import { signOutAction } from "@/components/admin/sign-out-action";
import { requireSession, requireWeddingAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function WeddingLayout({ children, params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const membership = await requireWeddingAccess(session.user.id, id);
  if (!membership) notFound();

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      eventDate: true,
      driveConnectionId: true,
    },
  });
  if (!wedding) notFound();

  const subtitle = wedding.eventDate
    ? wedding.eventDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "Event date not set";

  return (
    <MotionProvider>
      <header className="border-b border-ink/10 bg-[#faf6f2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/admin/dashboard" className="inline-flex shrink-0">
            <Image
              src="/logo-bloom.webp"
              alt="MemoryDrop"
              width={200}
              height={36}
              className="h-7 w-auto object-contain sm:h-8"
              priority
            />
          </Link>
          <div className="flex items-center gap-3 font-sans text-sm text-muted-foreground">
            <span className="hidden max-w-[10rem] truncate sm:inline">
              {session.user.name}
            </span>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-ink/20 bg-transparent text-ink hover:bg-ink/5"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row md:items-start lg:px-8 lg:py-8">
        <WeddingSidebar
          weddingId={wedding.id}
          weddingName={wedding.name}
          driveConnected={Boolean(wedding.driveConnectionId)}
          subtitle={subtitle}
        />
        <div className="min-w-0 flex-1 border border-ink/10 bg-white p-6 sm:p-8 lg:p-10">
          {children}
        </div>
      </div>
    </MotionProvider>
  );
}
