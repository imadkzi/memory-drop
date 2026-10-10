"use client";

import { useState } from "react";
import { m } from "motion/react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function QrPanel({
  weddingId,
  initialDataUrl,
  initialError,
}: {
  weddingId: string;
  initialDataUrl?: string | null;
  initialError?: string | null;
}) {
  const reduced = usePrefersReducedMotion();
  const [dataUrl, setDataUrl] = useState<string | null>(initialDataUrl ?? null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/weddings/${weddingId}/qr`);
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "QR code unavailable until a guest link exists.");
      setDataUrl(null);
      return;
    }
    setDataUrl(json.dataUrl);
  }

  function download() {
    if (!dataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `event-${weddingId}-qr.png`;
    anchor.click();
  }

  return (
    <m.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="chapter-rule mb-5 bg-ink" />
      <h2 className="font-serif text-2xl tracking-tight text-ink">The code</h2>
      <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
        Print it, frame it or leave it on a table. Guests can scan and share.
      </p>

      {error && (
        <p className="mt-4 font-sans text-sm text-destructive">{error}</p>
      )}

      {dataUrl ? (
        <div className="mt-8">
          <m.figure
            className="mx-auto flex w-fit flex-col items-center border border-ink/10 bg-white p-4"
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUrl}
              alt="Guest upload QR code"
              className="size-44 sm:size-52"
            />
            <figcaption className="mt-2 text-center font-sans text-[11px] tracking-wide text-ink/40">
              Scan to upload
            </figcaption>
          </m.figure>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={download}
              className="h-11 bg-bloom px-5 font-semibold text-white hover:bg-bloom/90"
            >
              <Download className="size-4" />
              Download PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={load}
              disabled={loading}
              className="h-11 border-bloom/40 bg-white text-bloom hover:bg-bloom-soft hover:text-bloom"
            >
              <RefreshCw className="size-4" />
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>
      ) : (
        !error && (
          <Button
            type="button"
            onClick={load}
            disabled={loading}
            className="mt-8 h-11 bg-bloom px-5 font-semibold text-white hover:bg-bloom/90"
          >
            {loading ? "Loading…" : "Show QR code"}
          </Button>
        )
      )}
    </m.div>
  );
}
