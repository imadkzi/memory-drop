"use client";

import { m } from "motion/react";
import { photos } from "@/components/home/photos";
import { Polaroid } from "@/components/home/polaroid";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const access = [
  { label: "Guests", value: "Upload only" },
  { label: "Admins", value: "View, download, delete" },
  { label: "Storage", value: "Your Google Drive" },
];

const storageNote =
  "Memory Drop does not provide Google storage. You connect your own Drive account; guest uploads write there, and Google’s quota applies.";

export function Privacy() {
  const reduced = usePrefersReducedMotion();

  return (
    <section id="privacy" className="privacy-shell relative overflow-hidden">
      <div className="privacy-wash absolute inset-0 z-0" aria-hidden />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-14">
          <div>
            <div className="chapter-rule mb-6 bg-white/50" />
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              Guests can give.
              <br />
              They cannot look.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/85">
              The upload link is a capability, not a window. Your family,
              planner, or partner can be invited as an admin with a private
              link. Everyone else simply contributes and leaves.
            </p>
          </div>

          <m.div
            className="relative mx-auto h-72 w-full max-w-md sm:h-80"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
          </m.div>
        </div>

        <dl className="mt-14 grid gap-8 border-t border-white/20 pt-10 sm:grid-cols-3">
          {access.map((cell) => (
            <div key={cell.label}>
              <dt className="text-sm text-white/70">{cell.label}</dt>
              <dd className="mt-1 font-serif text-xl tracking-tight text-white">
                {cell.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm leading-relaxed text-white/65">
          {storageNote}
        </p>
      </div>
    </section>
  );
}
