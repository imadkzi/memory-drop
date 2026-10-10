"use client";

import Image from "next/image";
import { m, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  className?: string;
  /** Solid veil over the photo for text contrast */
  veilClassName?: string;
  gradientClassName?: string;
  children: ReactNode;
  id?: string;
};

export function ParallaxPhotoSection({
  src,
  className,
  veilClassName = "bg-white/78",
  gradientClassName = "bg-gradient-to-b from-white/50 via-transparent to-white/70",
  children,
  id,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["-18%", "18%"]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <m.div
          className="absolute inset-x-0 -top-[20%] h-[140%] w-full will-change-transform"
          style={reduced ? undefined : { y: photoY }}
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover object-[center_35%]"
            sizes="100vw"
            quality={78}
          />
        </m.div>
        <div className={cn("absolute inset-0", veilClassName)} />
        <div className={cn("absolute inset-0", gradientClassName)} />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}
