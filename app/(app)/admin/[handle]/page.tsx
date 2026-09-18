import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle, Stat } from "@/components/ui";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { formatBytes, formatDateTime } from "@/lib/format";
import { listStackedAlbums } from "@/lib/media/album-list";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin" };

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

  const [onList, active, pending, grace, albums, published, usage, mismatches, activity, posts, stacked] = await Promise.all([
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
  ]);

  const drafts = (albums.count ?? 0) - (published.count ?? 0);
  const recentTiles = stacked.flatMap((album) => album.tiles.map((t) => ({ ...t, albumId: album.id }))).slice(0, 12);
  const firstRun = (onList.count ?? 0) <= 1 && (albums.count ?? 0) === 0;

  return (
    <main className="flex max-w-[1180px] flex-col gap-6 px-6 py-8">
      <PageTitle kicker={ctx.club.name} title="Overview" />
      <div className="hr" />

      {firstRun ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-accent p-4">
          <div>
            <div className="kicker">Getting started</div>
            <div className="mt-1 font-heading text-[20px] font-extrabold">Add your members, then upload the first album.</div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/${handle}/members`} className="btn btn-primary">
              Add members
            </Link>
            <Link href={`/admin/${handle}/albums`} className="btn btn-secondary">
              New album
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <Stat value={(onList.count ?? 0).toLocaleString("en-AU")} label={`on the list · ${(pending.count ?? 0).toLocaleString("en-AU")} not signed in`} />
        <Stat value={(active.count ?? 0).toLocaleString("en-AU")} label={`signed in · ${grace.count ?? 0} leaving`} />
        <Stat value={(published.count ?? 0).toLocaleString("en-AU")} label={`albums published · ${drafts} draft`} />
        <Stat
          value={formatBytes(usage.data?.total_bytes ?? 0)}
          label={`${(usage.data?.item_count ?? 0).toLocaleString("en-AU")} photos and videos stored`}
        />
      </div>

      <section className="flex flex-col gap-3 border-2 border-divider p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-[18px] font-extrabold">Jump back in</h2>
          <Link href={`/c/${handle}`} className="text-[13px] font-semibold">
            See the club as a member
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/${handle}/albums`} className="btn btn-primary">
            New album
          </Link>
          <Link href={`/admin/${handle}/members`} className="btn btn-secondary">
            Import a member list
          </Link>
          <Link href={`/c/${handle}/feed`} className="btn btn-secondary">
            Post to the feed
          </Link>
          <Link href={`/admin/${handle}/roles`} className="btn btn-secondary">
            Roles and permissions
          </Link>
          <Link href={`/admin/${handle}/settings`} className="btn btn-secondary">
            Club settings
          </Link>
        </div>
      </section>

      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <section className="flex flex-col gap-3 border-2 border-divider p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[18px] font-extrabold">Latest photos</h2>
            <Link href={`/admin/${handle}/albums`} className="text-[13px] font-semibold">
              All albums
            </Link>
          </div>
          {recentTiles.length ? (
            <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
              {recentTiles.map((tile, index) => (
                <Link
                  key={tile.id}
                  href={`/c/${handle}/a/${tile.albumId}/${tile.id}`}
                  className="tile aspect-square"
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
            <p className="text-[14px] text-neutral-700">Nothing uploaded yet. Your newest photos will show up here.</p>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 border-2 border-divider p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-[18px] font-extrabold">Name check</h2>
              <Link href={`/admin/${handle}/members`} className="text-[13px] font-semibold">
                Members
              </Link>
            </div>
            {mismatches.data?.length ? (
              <ul className="flex flex-col gap-2 text-[14px]">
                {mismatches.data.map((m) => (
                  <li key={m.id} className="border-t border-divider pt-2">
                    <strong>{m.roster_name}</strong> signed in as “{m.claimed_name}”
                    <div className="text-[12px] text-neutral-600">{m.roster_email}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-neutral-700">Everyone who signed in used the name on your list.</p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-2 border-divider p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-[18px] font-extrabold">Recent activity</h2>
              <Link href={`/admin/${handle}/activity`} className="text-[13px] font-semibold">
                Full log
              </Link>
            </div>
            {activity.data?.length ? (
              <ul className="flex flex-col gap-2 text-[14px]">
                {activity.data.map((e) => (
                  <li key={e.id} className="border-t border-divider pt-2">
                    <strong>{e.memberships?.roster_name ?? "Admin"}</strong>{" "}
                    {e.action === "download" ? "downloaded" : "viewed"} {e.media?.original_filename ?? "an item"}
                    <div className="text-[12px] text-neutral-600">{formatDateTime(e.occurred_at)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-neutral-700">
                No views yet. Once members open an album, you&apos;ll see who looked at what.
              </p>
            )}
            <p className="border-t border-divider pt-2 text-[13px] text-neutral-700">
              {(posts.count ?? 0).toLocaleString("en-AU")} feed posts so far.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
