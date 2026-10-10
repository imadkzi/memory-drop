"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type WeddingSettings = {
  id: string;
  name: string;
  eventDate: string | null;
  maxPhotoSizeBytes: number;
  maxVideoSizeBytes: number;
  driveConnected: boolean;
  isOwner: boolean;
};

const MB = 1024 * 1024;

const field =
  "h-11 rounded-xl border border-ink/12 bg-[#faf6f2]/60 px-3 shadow-none focus-visible:border-bloom focus-visible:ring-bloom/20";

const labelClass =
  "font-sans text-[11px] tracking-[0.18em] text-ink/45 uppercase";

function SectionRule() {
  return <div className="border-t border-ink/8" />;
}

function bytesToMb(bytes: number) {
  return Math.round((bytes / MB) * 10) / 10;
}

function mbToBytes(mb: number) {
  return Math.round(mb * MB);
}

export function WeddingSettingsForm({ wedding }: { wedding: WeddingSettings }) {
  const router = useRouter();
  const [name, setName] = useState(wedding.name);
  const [eventDate, setEventDate] = useState(wedding.eventDate ?? "");
  const [maxPhotoMb, setMaxPhotoMb] = useState(
    String(bytesToMb(wedding.maxPhotoSizeBytes)),
  );
  const [maxVideoMb, setMaxVideoMb] = useState(
    String(bytesToMb(wedding.maxVideoSizeBytes)),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const photoMb = Number(maxPhotoMb);
    const videoMb = Number(maxVideoMb);
    if (!Number.isFinite(photoMb) || photoMb <= 0 || photoMb > 100) {
      setSaving(false);
      setError("Photo limit must be between 0.1 and 100 MB.");
      return;
    }
    if (!Number.isFinite(videoMb) || videoMb <= 0 || videoMb > 5 * 1024) {
      setSaving(false);
      setError("Video limit must be between 1 MB and 5120 MB (5 GB).");
      return;
    }

    const res = await fetch(`/api/weddings/${wedding.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        eventDate: eventDate || null,
        maxPhotoSizeBytes: mbToBytes(photoMb),
        maxVideoSizeBytes: mbToBytes(videoMb),
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? "We couldn't save settings.");
      return;
    }
    setMessage("Saved");
    router.refresh();
  }

  function connectDrive() {
    window.open(`/api/google/connect?weddingId=${wedding.id}`, "_self");
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <section>
        <h2 className="font-serif text-2xl tracking-tight text-ink">
          The wedding
        </h2>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          Name and date for your collection.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className={labelClass}>
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={field}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-date" className={labelClass}>
              Event date
            </Label>
            <Input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={field}
            />
          </div>
        </div>
      </section>

      <SectionRule />

      <section>
        <h2 className="font-serif text-2xl tracking-tight text-ink">Storage</h2>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          {wedding.driveConnected
            ? "Google Drive is connected. Files land in a private folder you own."
            : "Connect Google Drive so guest uploads have a private home."}
        </p>
        <div
          className={
            wedding.driveConnected
              ? "mt-5 flex flex-col gap-4 border border-bloom/15 bg-bloom-soft/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              : "mt-5 flex flex-col gap-4 border border-bloom/25 bg-bloom-soft/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          }
        >
          <div className="min-w-0">
            <p className="font-sans text-sm font-medium text-ink">
              {wedding.driveConnected
                ? "Google Drive connected"
                : "Google Drive not connected"}
            </p>
            <p className="mt-1 font-sans text-xs leading-relaxed text-ink/55">
              {wedding.driveConnected
                ? "All guest uploads are saved directly to your Google Drive folder."
                : "Guests cannot upload until Drive is connected. Connect it before sharing your link."}
            </p>
          </div>
          {wedding.isOwner && (
            <Button
              type="button"
              onClick={connectDrive}
              className="h-10 shrink-0 bg-bloom px-4 font-semibold text-white hover:bg-bloom/90"
            >
              {wedding.driveConnected
                ? "Reconnect Google Drive"
                : "Connect Google Drive"}
            </Button>
          )}
        </div>
      </section>

      <SectionRule />

      <section>
        <h2 className="font-serif text-2xl tracking-tight text-ink">
          Upload limits
        </h2>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          Maximum size guests can upload for each file.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="max-photo" className={labelClass}>
              Max photo size (MB)
            </Label>
            <Input
              id="max-photo"
              type="number"
              min={0.1}
              max={100}
              step={0.1}
              value={maxPhotoMb}
              onChange={(e) => setMaxPhotoMb(e.target.value)}
              className={field}
            />
            <p className="font-sans text-xs text-muted-foreground">
              Default 25 MB. Typical phone photos are 2–8 MB.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-video" className={labelClass}>
              Max video size (MB)
            </Label>
            <Input
              id="max-video"
              type="number"
              min={1}
              max={5120}
              step={1}
              value={maxVideoMb}
              onChange={(e) => setMaxVideoMb(e.target.value)}
              className={field}
            />
            <p className="font-sans text-xs text-muted-foreground">
              Default 1024 MB (1 GB). Short clips are usually much smaller.
            </p>
          </div>
        </div>
      </section>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="h-11 bg-bloom px-6 font-semibold text-white hover:bg-bloom/90"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {message && (
          <p className="mt-3 font-sans text-sm text-bloom">{message}</p>
        )}
        {error && (
          <p className="mt-3 font-sans text-sm text-destructive">{error}</p>
        )}
      </div>
    </form>
  );
}
