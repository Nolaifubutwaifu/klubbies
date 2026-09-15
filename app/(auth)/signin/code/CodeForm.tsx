"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function CodeForm({ restartHref }: { restartHref: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify_code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body: { error?: string; redirectTo?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !body.redirectTo) {
        setError(body.error ?? "That code didn't work.");
        setPending(false);
        return;
      }
      router.replace(body.redirectTo);
      router.refresh();
    } catch {
      setError("You seem to be offline. Try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-[420px] flex-col gap-4">
      <label className="field">
        Six digit code
        <input
          className="input font-heading"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          placeholder="000000"
          required
          autoFocus
          style={{ fontSize: 32, fontWeight: 900, letterSpacing: "0.3em", minHeight: 64 }}
        />
      </label>
      {error ? (
        <div className="notice" role="alert">
          {error}
        </div>
      ) : null}
      <button type="submit" className="btn btn-primary btn-lg justify-start" disabled={pending || code.length !== 6}>
        {pending ? "Checking…" : "Open my albums"}
      </button>
      <div className="border-t-2 border-divider pt-3 text-[13px] leading-normal text-neutral-600">
        No email after a minute? Check spam, or{" "}
        <Link href={restartHref} className="font-semibold">
          request a new code
        </Link>
        .
      </div>
    </form>
  );
}
