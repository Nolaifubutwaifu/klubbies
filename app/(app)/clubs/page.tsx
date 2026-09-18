import type { Metadata } from "next";
import Link from "next/link";
import { InviteCard } from "@/components/InviteCard";
import { Brand, EmptyState, PageTitle } from "@/components/ui";
import { PhotoStackArt } from "@/components/soft/illustrations";
import { getProfile, listMyClubs, requireUser } from "@/lib/auth/session";
import { formatDate, formatLongDate } from "@/lib/format";
import { listClubCards } from "@/lib/media/club-cards";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your clubs" };

export default async function ClubsPage() {
  const user = await requireUser("/clubs");
  const [{ clubs, invites }, profile] = await Promise.all([listMyClubs(), getProfile()]);
  const cards = await listClubCards(await createClient(), clubs.map((c) => c.clubId), user.id);

  return (
    <main className="flex flex-1 flex-col">
      <header className="soft-card mx-4 mt-5 flex flex-wrap items-center justify-between gap-4 !rounded-[28px] px-5 py-2.5 sm:mx-6">
        <Brand href="/clubs" />
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-[13px] text-neutral-700">
            {profile?.display_name ?? profile?.email}
          </Link>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost !min-h-[38px] !px-4 text-[13px]">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 py-8">
        <PageTitle title="Your clubs" underline>
          Pick a club to see its event albums.
        </PageTitle>

        {invites.length ? (
          <section>
            <span className="soft-display text-[17px]">Invitations</span>
            {invites.map((invite) => (
              <InviteCard key={invite.membershipId} invite={invite} />
            ))}
          </section>
        ) : null}

        {clubs.length === 0 ? (
          <EmptyState
            title={invites.length ? "Accept an invitation to get started" : "You're not on any club list yet"}
            art={<PhotoStackArt size={120} />}
            action={
              <Link href="/admin/new" className="soft-btn soft-btn-primary no-underline">
                Start a club
              </Link>
            }
          >
            {invites.length
              ? "Your clubs appear here once you accept."
              : `Ask your committee to add ${profile?.email ?? "your email"} to their member list, or start your own club.`}
          </EmptyState>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {clubs.map((club) => {
              const card = cards.get(club.clubId);
              return (
                <Link
                  key={club.membershipId}
                  href={`/c/${club.handle}`}
                  className="soft-card group flex flex-col overflow-hidden !p-0 text-ink no-underline"
                >
                  {/* The photos are the point, so they lead. */}
                  <span className="relative block aspect-[16/10] bg-[color:var(--tone-support)]">
                    {card?.tiles.length ? (
                      <span
                        className="grid h-full w-full gap-[2px]"
                        style={{
                          gridTemplateColumns: card.tiles.length > 1 ? "repeat(3, minmax(0, 1fr))" : "1fr",
                          gridTemplateRows: card.tiles.length > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr",
                        }}
                      >
                        {card.tiles.slice(0, 3).map((url, i) => (
                          <span
                            key={url}
                            className="block overflow-hidden"
                            style={i === 0 && card.tiles.length > 1 ? { gridColumn: "span 2", gridRow: "span 2" } : undefined}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                            <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-[13px] text-[color:var(--ink-55)]">
                        <span className="text-accent-400">
                          <PhotoStackArt size={92} />
                        </span>
                        {card && card.itemCount > 0 ? "Previews still processing" : "No photos yet"}
                      </span>
                    )}
                    {card && card.newCount > 0 ? (
                      <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[12px] font-bold text-white">
                        {card.newCount} new
                      </span>
                    ) : null}
                    {club.status === "grace" ? (
                      <span className="absolute right-3 top-3 rounded-full bg-[rgba(25,18,22,0.72)] px-3 py-1 text-[12px] font-bold text-white">
                        Access ends {formatDate(club.graceEndsAt)}
                      </span>
                    ) : null}
                  </span>

                  <span className="flex flex-1 flex-col gap-2 p-5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={club.isAdmin ? "soft-chip" : "soft-chip soft-chip-muted"}>{club.roleName}</span>
                      {club.organisation ? (
                        <span className="text-[12px] text-[color:var(--ink-55)]">{club.organisation}</span>
                      ) : null}
                    </span>
                    <span className="soft-display text-[24px]">{club.name}</span>
                    <span className="text-[13px] text-[color:var(--ink-70)]">
                      {card && card.albumCount
                        ? `${card.albumCount.toLocaleString("en-AU")} album${card.albumCount === 1 ? "" : "s"} · ${card.itemCount.toLocaleString("en-AU")} photos and videos`
                        : "Nothing uploaded yet"}
                    </span>
                    {card?.latestTitle ? (
                      <span className="mt-auto pt-2 text-[13px] text-[color:var(--ink-55)]">
                        Latest: {card.latestTitle}
                        {card.latestDate ? ` · ${formatDate(card.latestDate)}` : ""}
                      </span>
                    ) : (
                      <span className="mt-auto pt-2 text-[12px] text-[color:var(--ink-55)]">
                        Member since {formatLongDate(club.since)}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2 text-[13px] text-[color:var(--ink-70)]">
          <Link href="/admin/new" className="soft-btn soft-btn-tonal no-underline">
            Start another club
          </Link>
          <Link href="/account" className="soft-btn soft-btn-tonal no-underline">
            Your profile
          </Link>
          <form action="/api/auth/signout" method="post">
            <input type="hidden" name="scope" value="global" />
            <button type="submit" className="btn btn-ghost !min-h-[38px] !px-4 text-[13px]">
              Sign out of all devices
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
