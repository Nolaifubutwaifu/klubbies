"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Mode = "code" | "password" | "signup";

export function SignInForm({ flow, initialMode = "code" }: { flow: "member" | "create"; initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function requestCode(form: FormData, requestFlow: "member" | "create" | "signup") {
    const res = await fetch("/api/auth/request_code", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fullName: form.get("fullName"), email: form.get("email"), flow: requestFlow }),
    });
    if (!res.ok) {
      const body: { error?: string } = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Try again.");
      setPending(false);
      return;
    }
    router.push(requestFlow === "member" ? "/signin/code" : `/signin/code?flow=${requestFlow}`);
  }

  async function signInWithPassword(form: FormData) {
    const res = await fetch("/api/auth/password_signin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const body: { error?: string; redirectTo?: string } = await res.json().catch(() => ({}));
    if (!res.ok || !body.redirectTo) {
      setError(body.error ?? "That didn't work. Try a code instead.");
      setPending(false);
      return;
    }
    router.replace(body.redirectTo);
    router.refresh();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      if (mode === "password") await signInWithPassword(form);
      else await requestCode(form, mode === "signup" ? "signup" : flow);
    } catch {
      setError("You seem to be offline. Try again.");
      setPending(false);
    }
  }

  const submitLabel = pending
    ? mode === "password"
      ? "Signing in…"
      : "Checking…"
    : mode === "password"
      ? "Sign in"
      : mode === "signup"
        ? "Create my account"
        : flow === "create"
          ? "Send me a code"
          : "Check my access";

  return (
    <form onSubmit={onSubmit} className="flex max-w-[420px] flex-col gap-4">
      {mode !== "password" ? (
        <label className="field">
          Full name
          <input className="input" name="fullName" autoComplete="name" placeholder="Mara Lindqvist" required maxLength={200} />
        </label>
      ) : null}
      <label className="field">
        Email
        <input
          className="input"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="m.lindqvist@uni.edu"
          required
          maxLength={254}
        />
      </label>
      {mode === "password" ? (
        <label className="field">
          Password
          <input className="input" name="password" type="password" autoComplete="current-password" required minLength={8} />
        </label>
      ) : null}
      {error ? (
        <div className="notice" role="alert">
          {error}
        </div>
      ) : null}
      <button type="submit" className="btn btn-primary btn-lg justify-start text-left" disabled={pending}>
        {submitLabel}
      </button>

      {flow === "member" ? (
        <div className="flex flex-wrap gap-4 text-[13px]">
          {mode !== "signup" ? (
            <button
              type="button"
              className="btn btn-ghost text-[13px]"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
            >
              First time here? Sign up
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost text-[13px]"
              onClick={() => {
                setMode("code");
                setError("");
              }}
            >
              I already have an account
            </button>
          )}
          {mode !== "signup" ? (
            <button
              type="button"
              className="btn btn-ghost text-[13px]"
              onClick={() => {
                setMode(mode === "code" ? "password" : "code");
                setError("");
              }}
            >
              {mode === "code" ? "I have a password" : "Email me a code instead"}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="border-t-2 border-divider pt-3 text-[13px] leading-normal text-neutral-600">
        {mode === "password"
          ? "Set a password from your profile after signing in once."
          : mode === "signup"
            ? "We'll email you a code to confirm the address. Once you're in, any club that adds your email shows up as an invitation."
            : flow === "create"
              ? "We'll email you a sign-in code. No password to forget."
              : "We'll email a sign-in code to the address your club has on file. No password to forget."}
      </div>
    </form>
  );
}
