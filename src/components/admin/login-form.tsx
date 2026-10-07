"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth/client";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_HINT,
  passwordPolicyError,
} from "@/lib/security/password-policy";

function authErrorMessage(
  error: { message?: string | null; status?: number; statusText?: string },
  mode: "login" | "register",
) {
  const status = error.status;
  const message = error.message?.trim();

  if (status === 429 || /too many/i.test(message ?? "")) {
    return (
      message ||
      (mode === "login"
        ? "Too many sign-in attempts. Please wait and try again."
        : "Too many sign-up attempts from this network. Please wait and try again.")
    );
  }

  if (message) return message;
  return mode === "login"
    ? "Invalid email or password."
    : "We couldn't create your account.";
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        const policyError = passwordPolicyError(password, email);
        if (policyError) {
          setError(policyError);
          setLoading(false);
          return;
        }
        const result = await signUp.email({ name, email, password });
        if (result.error) {
          setError(authErrorMessage(result.error, "register"));
          setLoading(false);
          return;
        }
      } else {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(authErrorMessage(result.error, "login"));
          setLoading(false);
          return;
        }
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-5">
      <div className="text-center">
        <div className="chapter-rule mx-auto mb-5 bg-bloom" />
        <h1 className="font-serif text-3xl tracking-tight text-ink">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to your private collection"
            : "Set up a private wedding collection"}
        </p>
      </div>

      {mode === "register" && (
        <div className="space-y-2">
          <Label htmlFor="name" className="text-ink">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="h-11 border-ink/15 bg-white/80"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-ink">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="h-11 border-ink/15 bg-white/80"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-ink">
          Password
        </Label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === "register" ? PASSWORD_MIN_LENGTH : undefined}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="h-11 border-ink/15 bg-white/80"
        />
        {mode === "register" && (
          <p className="font-sans text-xs leading-relaxed text-muted-foreground">
            {PASSWORD_POLICY_HINT}
          </p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {mode === "register" && (
        <p className="text-center font-sans text-sm leading-relaxed text-muted-foreground">
          Creating an account means you agree to the{" "}
          <Link
            href="/terms"
            className="font-medium text-bloom underline-offset-4 hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-bloom underline-offset-4 hover:underline"
          >
            Privacy policy
          </Link>
          .
        </p>
      )}
      <Button
        type="submit"
        className="h-12 w-full bg-bloom text-base font-semibold text-white hover:bg-bloom/90"
        disabled={loading}
      >
        {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
      <p className="text-center font-sans text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New here?{" "}
            <button
              type="button"
              className="font-medium text-bloom underline-offset-4 hover:underline"
              onClick={() => setMode("register")}
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="font-medium text-bloom underline-offset-4 hover:underline"
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
          </>
        )}
      </p>
      <p className="text-center font-sans text-sm text-muted-foreground">
        <Link href="/" className="hover:text-ink hover:underline">
          Back to Memory Drop
        </Link>
      </p>
    </form>
  );
}
