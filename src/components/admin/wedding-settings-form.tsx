"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type WeddingSettings = {
  id: string;
  name: string;
  eventDate: string | null;
  uploadEnabled: boolean;
  maxPhotoSizeBytes: number;
  maxVideoSizeBytes: number;
  driveConnected: boolean;
  isOwner: boolean;
};

const field =
  "h-11 border-0 border-b border-ink/15 bg-transparent px-0 shadow-none focus-visible:border-bloom focus-visible:ring-0 rounded-none";

export function WeddingSettingsForm({ wedding }: { wedding: WeddingSettings }) {
  const router = useRouter();
  const [name, setName] = useState(wedding.name);
  const [eventDate, setEventDate] = useState(wedding.eventDate ?? "");
  const [uploadEnabled, setUploadEnabled] = useState(wedding.uploadEnabled);
  const [maxPhoto, setMaxPhoto] = useState(String(wedding.maxPhotoSizeBytes));
  const [maxVideo, setMaxVideo] = useState(String(wedding.maxVideoSizeBytes));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/weddings/${wedding.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        eventDate: eventDate || null,
        uploadEnabled,
        maxPhotoSizeBytes: Number(maxPhoto),
        maxVideoSizeBytes: Number(maxVideo),
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

  async function regenerate() {
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/weddings/${wedding.id}/regenerate-token`, {
      method: "POST",
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "We couldn't regenerate the link.");
      return;
    }
    setNewLink(json.url);
    setMessage("Previous guest link stopped working immediately.");
    router.refresh();
  }

  function connectDrive() {
    window.open(`/api/google/connect?weddingId=${wedding.id}`, "_self");
  }

  return (
    <div className="space-y-14">
      <form onSubmit={save} className="space-y-10">
        <div>
          <div className="chapter-rule mb-5 bg-bloom" />
          <h2 className="font-serif text-2xl tracking-tight text-ink">The wedding</h2>
          <p className="mt-2 font-sans text-sm text-muted-foreground">
            Name, date, and how guests may contribute.
          </p>
          <div className="mt-8 space-y-8">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="font-sans text-[11px] tracking-[0.18em] text-ink/45 uppercase"
              >
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
              <Label
                htmlFor="event-date"
                className="font-sans text-[11px] tracking-[0.18em] text-ink/45 uppercase"
              >
                Event date
              </Label>
              <Input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={field}
              />
              <p className="font-sans text-xs text-muted-foreground">
                The day of the wedding — shown in your collection, not when this was created.
              </p>
            </div>
            <div className="flex items-center justify-between gap-6 border-b border-ink/10 pb-6">
              <div>
                <p className="font-sans text-sm text-ink">Guest uploads</p>
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  Allow guests to contribute memories
                </p>
              </div>
              <Switch checked={uploadEnabled} onCheckedChange={setUploadEnabled} />
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="max-photo"
                  className="font-sans text-[11px] tracking-[0.18em] text-ink/45 uppercase"
                >
                  Max photo bytes
                </Label>
                <Input
                  id="max-photo"
                  value={maxPhoto}
                  onChange={(e) => setMaxPhoto(e.target.value)}
                  className={field}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="max-video"
                  className="font-sans text-[11px] tracking-[0.18em] text-ink/45 uppercase"
                >
                  Max video bytes
                </Label>
                <Input
                  id="max-video"
                  value={maxVideo}
                  onChange={(e) => setMaxVideo(e.target.value)}
                  className={field}
                />
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="mt-8 h-11 bg-bloom px-6 font-semibold text-white hover:bg-bloom/90"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <section>
        <div className="chapter-rule mb-5 bg-bloom" />
        <h2 className="font-serif text-2xl tracking-tight text-ink">Storage</h2>
        <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
          {wedding.driveConnected
            ? "Google Drive is connected. Files land in a private folder you own."
            : "Connect Google Drive so guest uploads have a private home."}
        </p>
        {wedding.isOwner && (
          <Button
            type="button"
            variant="outline"
            onClick={connectDrive}
            className="mt-6 h-11 border-ink/15 bg-white px-5 text-ink hover:bg-ink/5"
          >
            {wedding.driveConnected ? "Reconnect Google Drive" : "Connect Google Drive"}
          </Button>
        )}
      </section>

      <section>
        <div className="chapter-rule mb-5 bg-bloom" />
        <h2 className="font-serif text-2xl tracking-tight text-ink">Reset the link</h2>
        <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
          Regenerating stops the previous URL and QR code immediately. Guests will need the new one.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={regenerate}
          className="mt-6 h-11 border-ink/15 bg-white px-5 text-ink hover:bg-ink/5"
        >
          Regenerate upload link
        </Button>
        {newLink && (
          <p className="mt-5 break-all font-sans text-sm leading-relaxed text-ink/60">{newLink}</p>
        )}
      </section>

      {message && <p className="font-sans text-sm text-bloom">{message}</p>}
      {error && <p className="font-sans text-sm text-destructive">{error}</p>}
    </div>
  );
}
