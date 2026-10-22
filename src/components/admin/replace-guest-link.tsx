"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReplaceGuestLink({
  weddingId,
  canReplace,
}: {
  weddingId: string;
  canReplace: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function replace() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/weddings/${weddingId}/regenerate-token`, {
      method: "POST",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPending(false);
      setError(
        typeof json.error === "string"
          ? json.error
          : "Could not create a new guest link.",
      );
      return;
    }
    router.refresh();
    setPending(false);
  }

  return (
    <div className="max-w-xl space-y-4 border border-ink/10 bg-[#faf6f2] px-5 py-5">
      <p className="font-sans text-sm leading-relaxed text-ink/70">
        This guest link was saved with the previous encryption key, so it
        can&apos;t be copied or turned into a QR code. Creating a new link
        replaces it. Anyone still using the old link will need this new one.
      </p>
      {canReplace ? (
        <Button
          type="button"
          onClick={replace}
          disabled={pending}
          className="h-11 bg-bloom px-5 font-semibold text-white hover:bg-bloom/90"
        >
          {pending ? "Creating…" : "Create a new guest link"}
        </Button>
      ) : (
        <p className="font-sans text-sm text-ink/60">
          Ask the event owner to create the new link.
        </p>
      )}
      {error && <p className="font-sans text-sm text-destructive">{error}</p>}
    </div>
  );
}
