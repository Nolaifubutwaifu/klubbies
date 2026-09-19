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
      : "Sending…"
    : mode === "password"
      ? "Sign in"
      : mode === "signup"
        ? "Create my account"
        : "Send me a code";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      {mode !== "password" ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold text-[color:var(--color-neutral-700)]">Your name</span>
          <input className="soft-input !min-h-[50px]" name="fullName" autoComplete="name" placeholder="Tilly Nguyen" required maxLength={200} />
        </label>
      ) : null}
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-[color:var(--color-neutral-700)]">Uni email</span>
        <input
          className="soft-input !min-h-[50px]"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@student.unimelb.edu.au"
          required
          maxLength={254}
        />
      </label>
      {mode === "password" ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold text-[color:var(--color-neutral-700)]">Password</span>
          <input className="soft-input !min-h-[50px]" name="password" type="password" autoComplete="current-password" required minLength={8} />
        </label>
      ) : null}
      {error ? (
        <div className="notice" role="alert">
          {error}
        </div>
      ) : null}
      <button type="submit" className="soft-btn soft-btn-primary !min-h-[54px] !text-[17px]" disabled={pending}>
        {submitLabel}
      </button>

      {flow === "member" ? (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[13px]">
          {mode !== "signup" ? (
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 font-bold text-accent-700 underline underline-offset-2"
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
              className="cursor-pointer border-0 bg-transparent p-0 font-bold text-accent-700 underline underline-offset-2"
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
              className="cursor-pointer border-0 bg-transparent p-0 font-bold text-accent-700 underline underline-offset-2"
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
    </form>
  );
}
