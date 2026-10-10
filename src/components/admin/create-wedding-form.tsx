"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateWeddingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/weddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "We couldn't create this event.");
      setLoading(false);
      return;
    }
    router.push(`/admin/weddings/${json.wedding.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="surface-panel p-6 sm:p-8"
    >
      <h2 className="font-serif text-2xl tracking-tight text-ink">New collection</h2>
      <p className="mt-2 font-sans text-sm text-muted-foreground">
        Name the day. You can set the event date and connect Drive next.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <Label
            htmlFor="wedding-name"
            className="font-sans text-sm text-ink/55"
          >
            Event name
          </Label>
          <Input
            id="wedding-name"
            placeholder="Sarah & Ahmed"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="h-11 rounded-none border-0 border-b border-ink/15 bg-transparent px-0 shadow-none focus-visible:border-bloom focus-visible:ring-0"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 shrink-0 bg-bloom px-6 font-semibold text-white hover:bg-bloom/90"
        >
          {loading ? "Creating…" : "Create"}
        </Button>
      </div>
      {error && (
        <p className="mt-4 font-sans text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}
