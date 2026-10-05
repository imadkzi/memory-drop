"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyUploadLink({
  weddingId,
  fallbackLabel,
}: {
  weddingId: string;
  fallbackLabel: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    setMessage(null);
    const res = await fetch(`/api/weddings/${weddingId}/upload-link`);
    const json = await res.json();
    if (!res.ok || !json.url) {
      setMessage(json.error ?? "Generate a guest link in settings first.");
      return;
    }
    setUrl(json.url);
    await navigator.clipboard.writeText(json.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <p className="break-all font-sans text-sm leading-relaxed text-ink/55">
        {url ?? fallbackLabel}
      </p>
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
