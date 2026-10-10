"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "motion/react";
import { photos } from "@/components/home/photos";
import { Polaroid } from "@/components/home/polaroid";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const benefits = [
  {
    title: "No app downloads",
    detail: "Guests open a link in the browser they already have.",
  },
  {
    title: "No guest accounts",
    detail: "They contribute and leave. Nothing to create or remember.",
  },
  {
    title: "Straight to Google Drive",
    detail: "Uploads go to the Drive you connect, not a gallery we host.",
  },
];

export function BetterWay() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative z-20 overflow-x-clip border-b border-ink/8 bg-gradient-to-b from-[oklch(0.965_0.014_45)] from-0% via-white via-[4.5rem] to-white md:via-[8rem]">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-10 pb-16 md:grid-cols-2 md:gap-14 md:px-8 md:pt-24 md:pb-20">
        <m.div
          className="relative z-20 mx-auto w-full max-w-md px-5 md:mx-0 md:-mt-24 md:px-0"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px", amount: 0.35 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <Polaroid
            src={photos.kiss}
            alt="Couple at golden hour"
            className="absolute top-1/2 left-0 z-0 w-28 -translate-x-[18%] -translate-y-1/2 -rotate-[14deg] opacity-95 sm:w-40 sm:-translate-x-[48%]"
          />
          <Polaroid
            src={photos.manor}
            alt="Event venue"
            className="absolute top-1/2 right-0 z-0 w-24 translate-x-[18%] -translate-y-1/2 rotate-[10deg] opacity-90 sm:w-36 sm:translate-x-[48%]"
          />

          <div className="relative z-10 flex items-end justify-center gap-0 pt-10">
            <Link
              href="/upload/demo"
              className="relative z-10 w-[46%] max-w-[10.5rem] -rotate-[6deg] transition duration-300 hover:-translate-y-1 sm:max-w-[11.5rem]"
            >
              <Image
                src={photos.guestViewPhone}
                alt="Guest upload screen on iPhone"
                width={368}
                height={800}
                unoptimized
                className="h-auto w-full bg-transparent drop-shadow-[0_22px_40px_-18px_rgba(30,15,15,0.55)]"
                sizes="(max-width: 640px) 42vw, 184px"
              />
            </Link>

            <Link
              href="/upload/demo"
              className="relative z-20 w-[50%] max-w-[11.5rem] -translate-x-3 translate-y-1 rotate-[3deg] transition duration-300 hover:-translate-y-1 sm:max-w-[12.5rem] sm:-translate-x-6"
            >
              <Image
                src={photos.uploadPhone}
                alt="Uploading photos on iPhone"
                width={368}
                height={800}
                unoptimized
                className="h-auto w-full bg-transparent drop-shadow-[0_22px_40px_-18px_rgba(30,15,15,0.55)]"
                sizes="(max-width: 640px) 46vw, 200px"
              />
            </Link>
          </div>
        </m.div>

        <div>
          <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            Built for the day itself.
          </h2>
          <dl className="mt-8 space-y-6 border-t border-ink/10 pt-6">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-6"
              >
                <dt className="font-medium text-ink">{item.title}</dt>
                <dd className="text-[15px] leading-relaxed text-ink/65">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
