import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/home/brand-mark";

export const LEGAL_CONTACT = "hello@imadkazi.co.uk";

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="light-wash min-h-screen text-ink">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="inline-flex">
            <BrandMark src="/brand/logo-bloom.webp" />
          </Link>
          <nav className="flex gap-4 text-sm text-ink/70">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
          </nav>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm tracking-[0.18em] text-bloom uppercase">
          Last updated 6 October 2026
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
          {description}
        </p>
        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink/80 sm:text-base [&_a]:text-bloom [&_a]:underline-offset-4 [&_a]:hover:underline [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:text-ink [&_h2]:first:mt-0 [&_li]:pl-1 [&_p]:mt-3 [&_p]:first:mt-0 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </main>
  );
}
