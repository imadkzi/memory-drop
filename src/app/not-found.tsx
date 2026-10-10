import Image from "next/image";
import Link from "next/link";
import { BrandMark } from "@/components/home/brand-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#f5e6df] text-ink">
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <Image
          src="/florals/floral-asset.webp"
          alt=""
          width={720}
          height={480}
          sizes="(max-width: 640px) 22rem, 36rem"
          className="absolute top-16 -left-12 w-[22rem] max-w-none opacity-90 sm:-top-8 sm:w-[30rem] md:w-[36rem]"
          priority
          quality={70}
        />
        <Image
          src="/florals/floral-asset.webp"
          alt=""
          width={720}
          height={480}
          sizes="(max-width: 640px) 22rem, 36rem"
          className="absolute -right-12 -bottom-20 w-[22rem] max-w-none -scale-x-100 rotate-180 opacity-85 sm:w-[30rem] md:w-[36rem]"
          quality={70}
        />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-8">
        <Link href="/" className="inline-flex" aria-label="Memory Drop home">
          <BrandMark priority src="/brand/logo-bloom.webp" className="h-8 sm:h-10" />
        </Link>
        <Button
          nativeButton={false}
          render={<Link href="/admin/login" />}
          variant="outline"
          size="lg"
          className="h-11 border-ink/30 bg-transparent px-5 text-base font-semibold text-ink hover:bg-ink hover:text-white"
        >
          Sign in
        </Button>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-start justify-center px-6 py-16 md:px-8">
        <div className="chapter-rule mb-6 bg-ink" />
        <p className="font-serif text-2xl tracking-tight text-bloom sm:text-3xl">
          404
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
          This page isn&apos;t part of the day.
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70 sm:text-lg">
          The link may be mistyped, or the page may have moved. Head home to
          collect guest photos, or sign in to your collection.
        </p>
        <div className="mt-10">
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            size="lg"
            className="h-14 border border-bloom bg-bloom px-8 text-base font-semibold text-white hover:bg-bloom/90 hover:text-white"
          >
            Back home
          </Button>
        </div>
        <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/55">
          <Link href="/privacy" className="hover:text-ink">
            Privacy policy
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <a href="mailto:hello@imadkazi.co.uk" className="hover:text-ink">
            Contact
          </a>
        </nav>
      </div>
    </main>
  );
}
