"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, signOut, useSession } from "@/lib/auth/client";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_HINT,
  passwordPolicyError,
} from "@/lib/security/password-policy";

type InviteInfo = {
  email: string;
  role: string;
  expiresAt: string;
  weddingName: string;
  weddingId: string;
  accountExists: boolean;
};

export function AcceptInviteExperience({ token }: { token: string }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/invites/${token}`);
      const json = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(json.error ?? "This invite is unavailable.");
        return;
      }
      setInvite(json.invite);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function accept() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "We couldn't accept this invite.");
      return;
    }
    router.push(`/admin/weddings/${json.weddingId}/media`);
    router.refresh();
  }

  async function createAccountAndAccept(event: React.FormEvent) {
    event.preventDefault();
    if (!invite) return;
    const policyError = passwordPolicyError(password, invite.email);
    if (policyError) {
      setError(policyError);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await signUp.email({
      name: name.trim() || invite.email.split("@")[0] || "Admin",
      email: invite.email,
      password,
    });
    if (result.error) {
      setBusy(false);
      setError(result.error.message ?? "We couldn't create your account.");
      return;
    }
    await accept();
  }

  async function signInAndAccept(event: React.FormEvent) {
    event.preventDefault();
    if (!invite) return;
    setBusy(true);
    setError(null);
    const result = await signIn.email({
      email: invite.email,
      password,
    });
    if (result.error) {
      setBusy(false);
      setError(result.error.message ?? "Invalid email or password.");
      return;
    }
    await accept();
  }

  async function switchAccount() {
    setBusy(true);
    await signOut();
    setBusy(false);
    setMessage(null);
    setPassword("");
  }

  if (loadError) {
    return (
      <div className="space-y-4 text-center">
        <div className="chapter-rule mx-auto mb-5 bg-bloom" />
        <h1 className="font-serif text-3xl tracking-tight text-ink">Invite unavailable</h1>
        <p className="font-sans text-sm text-muted-foreground">{loadError}</p>
        <Link href="/admin/login" className="font-sans text-sm text-bloom hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (!invite || sessionLoading) {
    return (
      <p className="text-center font-sans text-sm text-muted-foreground">Loading invite…</p>
    );
  }

  const sessionEmail = session?.user?.email?.trim().toLowerCase() ?? null;
  const matchesInvite = sessionEmail === invite.email;
  const expiresLabel = new Date(invite.expiresAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="font-sans text-sm text-bloom">Admin invite</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-ink">
          {invite.weddingName}
        </h1>
        <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
          You&apos;ve been invited as an <span className="text-ink">admin</span> for{" "}
          <span className="text-ink">{invite.email}</span>.
          <br />
          This link expires on {expiresLabel}.
        </p>
      </div>

      {matchesInvite ? (
        <div className="space-y-4">
          <p className="text-center font-sans text-sm text-muted-foreground">
            Signed in as {sessionEmail}. Accept to join this collection.
          </p>
          <Button
            type="button"
            disabled={busy}
            onClick={() => void accept()}
            className="h-12 w-full bg-bloom font-semibold text-white hover:bg-bloom/90"
          >
            {busy ? "Accepting…" : "Accept invite"}
          </Button>
        </div>
      ) : sessionEmail ? (
        <div className="space-y-4">
          <p className="text-center font-sans text-sm text-muted-foreground">
            You&apos;re signed in as {sessionEmail}, but this invite is for{" "}
            {invite.email}.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void switchAccount()}
            className="h-11 w-full border-ink/15 bg-white text-ink hover:bg-ink/5"
          >
            Sign out and continue
          </Button>
        </div>
      ) : invite.accountExists ? (
        <form onSubmit={signInAndAccept} className="space-y-4">
          <p className="font-sans text-sm text-muted-foreground">
            An account already exists for this email. Sign in to accept.
          </p>
          <div className="space-y-2">
            <Label htmlFor="invite-password" className="text-ink">
              Password
            </Label>
            <PasswordInput
              id="invite-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
              className="h-11 border-ink/15 bg-white/80"
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="h-12 w-full bg-bloom font-semibold text-white hover:bg-bloom/90"
          >
            {busy ? "Signing in…" : "Sign in & accept"}
          </Button>
        </form>
      ) : (
        <form onSubmit={createAccountAndAccept} className="space-y-4">
          <p className="font-sans text-sm text-muted-foreground">
            Create your Memory Drop account to accept this invite.
          </p>
          <div className="space-y-2">
            <Label htmlFor="invite-name" className="text-ink">
              Name
            </Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="h-11 border-ink/15 bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-ink">
              Email
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={invite.email}
              readOnly
              className="h-11 border-ink/15 bg-white/60 text-ink/70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-new-password" className="text-ink">
              Password
            </Label>
            <PasswordInput
              id="invite-new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              className="h-11 border-ink/15 bg-white/80"
            />
            <p className="font-sans text-xs leading-relaxed text-muted-foreground">
              {PASSWORD_POLICY_HINT}
            </p>
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="h-12 w-full bg-bloom font-semibold text-white hover:bg-bloom/90"
          >
            {busy ? "Creating…" : "Create account & accept"}
          </Button>
        </form>
      )}

      {message && <p className="font-sans text-sm text-bloom">{message}</p>}
      {error && <p className="font-sans text-sm text-destructive">{error}</p>}
    </div>
  );
}
