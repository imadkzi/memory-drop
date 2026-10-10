import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { signOutAction } from "@/components/admin/sign-out-action";

export async function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const session = await requireSession();
  return (
    <>
      <header className="border-b border-ink/10 bg-[#faf6f2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4 md:gap-6">
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
            {title ? (
              <span className="truncate font-sans text-sm text-muted-foreground">
                {title}
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3 font-sans text-sm text-muted-foreground">
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="border border-ink/10 bg-white p-6 sm:p-8">{children}</div>
      </div>
    </>
  );
}
