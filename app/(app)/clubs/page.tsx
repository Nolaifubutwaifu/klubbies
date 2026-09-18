import type { Metadata } from "next";
import Link from "next/link";
import { InviteCard } from "@/components/InviteCard";
import { Brand, EmptyState, PageTitle } from "@/components/ui";
import { getProfile, listMyClubs, requireUser } from "@/lib/auth/session";
import { formatLongDate } from "@/lib/format";

export const metadata: Metadata = { title: "Your clubs" };

export default async function ClubsPage() {
  await requireUser("/clubs");
  const [{ clubs, invites }, profile] = await Promise.all([listMyClubs(), getProfile()]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-divider px-6 py-4">
        <Brand href="/clubs" />
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-[13px] text-neutral-700">
            {profile?.display_name ?? profile?.email}
          </Link>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost text-[13px]">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 py-8">
        <PageTitle title="Your clubs">Pick a club to see its event albums.</PageTitle>

        {invites.length ? (
          <section>
            <span className="label-caps">Invitations</span>
            {invites.map((invite) => (
              <InviteCard key={invite.membershipId} invite={invite} />
            ))}
          </section>
        ) : null}

        {clubs.length === 0 ? (
          <EmptyState
            title={invites.length ? "Accept an invitation to get started" : "You're not on any club list yet"}
            action={
              <Link href="/admin/new" className="btn btn-primary">
                Start a club
              </Link>
            }
          >
            {invites.length
              ? "Your clubs appear here once you accept."
              : `Ask your committee to add ${profile?.email ?? "your email"} to their member list, or start your own club.`}
          </EmptyState>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {clubs.map((club) => (
              <Link
                key={club.membershipId}
                href={`/c/${club.handle}`}
                className="flex flex-col gap-2 border-2 border-divider bg-bg p-6 text-ink no-underline transition-colors hover:border-accent hover:bg-neutral-200"
              >
                <span className="kicker">{club.organisation ?? "Club"}</span>
                <span className="font-heading text-[24px] font-black tracking-[-0.02em]">{club.name}</span>
                <span className="flex flex-wrap gap-2">
                  <span className={club.isAdmin ? "tag tag-accent" : "tag tag-outline"}>{club.roleName}</span>
                  {club.status === "grace" ? (
                    <span className="tag tag-accent-2">Access ends {formatLongDate(club.graceEndsAt)}</span>
                  ) : null}
                </span>
                <span className="text-[12px] text-neutral-600">Member since {formatLongDate(club.since)}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t-2 border-divider pt-4 text-[13px] text-neutral-700">
          <Link href="/admin/new" className="btn btn-secondary">
            Start another club
          </Link>
          <Link href="/account" className="btn btn-secondary">
            Your profile
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
