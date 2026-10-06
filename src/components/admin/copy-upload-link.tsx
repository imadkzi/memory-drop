"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CopyUploadLink({
  weddingId,
  initialUrl,
  fallbackLabel,
}: {
  weddingId: string;
  initialUrl?: string | null;
  fallbackLabel: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [copied, setCopied] = useState(false);

  async function resolveUrl() {
    if (url) return url;
    const res = await fetch(`/api/weddings/${weddingId}/upload-link`);
    const json = await res.json();
    if (!res.ok || !json.url) {
      setMessage(json.error ?? "Generate a guest link in settings first.");
      return null;
    }
    setUrl(json.url);
    return json.url as string;
  }

  async function copy() {
    setMessage(null);
    const resolved = await resolveUrl();
    if (!resolved) return;
    await navigator.clipboard.writeText(resolved);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          readOnly
          value={url ?? fallbackLabel}
          onFocus={(event) => event.currentTarget.select()}
          className="h-12 rounded-xl border-ink/10 bg-[#faf6f2] pr-11 font-sans text-sm text-ink/70"
          aria-label="Guest upload link"
        />
        <button
          type="button"
          onClick={copy}
          className="absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink/45 transition hover:bg-ink/5 hover:text-bloom"
          aria-label={copied ? "Copied" : "Copy link"}
        >
          {copied ? (
            <Check className="size-4 text-bloom" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
      <Button
        type="button"
        onClick={copy}
        className="h-11 bg-bloom px-5 font-semibold text-white hover:bg-bloom/90"
      >
        {copied ? (
          <>
            <Check className="size-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="size-4" />
            Copy link
          </>
        )}
      </Button>
      {message && <p className="font-sans text-sm text-destructive">{message}</p>}
    </div>
  );
}
