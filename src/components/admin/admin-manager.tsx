"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminRow = {
  id: string;
  role: "OWNER" | "ADMIN";
  userId: string;
  name: string;
  email: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminManager({
  weddingId,
  isOwner,
  currentUserId,
  admins,
}: {
  weddingId: string;
  isOwner: boolean;
  currentUserId: string;
  admins: AdminRow[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function addAdmin(event: React.FormEvent) {
    event.preventDefault();
    setAdding(true);
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/weddings/${weddingId}/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(json.error ?? "We couldn't add this administrator.");
      return;
    }
    setEmail("");
    setMessage("Administrator added");
    router.refresh();
  }

  async function removeAdmin(adminId: string) {
    setError(null);
    const res = await fetch(`/api/weddings/${weddingId}/admins/${adminId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "We couldn't remove this administrator.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-14">
      <section>
        <div className="chapter-rule mb-5 bg-bloom" />
        <h2 className="font-serif text-2xl tracking-tight text-ink">
          Who can see
        </h2>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          Owners and admins can view, download, and manage the collection.
        </p>
        <ul className="mt-8 space-y-6">
          {admins.map((admin) => (
            <li
              key={admin.id}
              className="flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-bloom-soft font-serif text-sm text-bloom">
                  {initials(admin.name) || "·"}
                </div>
                <div>
                  <p className="font-serif text-xl tracking-tight text-ink">
                    {admin.name}
                  </p>
                  <p className="mt-0.5 font-sans text-sm text-muted-foreground">
                    {admin.email}
                  </p>
                  <p className="mt-2 font-sans text-[11px] tracking-[0.2em] text-ink/40 uppercase">
                    {admin.role}
                  </p>
                </div>
              </div>
              {isOwner &&
                admin.role !== "OWNER" &&
                admin.userId !== currentUserId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdmin(admin.id)}
                    className="shrink-0 border-ink/15 bg-white text-ink hover:bg-destructive/10 hover:text-destructive"
                  >
                    Remove
                  </Button>
                )}
            </li>
          ))}
        </ul>
      </section>

      {isOwner ? (
        <section>
          <div className="chapter-rule mb-5 bg-bloom" />
          <h2 className="font-serif text-2xl tracking-tight text-ink">
            Invite help
          </h2>
          <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
            Add someone who already has a Memory Drop account — a sister,
            planner, or partner.
          </p>
          <form onSubmit={addAdmin} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="admin-email"
                className="font-sans text-[11px] tracking-[0.18em] text-ink/45 uppercase"
              >
                Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="h-11 rounded-none border-0 border-b border-ink/15 bg-transparent px-0 shadow-none focus-visible:border-bloom focus-visible:ring-0"
              />
            </div>
            <Button
              type="submit"
              disabled={adding}
              className="h-11 bg-bloom px-5 font-semibold text-white hover:bg-bloom/90"
            >
              {adding ? "Adding…" : "Add administrator"}
            </Button>
          </form>
        </section>
      ) : (
        <p className="font-sans text-sm text-muted-foreground">
          Only the wedding owner can manage administrators.
        </p>
      )}

      {message && <p className="font-sans text-sm text-bloom">{message}</p>}
      {error && <p className="font-sans text-sm text-destructive">{error}</p>}
    </div>
  );
}
