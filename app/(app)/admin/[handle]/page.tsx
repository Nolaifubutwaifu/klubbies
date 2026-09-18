import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle, Stat } from "@/components/ui";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { formatBytes, formatDateTime } from "@/lib/format";
import { listStackedAlbums } from "@/lib/media/album-list";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin" };

/** Cutoff for the "views this week" figure. */
function sevenDaysAgo(): string {
  return new Date(Date.now() - 7 * 86_400_000).toISOString();
}

export default async function AdminDashboard(props: PageProps<"/admin/[handle]">) {
  const { handle } = await props.params;
  const ctx = await requireAdminContext(handle);
  const supabase = await createClient();
  const clubId = ctx.club.id;

  const count = (status?: string) => {
    let q = supabase.from("memberships").select("id", { count: "exact", head: true }).eq("club_id", clubId);
    q = status ? q.eq("status", status) : q.in("status", ["pending", "active", "grace"]);
    return q;
  };

  const [onList, active, pending, grace, albums, published, usage, mismatches, activity, posts, stacked, viewsWeek] = await Promise.all([
    count(),
    count("active"),
    count("pending"),
    count("grace"),
    supabase.from("albums").select("id", { count: "exact", head: true }).eq("club_id", clubId),
    supabase.from("albums").select("id", { count: "exact", head: true }).eq("club_id", clubId).eq("status", "published"),
    supabase.from("club_storage_usage").select("*").eq("club_id", clubId).maybeSingle(),
    supabase
      .from("memberships")
      .select("id, roster_name, claimed_name, roster_email")
      .eq("club_id", clubId)
      .eq("name_mismatch", true)
      .in("status", ["active", "grace"])
      .limit(5),
    supabase
      .from("access_events")
      .select("id, action, occurred_at, memberships(roster_name), media(original_filename)")
      .eq("club_id", clubId)
      .order("occurred_at", { ascending: false })
      .limit(6),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("club_id", clubId),
    listStackedAlbums(supabase, clubId, { includeDrafts: true, limit: 4 }),
    supabase
      .from("access_events")
      .select("id", { count: "exact", head: true })
      .eq("club_id", clubId)
      .eq("action", "view")
      .gte("occurred_at", sevenDaysAgo()),
  ]);

  const drafts = (albums.count ?? 0) - (published.count ?? 0);
  const recentTiles = stacked.flatMap((album) => album.tiles.map((t) => ({ ...t, albumId: album.id }))).slice(0, 12);
  const firstRun = (onList.count ?? 0) <= 1 && (albums.count ?? 0) === 0;

  // The committee screen is a control panel: what needs doing, then the
  // numbers, then the evidence.
  const tasks = [
    mismatches.data?.length
      ? {
          key: "names",
          title: `${mismatches.data.length} member${mismatches.data.length === 1 ? "" : "s"} signed in under a different name`,
          body: mismatches.data.map((m) => m.roster_name).join(", "),
          href: `/admin/${handle}/members`,
          cta: "Review",
          urgent: true,
        }
      : null,
    drafts > 0
      ? {
          key: "drafts",
          title: `${drafts} album${drafts === 1 ? "" : "s"} still in draft`,
          body: "Nobody in the club can see a draft yet.",
          href: `/admin/${handle}/albums`,
          cta: "Publish",
          urgent: true,
        }
      : null,
    (pending.count ?? 0) > 0
      ? {
          key: "pending",
          title: `${(pending.count ?? 0).toLocaleString("en-AU")} members have never signed in`,
          body: "Mostly first years. A nudge usually does it.",
          href: `/admin/${handle}/members`,
          cta: "Open members",
          urgent: false,
        }
      : null,
  ].filter((task): task is NonNullable<typeof task> => task !== null);

  return (
    <main className="flex flex-col gap-7 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle kicker={ctx.club.name} title="Overview" underline />
        <div className="flex flex-wrap gap-2">
          <Link href={`/c/${handle}`} className="soft-btn soft-btn-tonal no-underline">
            See it as a member
          </Link>
          <Link href={`/admin/${handle}/albums`} className="soft-btn soft-btn-primary no-underline">
            New album
          </Link>
        </div>
      </div>

      {firstRun ? (
        <div className="soft-bordered flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <span className="soft-chip">Getting started</span>
            <div className="soft-display mt-2 text-[20px]">Add your members, then upload the first album.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/${handle}/members`} className="soft-btn soft-btn-primary no-underline">
              Add members
            </Link>
            <Link href={`/admin/${handle}/albums`} className="soft-btn soft-btn-tonal no-underline">
              New album
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        <Stat
          value={(onList.count ?? 0).toLocaleString("en-AU")}
          label="Members"
          hint={`${(active.count ?? 0).toLocaleString("en-AU")} signed in`}
        />
        <Stat
          value={(albums.count ?? 0).toLocaleString("en-AU")}
          label="Albums"
          hint={drafts > 0 ? `${drafts} draft` : "all published"}
          tone={drafts > 0 ? "attention" : "plain"}
        />
        <Stat
          value={(usage.data?.item_count ?? 0).toLocaleString("en-AU")}
          label="Photos and videos"
          hint={formatBytes(usage.data?.total_bytes ?? 0)}
        />
        <Stat
          value={(viewsWeek.count ?? 0).toLocaleString("en-AU")}
          label="Views this week"
          hint={(viewsWeek.count ?? 0) > 0 ? "members opening albums" : "nothing opened yet"}
          tone={(viewsWeek.count ?? 0) > 0 ? "good" : "plain"}
        />
        <Stat
          value={(grace.count ?? 0).toLocaleString("en-AU")}
          label="Winding down"
          hint={(grace.count ?? 0) > 0 ? "30 day access window" : "nobody leaving"}
          tone={(grace.count ?? 0) > 0 ? "attention" : "plain"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,330px)]">
        <div className="flex flex-col gap-6">
          <section className="soft-card flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <h2 className="soft-display text-[19px]">Needs you</h2>
              {tasks.length ? (
                <span className="soft-chip">{tasks.length}</span>
              ) : (
                <span className="soft-chip soft-chip-muted">All clear</span>
              )}
            </div>
            {tasks.length ? (
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {tasks.map((task) => (
                  <li
                    key={task.key}
                    className="flex flex-wrap items-center gap-3 rounded-[16px] border border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] bg-[color:var(--color-bg)] p-3.5"
                  >
                    <span
                      className={`h-[7px] w-[7px] flex-none rounded-full ${task.urgent ? "bg-accent" : "bg-[color:var(--color-neutral-400)]"}`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-bold">{task.title}</span>
                      <span className="block truncate text-[12px] text-[color:var(--ink-70)]">{task.body}</span>
                    </span>
                    <Link href={task.href} className="soft-btn soft-btn-tonal !min-h-[40px] !px-4 !text-[13px] no-underline">
                      {task.cta}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[14px] text-[color:var(--ink-70)]">
                Nothing waiting on you. Every album is published and everyone on the list has signed in.
              </p>
            )}
          </section>

          <section className="soft-card flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="soft-display text-[19px]">Latest photos</h2>
              <Link href={`/admin/${handle}/albums`} className="text-[13px] font-bold">
                All albums
              </Link>
            </div>
            {recentTiles.length ? (
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))" }}>
                {recentTiles.map((tile, index) => (
                  <Link
                    key={tile.id}
                    href={`/c/${handle}/a/${tile.albumId}/${tile.id}`}
                    className="soft-tile aspect-square"
                    style={index === 0 ? { gridColumn: "span 2", gridRow: "span 2" } : undefined}
                  >
                    {tile.url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
                      <img src={tile.url} alt="" loading="lazy" />
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="m-0 text-[14px] text-[color:var(--ink-70)]">
                Nothing uploaded yet. Your newest photos will show up here.
              </p>
            )}
          </section>
        </div>

        <section className="soft-card flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="soft-display text-[19px]">Activity</h2>
            <Link href={`/admin/${handle}/activity`} className="text-[13px] font-bold">
              Full log
            </Link>
          </div>
          {activity.data?.length ? (
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {activity.data.map((e, i) => (
                <li key={e.id} className="flex gap-3">
                  <span
                    className={`mt-[7px] h-2 w-2 flex-none rounded-full ${i === 0 ? "bg-accent" : "bg-[color:var(--color-neutral-400)]"}`}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-[14px]">
                      <strong className="font-bold">{e.memberships?.roster_name ?? "Admin"}</strong>{" "}
                      {e.action === "download" ? "downloaded" : "viewed"} {e.media?.original_filename ?? "an item"}
                    </span>
                    <span className="block text-[12px] text-[color:var(--ink-55)]">{formatDateTime(e.occurred_at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-[14px] text-[color:var(--ink-70)]">
              No views yet. Once members open an album, you&apos;ll see who looked at what.
            </p>
          )}
          <div className="mt-auto rounded-[16px] border border-dashed border-[color-mix(in_srgb,var(--color-text)_16%,transparent)] p-4">
            <span className="block text-[13px] font-bold">Club feed</span>
            <span className="block text-[13px] text-[color:var(--ink-70)]">
              {(posts.count ?? 0).toLocaleString("en-AU")} posts so far.
            </span>
            <Link href={`/c/${handle}/feed`} className="soft-btn soft-btn-tonal !min-h-[40px] mt-3 !px-4 !text-[13px] no-underline">
              Post to the feed
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
