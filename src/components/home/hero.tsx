import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/home/brand-mark";
import { GuestCard } from "@/components/home/guest-card";
import { HeroFlorals, HeroPolaroids } from "@/components/home/hero-effects";

/** Server-rendered shell so brand + H1 can be LCP without waiting on client JS. */
export function Hero() {
  return (
    <section className="relative flex min-h-[78svh] flex-col overflow-hidden bg-[#f5e6df] text-ink">
      <HeroFlorals />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5 md:px-8">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center"
          aria-label="Memory Drop home"
        >
          <BrandMark
            priority
            src="/brand/logo-bloom.webp"
            className="h-8 sm:h-10 md:h-11"
          />
        </Link>
        <nav
          className="flex items-center gap-4 text-[15px] text-ink/80 sm:gap-6 md:gap-8 md:text-base"
          aria-label="Primary"
        >
          <a
            href="#story"
            className="hidden font-medium transition hover:text-ink sm:inline"
          >
            The Idea
          </a>
          <a
            href="#flow"
            className="hidden font-medium transition hover:text-ink sm:inline"
          >
            The Flow
          </a>
          <a
            href="#privacy"
            className="hidden font-medium transition hover:text-ink md:inline"
          >
            Privacy
          </a>
          <Button
            nativeButton={false}
            render={<Link href="/admin/login" />}
            variant="outline"
            size="lg"
            className="h-11 border-ink/30 bg-transparent px-5 text-base font-semibold text-ink hover:bg-ink hover:text-white"
          >
            Sign in
          </Button>
        </nav>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 content-center gap-12 px-6 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-10 md:px-8 md:py-14">
        <div>
          <h1 className="mt-3 font-serif text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Collect every photo your guests take.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70 sm:text-lg">
            One link for the event. Guests add what they captured, and the whole
            day ends up in a single collection.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              nativeButton={false}
              render={<Link href="/admin/login" />}
              size="lg"
              className="h-14 border border-bloom bg-bloom px-8 text-base font-semibold text-white hover:bg-bloom/90 hover:text-white sm:h-16 sm:px-10 sm:text-lg"
            >
              Open your collection
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/upload/demo" />}
              variant="outline"
              size="lg"
              className="h-14 border border-ink/35 bg-transparent px-8 text-base font-semibold text-ink hover:bg-ink hover:text-white sm:h-16 sm:px-10 sm:text-lg"
            >
              Guest view
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[31.2rem] px-5 sm:px-2 md:mx-0 md:max-w-none md:justify-self-end md:px-0">
          <div className="relative mx-auto w-[28rem] max-w-[calc((100vw-4.5rem)/1.2)] pb-20 [zoom:1.2] max-sm:w-[min(19.5rem,100%)] sm:pb-16">
            <div className="relative z-10 rotate-[-1.5deg]">
              <GuestCard />
            </div>

            <HeroPolaroids />

            <div className="pointer-events-none absolute -bottom-1 left-1/2 z-30 flex w-44 -translate-x-1/2 flex-col items-center sm:w-48">
              <svg
                viewBox="0 0 80 52"
                className="h-12 w-20 text-ink/70"
                fill="none"
                aria-hidden
              >
                <path
                  d="M40 48 C 38 34, 34 20, 40 6"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
                <path
                  d="M32 14 L40 4 L48 14"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-0.5 text-center font-serif text-[13px] leading-snug text-ink/65 italic">
                A simple upload link for your guests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
