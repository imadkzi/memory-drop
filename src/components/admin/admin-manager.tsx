"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Info, UserPlus } from "lucide-react";
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

type InviteRow = {
  id: string;
  email: string;
  role: "ADMIN";
  status: "PENDING";
  expiresAt: string;
  createdAt: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function SectionRule() {
  return <div className="border-t border-ink/8" />;
}

function MemberCard({
  admin,
  badge,
  action,
}: {
  admin: AdminRow;
  badge: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-bloom-soft font-serif text-sm text-bloom">
          {initials(admin.name) || "·"}
        </div>
        <div className="min-w-0">
          <p className="truncate font-serif text-xl tracking-tight text-ink">
            {admin.name}
          </p>
          <p className="mt-0.5 truncate font-sans text-sm text-muted-foreground">
            {admin.email}
          </p>
          <p className="mt-1.5 font-sans text-[11px] tracking-[0.2em] text-ink/40 uppercase">
            {admin.role}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {action}
        <span className="rounded-full bg-bloom-soft px-3 py-1 font-sans text-xs font-medium text-bloom">
          {badge}
        </span>
      </div>
    </div>
  );
}

export function AdminManager({
  weddingId,
  isOwner,
  currentUserId,
  admins,
  invites,
}: {
  weddingId: string;
  isOwner: boolean;
  currentUserId: string;
  admins: AdminRow[];
  invites: InviteRow[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const owner = admins.find((admin) => admin.role === "OWNER");
  const members = admins.filter((admin) => admin.role !== "OWNER");
  const pendingInvites = invites;

  async function copyText(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function createInvite(event: React.FormEvent) {
    event.preventDefault();
    setAdding(true);
    setError(null);
    setMessage(null);
    setInviteUrl(null);
    const res = await fetch(`/api/weddings/${weddingId}/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(json.error ?? "We couldn't create this invite.");
      return;
    }
    setEmail("");
    setInviteUrl(json.url);
    setMessage(
      json.refreshed
        ? "Invite refreshed — copy the link and send it to them."
        : "Invite created — copy the link and send it to them.",
    );
    router.refresh();
  }

  async function refreshInvite(inviteId: string) {
    setBusyId(inviteId);
    setError(null);
    const res = await fetch(`/api/weddings/${weddingId}/invites/${inviteId}`, {
      method: "POST",
    });
    const json = await res.json();
    setBusyId(null);
    if (!res.ok) {
      setError(json.error ?? "We couldn't refresh this invite.");
      return;
    }
    setInviteUrl(json.url);
    setMessage("New invite link ready — copy and send it.");
    router.refresh();
  }

  async function revokeInvite(inviteId: string) {
    setBusyId(inviteId);
    setError(null);
    const res = await fetch(`/api/weddings/${weddingId}/invites/${inviteId}`, {
      method: "DELETE",
    });
    const json = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(json.error ?? "We couldn't revoke this invite.");
      return;
    }
    if (inviteUrl) setInviteUrl(null);
    setMessage("Invite revoked");
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
    <div className="space-y-8">
      <SectionRule />

      <section>
        <h2 className="font-serif text-2xl tracking-tight text-ink">
          Who can see
        </h2>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          Owners and admins can access the collection and manage its settings.
        </p>
        {owner ? (
          <div className="mt-6">
            <MemberCard admin={owner} badge="Owner" />
          </div>
        ) : null}
      </section>

      <SectionRule />

      {isOwner ? (
        <section>
          <h2 className="font-serif text-2xl tracking-tight text-ink">
            Invite help
          </h2>
          <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
            Enter their email to create a private invite link. Copy it and send
            it yourself — the link expires in 7 days.
          </p>
          <form
            onSubmit={createInvite}
            className="mt-5 rounded-2xl bg-bloom-soft/70 px-5 py-5"
          >
            <Label
              htmlFor="admin-email"
              className="font-sans text-[11px] tracking-[0.18em] text-bloom uppercase"
            >
              Email address
            </Label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="h-11 flex-1 rounded-xl border border-ink/12 bg-white px-3 shadow-none focus-visible:border-bloom focus-visible:ring-bloom/20"
              />
              <Button
                type="submit"
                disabled={adding}
                className="h-11 shrink-0 bg-bloom px-5 font-semibold text-white hover:bg-bloom/90"
              >
                <UserPlus className="size-4" />
                {adding ? "Creating…" : "Create invite"}
              </Button>
            </div>
            <p className="mt-3 flex items-start gap-2 font-sans text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0 text-bloom/70" />
              New users set a password on the link. Existing users sign in, then
              accept. Role is always Admin.
            </p>
          </form>

          {inviteUrl ? (
            <div className="mt-4 space-y-3 rounded-2xl border border-ink/10 bg-white px-4 py-4">
              <p className="font-sans text-[11px] tracking-[0.18em] text-ink/45 uppercase">
                Invite link
              </p>
              <p className="break-all font-sans text-sm text-ink/70">{inviteUrl}</p>
              <Button
                type="button"
                onClick={() => void copyText(inviteUrl)}
                className="h-10 bg-bloom px-4 font-semibold text-white hover:bg-bloom/90"
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
            </div>
          ) : null}
        </section>
      ) : (
        <p className="font-sans text-sm text-muted-foreground">
          Only the wedding owner can manage administrators.
        </p>
      )}

      {isOwner && pendingInvites.length > 0 ? (
        <>
          <SectionRule />
          <section>
            <h2 className="font-serif text-2xl tracking-tight text-ink">
              Pending invites
            </h2>
            <ul className="mt-6 space-y-3">
              {pendingInvites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-serif text-xl tracking-tight text-ink">
                      {invite.email}
                    </p>
                    <p className="mt-1 font-sans text-sm text-muted-foreground">
                      Expires{" "}
                      {new Date(invite.expiresAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busyId === invite.id}
                      onClick={() => void refreshInvite(invite.id)}
                      className="border-ink/15 bg-white text-ink hover:bg-ink/5"
                    >
                      {busyId === invite.id ? "Working…" : "New link"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busyId === invite.id}
                      onClick={() => void revokeInvite(invite.id)}
                      className="border-ink/15 bg-white text-ink hover:bg-destructive/10 hover:text-destructive"
                    >
                      Revoke
                    </Button>
                    <span className="rounded-full bg-ink/5 px-3 py-1 font-sans text-xs font-medium text-ink/55">
                      Pending
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      <SectionRule />

      <section>
        <h2 className="font-serif text-2xl tracking-tight text-ink">
          Team members
        </h2>
        {members.length === 0 ? (
          <p className="mt-4 font-sans text-sm text-muted-foreground">
            No administrators added yet.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {members.map((admin) => (
              <li key={admin.id}>
                <MemberCard
                  admin={admin}
                  badge="Admin"
                  action={
                    isOwner && admin.userId !== currentUserId ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAdmin(admin.id)}
                        className="border-ink/15 bg-white text-ink hover:bg-destructive/10 hover:text-destructive"
                      >
                        Remove
                      </Button>
                    ) : null
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {message && <p className="font-sans text-sm text-bloom">{message}</p>}
      {error && <p className="font-sans text-sm text-destructive">{error}</p>}
    </div>
  );
}
