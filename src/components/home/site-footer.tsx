import Link from "next/link";
import { BrandMark } from "@/components/home/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-cinema">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <Link href="/" className="inline-flex">
          <BrandMark className="h-6 sm:h-7" />
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
          <a href="#story" className="hover:text-white">
            The idea
          </a>
          <a href="#flow" className="hover:text-white">
            The flow
          </a>
            <Link href="/privacy" className="hover:text-white">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
          <a href="mailto:hello@imadkazi.co.uk" className="hover:text-white">
            Contact
          </a>
        </nav>
        <p className="text-sm text-white/40">
          Private wedding photo &amp; video collection
        </p>
      </div>
    </footer>
  );
}
