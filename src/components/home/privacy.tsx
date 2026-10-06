import { HardDrive, Shield, UserRound } from "lucide-react";
import { photos } from "@/components/home/photos";
import { Polaroid } from "@/components/home/polaroid";
import { Reveal } from "@/components/ui/reveal";

const access = [
  { icon: UserRound, label: "Guests", value: "Upload only" },
  { icon: Shield, label: "Admins", value: "View, download, delete" },
  { icon: HardDrive, label: "Storage", value: "Your Google Drive" },
];

export function Privacy() {
  return (
    <section id="privacy" className="privacy-shell relative overflow-hidden">
      <div className="privacy-wash absolute inset-0 z-0" aria-hidden />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-14">
          <Reveal>
            <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              Guests can give.
              <br />
              They cannot look.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white">
              The upload link is a capability, not a window. Your family,
              planner, or partner can be invited as an admin with a private
              link. Everyone else simply contributes and leaves.
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
          {access.map((cell, index) => {
            const Icon = cell.icon;
            return (
              <Reveal key={cell.label} delayMs={index * 90}>
                <div className="flex items-start gap-3">
                  <Icon
                    className="mt-0.5 size-5 text-champagne-soft"
                    strokeWidth={1.4}
                  />
                  <div>
                    <p className="text-[11px] tracking-[0.2em] text-white/90 uppercase">
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
  );
}
