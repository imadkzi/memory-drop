import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Check,
  FolderHeart,
  HardDrive,
  Images,
  QrCode,
  Shield,
  Upload,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const photos = {
  kiss: "/093b217f-ae1d-4651-b94c-8944d379285e.png",
  manor: "/1-edited-1366.jpg",
  walkToward: "/2a4fb8d0-c01b-4664-a90d-141c87cebdf8.png",
  lakeTerrace: "/43e06b6e-5be2-4984-bf52-4c909848e79c.png",
  lookBack: "/84308caf-9d05-407d-b8f9-f82d006226f2.png",
  steps: "/daea7971-3bc9-4a9a-91d3-5ffce3bf8cc1.png",
  overlook: "/ee08da02-cb74-46f3-a8c9-5b7d6c7828ad.png",
  ring: "/fab92014-eb87-41e8-afeb-62d10648f56f.png",
} as const;

const chapters = [
  {
    title: "Create the wedding",
    copy: "Name the day. Connect your Google Drive. A private folder is ready before the first guest arrives.",
    icon: FolderHeart,
  },
  {
    title: "Pass the link",
    copy: "A URL or QR code on a card, a sign, an invitation. Guests open it on their phone and start.",
    icon: QrCode,
  },
  {
    title: "They contribute",
    copy: "Photos and videos leave their camera roll and arrive in your collection. No gallery for them to wander through.",
    icon: Upload,
  },
  {
    title: "You keep everything",
    copy: "Preview, download, delete. Add an admin if you want help sorting after the weekend.",
    icon: Images,
  },
];

const benefits = [
  "No app downloads",
  "No guest accounts",
  "Goes straight to Google Drive",
  "Private and secure",
  "You control who sees everything",
];

function BrandMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-mark.png"
      alt="MemoryDrop"
      width={320}
      height={58}
      className={`h-11 w-auto bg-transparent object-contain sm:h-12 md:h-14 ${className ?? ""}`}
      priority={priority}
    />
  );
}

