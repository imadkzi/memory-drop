"use client";

import Link from "next/link";
import { m } from "motion/react";
import { PhoneFrame } from "@/components/home/phone-frame";
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
    detail: "Files land in a folder you own, not a third-party gallery.",
  },
  {
    title: "Private by design",
    detail: "Upload is a one-way door. Only you and invited admins can look.",
  },
];

export function BetterWay() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative z-10 overflow-x-clip border-b border-ink/8 bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-14 md:px-8 md:py-20">
        <m.div
          className="relative z-20 mx-auto -mt-16 w-full max-w-md px-5 md:mx-0 md:-mt-24 md:px-0"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
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
            <Link
              href="/upload/demo"
              className="relative z-10 w-[46%] max-w-[10.5rem] -rotate-[6deg] transition duration-300 hover:-translate-y-1 sm:max-w-[11.5rem]"
            >
              <PhoneFrame className="w-full">
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
            </Link>

            <Link
              href="/upload/demo"
              className="relative z-20 w-[50%] max-w-[11.5rem] -translate-x-3 translate-y-1 rotate-[3deg] transition duration-300 hover:-translate-y-1 sm:max-w-[12.5rem] sm:-translate-x-6"
            >
              <PhoneFrame className="w-full">
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
                            className={`size-1.5 shrink-0 rounded-full ${
                              i < 2 ? "bg-bloom" : "bg-ink/20"
                            }`}
                          />
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
