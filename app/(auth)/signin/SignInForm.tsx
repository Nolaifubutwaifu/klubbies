"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SignInForm({ flow }: { flow: "member" | "create" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request_code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName: form.get("fullName"), email: form.get("email"), flow }),
      });
      if (!res.ok) {
        const body: { error?: string } = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong. Try again.");
        setPending(false);
        return;
      }
      router.push(flow === "create" ? "/signin/code?flow=create" : "/signin/code");
    } catch {
      setError("You seem to be offline. Try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-[420px] flex-col gap-4">
      <label className="field">
        Full name
        <input className="input" name="fullName" autoComplete="name" placeholder="Mara Lindqvist" required maxLength={200} />
      </label>
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
      {error ? (
        <div className="notice" role="alert">
          {error}
        </div>
      ) : null}
      <button type="submit" className="btn btn-primary btn-lg justify-start text-left" disabled={pending}>
        {pending ? "Checking the list…" : flow === "create" ? "Send me a code" : "Check my access"}
      </button>
      <div className="border-t-2 border-divider pt-3 text-[13px] leading-normal text-neutral-600">
        {flow === "create"
          ? "We'll email you a six digit code. No password to forget."
          : "We'll email a six digit code to the address your club has on file. No password to forget."}
      </div>
    </form>
  );
}
