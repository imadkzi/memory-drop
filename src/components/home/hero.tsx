import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/home/brand-mark";
import { GuestCard } from "@/components/home/guest-card";
import { photos } from "@/components/home/photos";
import { Polaroid } from "@/components/home/polaroid";

export function Hero() {
  return (
    <section className="relative flex min-h-[78svh] flex-col overflow-hidden bg-[#f5e6df] text-ink">
      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
        aria-hidden
      >
        <Image
          src="/floral-asset.png"
          alt=""
          width={1536}
          height={1024}
          className="absolute top-[4.25rem] -left-10 w-[22rem] max-w-none sm:-top-20 sm:-left-6 sm:w-[30rem] md:-top-24 md:w-[38rem]"
          priority
        />
        <Image
          src="/floral-asset.png"
          alt=""
          width={1536}
          height={1024}
          className="absolute -right-10 -bottom-16 w-[22rem] max-w-none -scale-x-100 rotate-180 sm:-right-6 sm:-bottom-20 sm:w-[30rem] md:-bottom-24 md:w-[38rem]"
        />
      </div>

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-8">
        <Link href="/" className="inline-flex items-center">
          <BrandMark priority src="/logo-bloom.png" />
        </Link>
        <div className="flex items-center gap-6 text-base text-ink/80 md:gap-8 md:text-lg">
          <a
            href="#story"
            className="hidden font-medium transition hover:text-ink sm:inline"
          >
            The idea
          </a>
          <a
            href="#flow"
            className="hidden font-medium transition hover:text-ink sm:inline"
          >
            The flow
          </a>
          <Button
            nativeButton={false}
            render={<Link href="/admin/login" />}
            variant="outline"
            size="lg"
            className="h-11 border-ink/25 bg-transparent px-5 text-base text-ink hover:bg-ink/5 hover:text-ink"
          >
            Sign in
          </Button>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 content-center gap-12 px-6 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-10 md:px-8 md:py-14">
        <div>
          <h1 className="animate-fade-rise mt-4 font-serif text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Collect every photo your guests take.
          </h1>
          <p className="animate-fade-rise-delay mt-6 max-w-md text-base leading-relaxed text-ink/70 sm:text-lg">
            One link for the wedding. Guests add what they captured, and the
            whole day ends up in a single collection.
          </p>
          <div className="animate-fade-rise-late mt-10 flex flex-wrap gap-4">
            <Button
              nativeButton={false}
              render={<Link href="/admin/login" />}
              size="lg"
              className="h-14 border border-bloom bg-bloom px-8 text-base font-semibold text-white shadow-[0_12px_30px_-14px_rgba(80,30,40,0.45)] hover:bg-bloom/90 hover:text-white sm:h-16 sm:px-10 sm:text-lg"
            >
              Open your collection
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/upload/demo" />}
              variant="outline"
              size="lg"
              className="h-14 border-2 border-ink/70 bg-transparent px-8 text-base font-semibold text-ink hover:bg-ink hover:text-white sm:h-16 sm:px-10 sm:text-lg"
            >
              Guest view
            </Button>
          </div>
        </div>

        <div className="animate-fade-rise-delay relative mx-auto w-full max-w-[31.2rem] overflow-x-clip px-2 sm:overflow-visible md:mx-0 md:max-w-none md:justify-self-end md:px-0">
          <div className="relative mx-auto w-[28rem] max-w-[calc((100vw-3rem)/1.2)] pb-20 [zoom:1.2] max-sm:w-[20rem] sm:pb-16">
            <div className="relative z-10 rotate-[-1.5deg]">
              <GuestCard />
            </div>

            <Polaroid
              src={photos.lookBack}
              alt="Bride looking back"
              className="absolute -top-4 -right-4 z-20 w-[5.5rem] rotate-[11deg] sm:-right-14 sm:w-[7.75rem]"
            />
            <Polaroid
              src={photos.walkToward}
              alt="Couple walking together"
              className="absolute -right-2 bottom-14 z-20 w-[5rem] -rotate-[8deg] sm:-right-10 sm:w-28"
            />

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
