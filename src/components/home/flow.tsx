"use client";

import Image from "next/image";
import {
  FolderPlus,
  Images,
  QrCode,
  UploadSimple,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { m, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { photos } from "@/components/home/photos";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

const beats: {
  title: string;
  /** One-line lead for desktop cards */
  copy: string;
  /** Fuller body for the mobile scrub stage */
  detail: string;
  icon: Icon;
  src: string;
  alt: string;
  rotate: string;
}[] = [
  {
    title: "Create the event",
    copy: "Names, date, and a Drive connection. Done once.",
    detail:
      "Add the names and the event date, then connect your Google Drive. We open an event folder there for every file that follows, before a single guest arrives.",
    icon: FolderPlus,
    src: photos.flow1,
    alt: "Couple walking through arches",
    rotate: "-1.5deg",
  },
  {
    title: "Pass the link",
    copy: "A URL or QR on cards, signs, or the program.",
    detail:
      "Copy the guest link or print the QR for place cards, the welcome table, or the ceremony program. People open it when something worth keeping happens, not before.",
    icon: QrCode,
    src: photos.flow2,
    alt: "Bride looking back during the ceremony",
    rotate: "1.2deg",
  },
  {
    title: "They contribute",
    copy: "They pick from the camera roll and send.",
    detail:
      "On their phone, guests choose photos and short clips from the day. Each file joins the collection as soon as it leaves their camera roll.",
    icon: UploadSimple,
    src: photos.flow3,
    alt: "Couple kissing at golden hour",
    rotate: "-0.8deg",
  },
  {
    title: "You keep everything",
    copy: "Preview arrivals. Download keepers. Invite help.",
    detail:
      "Open the collection during the party or the morning after. Preview what landed, download the keepers, clear the rest, and share an admin seat with a co-host if you want a second pair of eyes.",
    icon: Images,
    src: photos.flow4,
    alt: "Couple on villa steps",
    rotate: "1.4deg",
  },
];

export function Flow() {
  const reduced = usePrefersReducedMotion();

  return (
    <section id="flow" className="relative z-0 paper-warm">
      <div className="md:hidden">
        {reduced ? <MobileStack /> : <MobileScrollScrub />}
      </div>

      <div className="mx-auto hidden max-w-6xl overflow-x-clip px-6 py-16 paper-grain md:block md:px-8 md:py-24">
        <FlowHeading />
        <m.ol
          className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {beats.map((beat) => (
            <m.li
              key={beat.title}
              className="flex flex-col"
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <BeatVisual
                beat={beat}
                className="sm:mx-0 sm:w-full sm:max-w-[14rem]"
              />
              <BeatCopy beat={beat} />
            </m.li>
          ))}
        </m.ol>
      </div>
    </section>
  );
}

function FlowHeading({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "mx-auto max-w-md text-center" : "max-w-md"}>
      <div
        className={`chapter-rule bg-ink ${compact ? "mx-auto mb-2" : "mb-6"}`}
      />
      <h2
        className={`font-serif tracking-tight text-ink ${
          compact
            ? "text-[1.65rem] leading-tight"
            : "text-3xl sm:text-4xl lg:text-[2.75rem]"
        }`}
      >
        Four quiet moves.
      </h2>
      {compact ? (
        <p className="mx-auto mt-2 max-w-[18rem] text-[13px] leading-relaxed text-ink/65">
          From setup to the last upload: how the day gets gathered.
        </p>
      ) : null}
    </div>
  );
}

function MobileStack() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <FlowHeading compact />
      <ol className="mt-12 space-y-14">
        {beats.map((beat) => (
          <li key={beat.title} className="flex flex-col items-center text-center">
            <BeatVisual beat={beat} />
            <BeatCopy beat={beat} fuller />
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Sticky stage: scrub through all four beats while pinned, then sticky
 * releases and the next page section scrolls up.
 */
function MobileScrollScrub() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const clamped = Math.min(1, Math.max(0, value));
    // Use most of the track for snaps; hold the last beat before release
    const scrub = Math.min(1, clamped / 0.86);
    const next = Math.min(
      beats.length - 1,
      Math.max(0, Math.floor(scrub * beats.length * 0.999)),
    );
    setActive((prev) => (prev === next ? prev : next));
  });

  const beat = beats[active];
  const Icon = beat.icon;

  return (
    <div
      ref={trackRef}
      className="relative"
      style={{ height: `${75 + (beats.length - 1) * 36}svh` }}
    >
      <div className="sticky top-0 z-10 flex min-h-svh w-full flex-col items-center justify-center bg-[oklch(0.965_0.014_45)] px-6 py-8">
        <FlowHeading compact />

        <div className="relative mx-auto mt-5 aspect-[4/5] w-[min(17.5rem,78vw)] shrink-0">
          {beats.map((b, index) => (
            <div
              key={b.title}
              className={cn(
                "absolute inset-0",
                index === active ? "visible" : "invisible",
              )}
              style={{ rotate: b.rotate }}
              aria-hidden={index !== active}
            >
              <div className="polaroid h-full w-full p-[0.55rem] pb-3">
                <div className="relative h-full w-full overflow-hidden bg-blush-soft">
                  <Image
                    src={b.src}
                    alt={b.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 78vw, 280px"
                    quality={72}
                    priority={index === 0}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mx-auto mt-5 w-full max-w-sm text-center"
          aria-live="polite"
        >
          <p className="text-[11px] tracking-[0.2em] text-ink/70 uppercase">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(beats.length).padStart(2, "0")}
          </p>
          <Icon
            className="mx-auto mt-2.5 size-5 text-bloom"
            weight="light"
            aria-hidden
          />
          <h3 className="mt-2 font-serif text-xl tracking-tight text-ink">
            {beat.title}
          </h3>
          <p className="mx-auto mt-2 max-w-[20rem] text-[14px] leading-relaxed text-ink/65">
            {beat.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function BeatVisual({
  beat,
  className,
}: {
  beat: (typeof beats)[number];
  className?: string;
}) {
  return (
    <div
      className={`polaroid mx-auto w-[11.5rem] ${className ?? ""}`}
      style={{ rotate: beat.rotate }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-blush-soft">
        <Image
          src={beat.src}
          alt={beat.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 208px, 224px"
          quality={72}
        />
      </div>
    </div>
  );
}

function BeatCopy({
  beat,
  fuller = false,
}: {
  beat: (typeof beats)[number];
  fuller?: boolean;
}) {
  const Icon = beat.icon;
  return (
    <>
      <Icon className="mt-7 size-6 text-bloom" weight="light" aria-hidden />
      <h3 className="mt-3 font-serif text-xl tracking-tight text-ink sm:text-2xl">
        {beat.title}
      </h3>
      <p
        className={`mt-2 text-[15px] leading-relaxed text-ink/65 ${
          fuller ? "max-w-[20rem]" : "max-w-[16rem]"
        }`}
      >
        {fuller ? beat.detail : beat.copy}
      </p>
    </>
  );
}