function Polaroid({
  src,
  alt,
  className,
  caption,
}: {
  src: string;
  alt: string;
  className?: string;
  caption?: string;
}) {
  return (
    <figure className={`polaroid ${className ?? ""}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-blush-soft">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="200px"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-[10px] tracking-wide text-ink/45">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function GuestCard() {
  return (
    <div className="relative border border-white/10 bg-[#1c1514] p-2.5 shadow-2xl shadow-black/40">
      <div className="bg-[#f7efe9] px-6 py-9 pr-10 text-center text-ink sm:px-8 sm:py-10 sm:pr-14">
        <p className="font-serif text-3xl tracking-tight sm:text-4xl">
          Sarah &amp; Ahmed
        </p>
        <p className="mt-4 text-[15px]">Share your memories</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/55">
          Help us collect the moments from our wedding day.
        </p>
        <div className="mx-auto mt-7 flex h-11 max-w-[13.5rem] items-center justify-center bg-bloom text-sm font-medium text-white">
          Choose Photos &amp; Videos
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Side buttons */}
      <div
        className="absolute top-[18%] -left-[3px] z-20 h-[8%] w-[3px] rounded-l-sm bg-[#2a2220]"
        aria-hidden
      />
      <div
        className="absolute top-[28%] -left-[3px] z-20 h-[6%] w-[3px] rounded-l-sm bg-[#2a2220]"
        aria-hidden
      />
      <div
        className="absolute top-[36%] -left-[3px] z-20 h-[6%] w-[3px] rounded-l-sm bg-[#2a2220]"
        aria-hidden
      />
      <div
        className="absolute top-[30%] -right-[3px] z-20 h-[10%] w-[3px] rounded-r-sm bg-[#2a2220]"
        aria-hidden
      />

      <div className="relative aspect-[9/19.2] overflow-hidden rounded-[2.15rem] bg-gradient-to-b from-[#3a3230] via-[#1c1615] to-[#121010] p-[7px] shadow-[0_22px_50px_-18px_rgba(30,15,15,0.55),inset_0_1px_0_rgba(255,255,255,0.18)]">
        {/* Inner bezel */}
        <div className="relative flex h-full flex-col overflow-hidden rounded-[1.7rem] bg-[#f7efe9]">
          {/* Dynamic Island */}
          <div className="pointer-events-none absolute top-2.5 left-1/2 z-20 h-[1.15rem] w-[28%] -translate-x-1/2 rounded-full bg-black shadow-sm" />
          {/* Status bar spacer */}
          <div className="h-9 shrink-0" aria-hidden />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          {/* Home indicator */}
          <div className="flex shrink-0 justify-center pb-2 pt-1.5" aria-hidden>
            <div className="h-[3px] w-[34%] rounded-full bg-ink/25" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-x-clip bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="cinema-shell relative flex min-h-[78svh] flex-col overflow-hidden">
        <div className="cinema-wash absolute inset-0 z-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
          aria-hidden
        >
          <div className="absolute -left-28 top-0 size-[32rem] rounded-full bg-bloom/55 blur-[110px]" />
          <div className="absolute -right-20 top-16 size-[28rem] rounded-full bg-champagne/50 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[30%] size-[22rem] rounded-full bg-blush/45 blur-[90px]" />
        </div>

        <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-8">
          <Link href="/" className="inline-flex items-center">
            <BrandMark priority />
          </Link>
          <div className="flex items-center gap-6 text-base text-white/85 md:gap-8 md:text-lg">
            <a
              href="#story"
              className="hidden font-medium transition hover:text-white sm:inline"
            >
              The idea
            </a>
            <a
              href="#flow"
              className="hidden font-medium transition hover:text-white sm:inline"
            >
              The flow
            </a>
            <Button
              nativeButton={false}
              render={<Link href="/admin/login" />}
              variant="outline"
              size="lg"
              className="h-11 border-white/45 bg-transparent px-5 text-base text-white hover:bg-white/10 hover:text-white"
            >
              Sign in
            </Button>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 content-center gap-12 px-6 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-10 md:px-8 md:py-14">
          <div>
            <p className="animate-fade-rise text-[11px] tracking-[0.28em] text-white/55 uppercase">
              Private · Simple · Yours
            </p>
            <h1 className="animate-fade-rise mt-4 font-serif text-5xl leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Memory Drop
            </h1>
            <p className="animate-fade-rise-delay mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
              The private way to gather every photo and video from your wedding
              — without a public gallery, guest accounts, or another chat
              thread.
            </p>
            <div className="animate-fade-rise-late mt-10 flex flex-wrap gap-4">
              <Button
                nativeButton={false}
                render={<Link href="/admin/login" />}
                size="lg"
                className="h-14 border border-champagne-soft/40 bg-champagne-soft px-8 text-base font-semibold text-ink shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] hover:bg-white hover:text-ink sm:h-16 sm:px-10 sm:text-lg"
              >
                Open your collection
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/upload/demo" />}
                variant="outline"
                size="lg"
                className="h-14 border-2 border-white bg-transparent px-8 text-base font-semibold text-white hover:bg-white hover:text-ink sm:h-16 sm:px-10 sm:text-lg"
              >
                Guest view
              </Button>
            </div>
          </div>

          <div className="animate-fade-rise-delay relative mx-auto w-full max-w-[26rem] overflow-x-clip px-2 md:mx-0 md:max-w-none md:justify-self-end md:overflow-visible md:px-0">
            <div className="relative mx-auto w-full max-w-[20rem] pb-20 sm:max-w-[24rem] sm:pb-16">
              <div className="relative z-10 rotate-[-1.5deg]">
                <GuestCard />
              </div>

              {/* Two polaroids in front — overlap right edge only */}
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

              {/* Arrow from under the card, pointing up; text below */}
              <div className="pointer-events-none absolute -bottom-1 left-1/2 z-30 flex w-44 -translate-x-1/2 flex-col items-center sm:w-48">
                <svg
                  viewBox="0 0 80 52"
                  className="h-12 w-20 text-white/85"
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
                <p className="mt-0.5 text-center font-serif text-[13px] leading-snug text-white/75 italic">
                  A simple upload link for your guests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────── */}
      <section id="story" className="light-wash border-b border-ink/8">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-20">
          <Reveal>
            <div className="chapter-rule mb-5 bg-bloom" />
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              After the vows, the phones stay up.
            </h2>
          </Reveal>
          <Reveal
            delayMs={120}
            className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            <p>
              Everyone captures something. Then the real work starts — chasing
              files across WhatsApp, AirDrop, email, and half-finished albums
              that never quite feel like yours.
            </p>
            <p className="text-ink/85">
              Memory Drop is a single quiet channel. Guests send. You receive.
              The collection stays private, in a Drive folder you own.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Flow ─────────────────────────────────────────────── */}
      <section id="flow" className="relative z-0 overflow-x-clip bg-[#f6f0ea]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
          <Reveal className="mb-10 max-w-xl">
            <p className="text-[11px] tracking-[0.28em] text-bloom uppercase">
              The flow
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-ink sm:text-4xl">
              Four quiet moves.
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2">
            {chapters.map((chapter, index) => {
              const Icon = chapter.icon;
              return (
                <Reveal key={chapter.title} delayMs={index * 80}>
                  <article className="rounded-xl border border-ink/8 bg-[#faf6f2] p-6 shadow-[0_10px_30px_-18px_rgba(40,20,20,0.35)] sm:p-7">
                    <div
                      className={`mb-5 flex size-11 items-center justify-center rounded-lg ${
                        index % 2 === 0
                          ? "bg-bloom-soft text-bloom"
                          : "bg-champagne-soft text-[oklch(0.55_0.08_75)]"
                      }`}
                    >
                      <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                    </div>
                    <h3 className="font-serif text-2xl tracking-tight text-ink">
                      {chapter.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                      {chapter.copy}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Better way / phones ──────────────────────────────── */}
      <section className="light-wash relative z-10 overflow-x-clip border-b border-ink/8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-14 md:px-8 md:py-20">
          <Reveal className="relative z-20 mx-auto -mt-16 w-full max-w-md px-5 md:mx-0 md:-mt-24 md:px-0">
            <Polaroid
              src={photos.kiss}
              alt="Couple at golden hour"
              className="absolute top-1/2 left-0 z-0 w-28 -translate-x-[18%] -translate-y-1/2 -rotate-[14deg] opacity-95 sm:w-40 sm:-translate-x-[48%]"
            />
            <Polaroid
              src={photos.manor}
              alt="Wedding venue"
              className="absolute top-1/2 right-0 z-0 w-24 translate-x-[18%] -translate-y-1/2 rotate-[10deg] opacity-90 sm:w-36 sm:translate-x-[48%]"
            />

            <div className="relative z-10 flex items-end justify-center gap-0 pt-10">
              <PhoneFrame className="relative z-10 w-[46%] max-w-[10.5rem] -rotate-[6deg] sm:max-w-[11.5rem]">
                <div className="flex flex-1 flex-col items-center justify-center px-3 pb-2 text-center">
                  <p className="font-serif text-[15px] leading-tight sm:text-base">
                    Sarah &amp; Ahmed
                  </p>
                  <p className="mt-2 text-[9px] text-ink/60 sm:text-[10px]">
                    Share your memories
                  </p>
                  <p className="mt-1.5 text-[8px] leading-snug text-ink/45 sm:text-[9px]">
                    Help us collect the moments from our wedding day.
                  </p>
                  <div className="mt-5 flex h-7 w-full items-center justify-center rounded-md bg-bloom text-[8px] font-medium text-white sm:h-8 sm:text-[9px]">
                    Choose Photos &amp; Videos
                  </div>
                </div>
              </PhoneFrame>

              <PhoneFrame className="relative z-20 w-[50%] max-w-[11.5rem] -translate-x-3 translate-y-1 rotate-[3deg] sm:max-w-[12.5rem] sm:-translate-x-6">
                <div className="flex flex-1 flex-col px-3 pb-2">
                  <p className="text-center font-serif text-[14px] sm:text-[15px]">
                    Uploading…
                  </p>
                  <ul className="mt-3 flex-1 space-y-1.5">
                    {["IMG_4821.jpg", "clip-toast.mp4", "IMG_4824.jpg"].map(
                      (file, i) => (
                        <li
                          key={file}
                          className="flex items-center gap-1.5 rounded-md bg-white/70 px-1.5 py-1.5 text-[8px] text-ink/75 sm:text-[9px]"
                        >
                          <span
                            className={`flex size-3 shrink-0 items-center justify-center rounded-full sm:size-3.5 ${
                              i < 2
                                ? "bg-bloom text-white"
                                : "border border-ink/20"
                            }`}
                          >
                            {i < 2 ? (
                              <Check className="size-2 sm:size-2.5" strokeWidth={3} />
                            ) : null}
                          </span>
                          <span className="truncate">{file}</span>
                        </li>
                      ),
                    )}
                  </ul>
                  <div className="mt-auto pt-2">
                    <div className="h-1 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full w-2/3 rounded-full bg-bloom" />
                    </div>
                    <p className="mt-1.5 text-center text-[8px] text-ink/40">
                      2 of 3 uploaded
                    </p>
                  </div>
                </div>
              </PhoneFrame>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
              A better way to collect memories.
            </h2>
            <ul className="mt-8 space-y-4">
              {benefits.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] text-ink/80 sm:text-base"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-bloom-soft text-bloom">
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── Privacy ──────────────────────────────────────────── */}
      <section id="privacy" className="privacy-shell relative overflow-hidden">
        <div className="privacy-wash absolute inset-0 z-0" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-14">
            <Reveal>
              <p className="text-[11px] tracking-[0.28em] text-white/55 uppercase">
                Private by design
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                Guests can give.
                <br />
                They cannot look.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
                The upload link is a capability, not a window. Your sister,
                planner, or partner can be invited as an admin. Everyone else
                simply contributes and leaves.
              </p>
            </Reveal>

            <Reveal
              delayMs={120}
              className="relative mx-auto h-72 w-full max-w-md sm:h-80"
            >
              <Polaroid
                src={photos.lakeTerrace}
                alt="Couple on a lakeside terrace"
                className="absolute top-2 left-0 z-0 w-[48%] -rotate-[18deg] sm:w-[46%]"
              />
              <Polaroid
                src={photos.steps}
                alt="Couple on villa steps"
                className="absolute top-0 right-0 z-10 w-[48%] rotate-[16deg] sm:w-[46%]"
              />
              <Polaroid
                src={photos.overlook}
                alt="Couple overlooking the lake"
                className="absolute bottom-2 left-1/2 z-20 w-[50%] -translate-x-1/2 rotate-[2deg] sm:w-[48%]"
              />
            </Reveal>
          </div>

          <div className="mt-14 grid gap-8 border-t border-white/20 pt-10 sm:grid-cols-3">
            {[
              { icon: UserRound, label: "Guests", value: "Upload only" },
              {
                icon: Shield,
                label: "Admins",
                value: "View, download, delete",
              },
              { icon: HardDrive, label: "Storage", value: "Your Google Drive" },
            ].map((cell, index) => {
              const Icon = cell.icon;
              return (
                <Reveal key={cell.label} delayMs={index * 90}>
                  <div className="flex items-start gap-3">
                    <Icon
                      className="mt-0.5 size-5 text-champagne-soft"
                      strokeWidth={1.4}
                    />
                    <div>
                      <p className="text-[11px] tracking-[0.2em] text-white/50 uppercase">
                        {cell.label}
                      </p>
                      <p className="mt-1 font-serif text-xl tracking-tight text-white">
                        {cell.value}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="light-wash relative overflow-hidden">
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
          <Reveal className="max-w-lg">
            <p className="text-[11px] tracking-[0.28em] text-bloom uppercase">
              Get started
            </p>
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

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-cinema">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <Link href="/" className="inline-flex">
            <BrandMark className="h-9 sm:h-10 md:h-11" />
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
            <a href="#story" className="hover:text-white">
              The idea
            </a>
            <a href="#flow" className="hover:text-white">
              The flow
            </a>
            <a href="#privacy" className="hover:text-white">
              Privacy
            </a>
            <a href="mailto:hello@memorydrop.app" className="hover:text-white">
              Contact
            </a>
          </nav>
          <p className="text-sm text-white/40">
            Private wedding photo &amp; video collection
          </p>
        </div>
      </footer>
    </main>
  );
}
