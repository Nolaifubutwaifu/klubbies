/* eslint-disable @next/next/no-img-element -- short-lived signed URLs */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionFx } from "@/components/soft/SectionFx";
import { PhotoStackArt } from "@/components/soft/illustrations";
import { getClubContext } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { listFavourites } from "@/lib/media/favourites";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(props: PageProps<"/c/[handle]/saved">): Promise<Metadata> {
  const { handle } = await props.params;
  const ctx = await getClubContext(handle);
  return { title: ctx ? `Saved · ${ctx.club.name}` : "Saved" };
}

function duration(seconds: number | null): string {
  if (!seconds) return "";
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default async function SavedPage(props: PageProps<"/c/[handle]/saved">) {
  const { handle } = await props.params;
  const ctx = await getClubContext(handle);
  if (!ctx) notFound();

  const supabase = await createClient();
  const groups = await listFavourites(supabase, ctx.club.id, ctx.userId);
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <main className="flex flex-1 flex-col">
      <section className="soft-fx-host">
        <SectionFx blobs={["left"]} />
        <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="soft-chip">{ctx.club.name}</span>
              <h1 className="mt-3 text-[clamp(30px,4.5vw,44px)]">Saved</h1>
              <p className="mt-2 text-[15px] text-[color:var(--ink-70)]">
                {total
                  ? `${total.toLocaleString("en-AU")} favourite${total === 1 ? "" : "s"} across ${groups.length} album${groups.length === 1 ? "" : "s"}.`
                  : "The good ones, kept in one place."}
              </p>
            </div>
            <Link href={`/c/${handle}`} className="soft-btn soft-btn-tonal no-underline">
              All events
            </Link>
          </div>

          {total === 0 ? (
            <div className="soft-card mt-8 flex flex-col items-start gap-3 p-8">
              <span className="text-accent-400">
                <PhotoStackArt size={120} />
              </span>
              <h2 className="text-[24px]">No favourites yet.</h2>
              <p className="m-0 max-w-[46ch] text-[15px] text-[color:var(--ink-70)]">
                Open any photo and hit Save. It turns up here at full quality, ready to download.
              </p>
              <Link href={`/c/${handle}`} className="soft-btn soft-btn-primary no-underline">
                Browse the albums
              </Link>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-9">
              {groups.map((group) => (
                <section key={group.albumId}>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/c/${handle}/a/${group.albumId}`} className="soft-display text-[19px] text-ink no-underline">
                      {group.albumTitle}
                    </Link>
                    {group.albumDate ? <span className="soft-chip soft-chip-muted">{formatDate(group.albumDate)}</span> : null}
                    <span className="text-[13px] text-[color:var(--ink-55)]">
                      {group.items.length} saved
                    </span>
                  </div>
                  <div
                    className="mt-3 grid gap-2"
                    style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
                  >
                    {group.items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/c/${handle}/a/${group.albumId}/${item.id}`}
                        className="soft-tile relative block aspect-square"
                        scroll={false}
                      >
                        {item.thumbUrl ? (
                          <img src={item.thumbUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : null}
                        {item.kind === "video" ? (
                          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-[rgba(25,18,22,0.72)] px-2 py-0.5 text-[10px] font-bold text-white">
                            {duration(item.durationSeconds) || "Video"}
                          </span>
                        ) : null}
                        <span className="absolute bottom-1.5 right-1.5 text-white drop-shadow" aria-hidden>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                            <path d="M12 20s-7-4.6-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />
                          </svg>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
