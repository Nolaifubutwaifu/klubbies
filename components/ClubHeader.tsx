import Link from "next/link";
import type { ClubContext } from "@/lib/auth/session";
import { formatLongDate } from "@/lib/format";

export function ClubHeader({ ctx, displayName, area }: { ctx: ClubContext; displayName: string; area: "member" | "admin" }) {
  const { club, membership, isAdmin } = ctx;
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-divider px-6 py-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <Link href="/clubs" className="brand" style={{ fontSize: 18 }}>
            klubbies
          </Link>
          <span className="text-neutral-400">/</span>
          <Link href={`/c/${club.handle}`} className="font-heading text-[18px] font-extrabold text-ink no-underline">
            {club.name}
          </Link>
          {area === "admin" ? <span className="tag tag-accent">Admin</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[13px] text-neutral-700">{displayName}</span>
          {area === "member" ? (
            isAdmin ? (
              <Link href={`/admin/${club.handle}`} className="tag tag-accent no-underline">
                Admin
              </Link>
            ) : membership?.status === "grace" ? (
              <span className="tag tag-accent-2">Leaving</span>
            ) : (
              <span className="tag tag-accent">Member</span>
            )
          ) : (
            <Link href={`/c/${club.handle}`} className="btn btn-ghost text-[13px]">
              Member view
            </Link>
          )}
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost text-[13px]">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {membership?.status === "grace" && membership.grace_ends_at ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-divider bg-accent-100 px-6 py-3 text-[14px] text-accent-800">
          <span>
            <strong>Your access to {club.name} ends on {formatLongDate(membership.grace_ends_at)}.</strong> You can still
            open and download everything shared before you left the member list. Save anything you want to keep.
          </span>
        </div>
      ) : null}
    </>
  );
}
