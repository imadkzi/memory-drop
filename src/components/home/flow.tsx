"use client";

import Image from "next/image";
import {
  FolderPlus,
  Images,
  QrCode,
  UploadSimple,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { m } from "motion/react";
import { photos } from "@/components/home/photos";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const beats: {
  title: string;
  copy: string;
  icon: Icon;
  src: string;
  alt: string;
  rotate: string;
}[] = [
  {
    title: "Create the wedding",
    copy: "Name the day. Connect Drive. A private folder waits.",
    icon: FolderPlus,
    src: photos.manor,
    alt: "Wedding venue",
    rotate: "-2.5deg",
  },
  {
    title: "Pass the link",
    copy: "A URL or QR on a card, a sign, an invitation.",
    icon: QrCode,
    src: photos.lookBack,
    alt: "Bride looking back",
    rotate: "1.8deg",
  },
  {
    title: "They contribute",
    copy: "Photos leave their camera roll — no guest gallery.",
    icon: UploadSimple,
    src: photos.kiss,
    alt: "Couple at golden hour",
    rotate: "-1.2deg",
  },
  {
    title: "You keep everything",
    copy: "Preview, download, delete. Invite help if you need it.",
    icon: Images,
    src: photos.steps,
    alt: "Couple on villa steps",
    rotate: "2.2deg",
  },
];

export function Flow() {
  const reduced = usePrefersReducedMotion();

  return (
    <section id="flow" className="relative z-0 overflow-x-clip paper-warm paper-grain">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
        <div className="max-w-md">
          <div className="chapter-rule mb-6 bg-ink" />
          <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            Four quiet moves.
          </h2>
        </div>

        <m.ol
          className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px" }}
          variants={{
            hidden: {},
            show: {
              transition: reduced
                ? { staggerChildren: 0 }
                : { staggerChildren: 0.1 },
            },
          }}
        >
          {beats.map((beat) => {
            const Icon = beat.icon;
            return (
              <m.li
                key={beat.title}
                className="flex flex-col"
                variants={{
                  hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <div
                  className="polaroid mx-auto w-[11.5rem] sm:mx-0 sm:w-full sm:max-w-[14rem]"
                  style={{ rotate: beat.rotate }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-blush-soft">
                    <Image
                      src={beat.src}
                      alt={beat.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 184px, 224px"
                      quality={72}
                    />
                  </div>
                </div>

                <Icon
                  className="mt-7 size-6 text-bloom"
                  weight="light"
                  aria-hidden
                />
                <h3 className="mt-3 font-serif text-xl tracking-tight text-ink sm:text-2xl">
                  {beat.title}
                </h3>
                <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-ink/65">
                  {beat.copy}
                </p>
              </m.li>
            );
          })}
        </m.ol>
      </div>
    </section>
  );
}
