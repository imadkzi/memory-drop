"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QrPanel({
  weddingId,
  initialDataUrl,
  initialError,
}: {
  weddingId: string;
  initialDataUrl?: string | null;
  initialError?: string | null;
}) {
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
    anchor.download = `wedding-${weddingId}-qr.png`;
    anchor.click();
  }

  return (
    <section>
      <div className="chapter-rule mb-5 bg-bloom" />
      <h2 className="font-serif text-2xl tracking-tight text-ink">The code</h2>
      <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
        Print it. Frame it. Leave it on a table. Guests scan and share.
      </p>

      {error && <p className="mt-4 font-sans text-sm text-destructive">{error}</p>}

      {dataUrl ? (
        <div className="mt-8">
          <div className="relative inline-block rotate-[-1.5deg]">
            <div className="absolute -inset-3 -z-10 rounded-full bg-bloom/10 blur-2xl" aria-hidden />
            <figure className="bg-white p-3 shadow-[0_20px_50px_-24px_rgba(40,20,20,0.45)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt="Guest upload QR code"
                className="size-44 sm:size-52"
              />
              <figcaption className="mt-2 text-center font-serif text-[11px] tracking-wide text-ink/40">
                Scan to upload
              </figcaption>
            </figure>
          </div>
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
              className="h-11 border-ink/15 bg-white text-ink hover:bg-ink/5"
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
    </section>
  );
}
