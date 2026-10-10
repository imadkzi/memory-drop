"use client";

import Link from "next/link";
import { m } from "motion/react";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function GetStarted() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-ink/8 bg-[#f5e6df] paper-grain">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
        <div className="max-w-lg">
          <div className="chapter-rule mb-5 bg-ink" />
          <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            Create your collection today.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink/65">
            It takes less than a minute to set up.
          </p>
        </div>
        <m.div
          className="flex flex-col items-start gap-3 sm:items-end"
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Button
            nativeButton={false}
            render={<Link href="/admin/login" />}
            size="lg"
            className="h-14 bg-bloom px-10 text-base font-medium text-white hover:bg-bloom/90 sm:h-16 sm:px-12 sm:text-lg"
          >
            Open your collection
          </Button>
          <Link
            href="/upload/demo"
            className="font-sans text-sm text-ink/60 underline-offset-4 transition hover:text-ink hover:underline"
          >
            Or try the guest view
          </Link>
        </m.div>
      </div>
    </section>
  );
}
