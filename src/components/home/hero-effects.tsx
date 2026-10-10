"use client";

import Image from "next/image";
import { m, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { photos } from "@/components/home/photos";
import { Polaroid } from "@/components/home/polaroid";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/** Decorative florals: mount after idle so they cannot steal LCP from the H1. */
export function HeroFlorals() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const floralY = useTransform(scrollYProgress, [0, 1], [0, 48]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);

    const show = () => setReady(true);
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(show, { timeout: 1200 });
    } else {
      timeoutId = setTimeout(show, 200);
    }

    return () => {
      mq.removeEventListener("change", update);
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
    >
      {ready ? (
        <m.div
          className="absolute inset-0 overflow-hidden"
          aria-hidden
          style={reduced || !desktop ? undefined : { y: floralY }}
        >
          <Image
            src="/florals/floral-asset.webp"
            alt=""
            width={720}
            height={480}
            sizes="(max-width: 640px) 22rem, (max-width: 768px) 30rem, 38rem"
            className="absolute top-[4.25rem] -left-10 w-[22rem] max-w-none sm:-top-20 sm:-left-6 sm:w-[30rem] md:-top-24 md:w-[38rem]"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            quality={70}
          />
          <Image
            src="/florals/floral-asset.webp"
            alt=""
            width={720}
            height={480}
            sizes="(max-width: 640px) 22rem, (max-width: 768px) 30rem, 38rem"
            className="absolute -right-10 -bottom-16 w-[22rem] max-w-none -scale-x-100 rotate-180 sm:-right-6 sm:-bottom-20 sm:w-[30rem] md:-bottom-24 md:w-[38rem]"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            quality={70}
          />
        </m.div>
      ) : null}
    </div>
  );
}

export function HeroPolaroids() {
  const reduced = usePrefersReducedMotion();
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const still = reduced || !desktop;

  return (
    <>
      <DriftPolaroid
        reduced={still}
        className="absolute -top-5 -right-3 z-20 w-[4.5rem] translate-x-[28%] rotate-[11deg] sm:-right-12 sm:w-[6.75rem] sm:translate-x-[18%]"
        src={photos.lookBack}
        alt="Bride looking back"
        amplitude={3}
        duration={9}
      />
      <DriftPolaroid
        reduced={still}
        className="absolute -right-2 bottom-12 z-20 w-[4.1rem] translate-x-[32%] -rotate-[8deg] sm:-right-9 sm:w-[6.25rem] sm:translate-x-[20%]"
        src={photos.walkToward}
        alt="Couple walking together"
        amplitude={2.5}
        duration={11}
        delay={1.2}
      />
    </>
  );
}

function DriftPolaroid({
  src,
  alt,
  className,
  reduced,
  amplitude,
  duration,
  delay = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  reduced: boolean;
  amplitude: number;
  duration: number;
  delay?: number;
}) {
  if (reduced) {
    return <Polaroid src={src} alt={alt} className={className} frame="slim" />;
  }

  return (
    <m.div
      className={className}
      animate={{ y: [0, -amplitude, 0, amplitude * 0.6, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <Polaroid src={src} alt={alt} frame="slim" />
    </m.div>
  );
}
