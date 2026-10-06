import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function GetStarted() {
  return (
    <section className="light-wash relative overflow-hidden">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
        <Reveal className="max-w-lg">
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            Create your collection today.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            It takes less than a minute to set up.
          </p>
        </Reveal>
        <Reveal
          delayMs={100}
          className="flex flex-col items-start gap-3 sm:items-end"
        >
          <Button
            nativeButton={false}
            render={<Link href="/admin/login" />}
            size="lg"
            className="h-14 bg-bloom px-10 text-base font-medium text-white hover:bg-bloom/90 sm:h-16 sm:px-12 sm:text-lg"
          >
            Open your collection →
          </Button>
          <Link
            href="/upload/demo"
            className="font-sans text-sm text-ink/60 underline-offset-4 transition hover:text-ink hover:underline"
          >
            Or try the guest view
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
