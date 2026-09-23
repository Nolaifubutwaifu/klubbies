"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { acceptInviteAction, declineInviteAction } from "@/app/(app)/actions";
import type { MyClub } from "@/lib/auth/session";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "??";
  return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClubSwitcher({
  current,
  clubs,
  invites,
  logoUrl,
  clubLogoUrls = {},
}: {
  current: { name: string; handle: string } | null;
  clubs: MyClub[];
  invites: MyClub[];
  logoUrl?: string | null;
  /** Signed logo per club id, so the list matches the button above it. */
  clubLogoUrls?: Record<string, string>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const others = clubs.filter((c) => c.handle !== current?.handle);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border-0 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] px-3 py-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
          <img src={logoUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-accent-500),var(--color-accent-700))] text-[10px] font-extrabold text-white">
            {initials(current?.name ?? "Klubbies")}
          </span>
        )}
        <span className="soft-wordmark text-[17px]">{current?.name ?? "Your clubs"}</span>
        {invites.length ? <span className="tag tag-accent text-[10px]">{invites.length} new</span> : null}
        <span className="text-[11px] text-ink-55">▾</span>
      </button>

      {open ? (
        <div
          className="soft-card absolute left-0 top-[calc(100%+8px)] z-40 w-[320px] max-w-[92vw] overflow-hidden !p-0"
          role="menu"
        >
          <div className="label-caps px-4 pt-3">Your clubs</div>
          <div className="flex flex-col">
            {others.length === 0 && clubs.length <= 1 ? (
              <p className="px-4 py-3 text-[13px] text-ink-70">
                You&apos;re only in this club. Ask another committee to add your email, or start your own.
              </p>
            ) : null}
            {clubs.map((club) => (
              <Link
                key={club.membershipId}
                href={`/c/${club.handle}`}
                className="flex items-center gap-3 border-t border-divider px-4 py-3 text-ink no-underline hover:bg-accent-100"
                onClick={() => setOpen(false)}
                aria-current={club.handle === current?.handle}
              >
                <span
                  className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden text-[11px] font-extrabold text-white"
                  style={{ background: clubLogoUrls[club.clubId] ? "transparent" : "var(--color-neutral-900)" }}
                >
                  {clubLogoUrls[club.clubId] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
                    <img src={clubLogoUrls[club.clubId]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(club.name)
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-heading text-[15px] font-bold">{club.name}</span>
                  <span className="block text-[12px] text-ink-70">
                    {club.roleName}
                    {club.status === "grace" ? " · access ending" : ""}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          {invites.map((invite) => (
            <div key={invite.membershipId} className="m-3 border-2 border-accent bg-accent-100 p-3">
              <p className="text-[14px] text-accent-800">
                <strong>{invite.name}</strong> added you to their member list.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary text-[13px]"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await acceptInviteAction(invite.membershipId);
                      if (res.ok) {
                        setOpen(false);
                        router.push(`/c/${invite.handle}`);
                        router.refresh();
                      }
                    })
                  }
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="btn btn-ghost text-[13px]"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await declineInviteAction(invite.membershipId);
                      router.refresh();
                    })
                  }
                >
                  Not me
                </button>
              </div>
            </div>
          ))}

          <div className="border-t-2 border-divider p-3">
            <Link href="/admin/new" className="btn btn-secondary w-full justify-center text-[13px]" onClick={() => setOpen(false)}>
              Start another club
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
