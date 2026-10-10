"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms — converted to seconds for Motion. */
  delayMs?: number;
};

/** Selective scroll reveal — opacity + tiny Y, once. Use sparingly. */
export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return className ? (
      <div className={cn(className)}>{children}</div>
    ) : (
      <>{children}</>
    );
  }

  return (
    <m.div
      className={cn(className)}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
        delay: delayMs / 1000,
      }}
    >
      {children}
    </m.div>
  );
}
