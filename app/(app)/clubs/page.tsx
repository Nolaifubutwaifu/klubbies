import type { Metadata } from "next";
import Link from "next/link";
import { Brand, EmptyState, PageTitle } from "@/components/ui";
import { getProfile, listMyClubs, requireUser } from "@/lib/auth/session";
import { formatLongDate } from "@/lib/format";

export const metadata: Metadata = { title: "Your clubs" };

export default async function ClubsPage() {
  await requireUser("/clubs");
  const [clubs, profile] = await Promise.all([listMyClubs(), getProfile()]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-divider px-6 py-4">
        <Brand href="/clubs" />
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-neutral-700">{profile?.display_name ?? profile?.email}</span>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost text-[13px]">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 py-8">
        <PageTitle title="Your clubs">Pick a club to see its event albums.</PageTitle>
        {clubs.length === 0 ? (
          <EmptyState
            title="You're not on any club list yet"
            action={
              <Link href="/admin/new" className="btn btn-primary">
                Start a club
              </Link>
            }
          >
            Ask your committee to add {profile?.email ?? "your email"} to their member list, or start your own club.
          </EmptyState>
        ) : (
          <div className="tile-grid border-2 border-divider" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {clubs.map((m) => (
              <Link
                key={m.id}
                href={`/c/${m.clubs.handle}`}
                className="flex flex-col gap-2 bg-bg p-6 text-ink no-underline hover:bg-neutral-200"
              >
                <span className="kicker">{m.clubs.organisation ?? "Club"}</span>
                <span className="font-heading text-[24px] font-black tracking-[-0.02em]">{m.clubs.name}</span>
                <span className="flex flex-wrap gap-2">
                  {m.role === "club_admin" && m.status === "active" ? <span className="tag tag-accent">Admin</span> : null}
                  {m.status === "grace" ? (
                    <span className="tag tag-accent-2">Access ends {formatLongDate(m.grace_ends_at)}</span>
                  ) : null}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t-2 border-divider pt-4 text-[13px] text-neutral-700">
          <Link href="/admin/new" className="btn btn-secondary">
            Start another club
          </Link>
          <form action="/api/auth/signout" method="post">
            <input type="hidden" name="scope" value="global" />
            <button type="submit" className="btn btn-ghost text-[13px]">
              Sign out of all devices
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
