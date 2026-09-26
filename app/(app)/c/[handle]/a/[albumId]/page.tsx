import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Uploader } from "@/app/(app)/admin/[handle]/albums/[albumId]/Uploader";
import { AlbumEditPanel } from "@/components/AlbumEditPanel";
import { AlbumGrid } from "@/components/AlbumGrid";
import { AlbumActions } from "@/components/AlbumActions";
import { UnfinishedUploads } from "@/components/UnfinishedUploads";
import { getClubContext } from "@/lib/auth/session";
import { formatLongDate } from "@/lib/format";
import { eventTypeLabel } from "@/lib/media/event-types";
import { favouritedIds } from "@/lib/media/favourites";
import { listAlbumMedia } from "@/lib/media/queries";
import { ProcessingBanner } from "@/components/ProcessingBanner";
import { SIGNED_URL_TTL, signPaths } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Props = PageProps<"/c/[handle]/a/[albumId]">;

async function load(props: Props) {
  const { handle, albumId } = await props.params;
  if (!z.uuid().safeParse(albumId).success) return null;
  const ctx = await getClubContext(handle);
  if (!ctx) return null;
  const supabase = await createClient();
  const { data: album } = await supabase.from("albums").select("*").eq("id", albumId).eq("club_id", ctx.club.id).maybeSingle();
  if (!album) return null;
  if (album.status !== "published" && !ctx.perms.manage_albums) return null;
  return { ctx, album, supabase, handle };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await load(props);
  return { title: data?.album.title ?? "Album" };
}

export default async function AlbumPage(props: Props) {
  const data = await load(props);
  if (!data) notFound();
  const { ctx, album, supabase, handle } = data;
  const search = await props.searchParams;

  const canManage = ctx.perms.manage_albums;
  const canAdd = canManage || (album.contributor_scope === "members" && Boolean(ctx.membership));
  const editing = canManage && search.edit === "1";
  const adding = canAdd && search.add === "1";
  const albumHref = `/c/${handle}/a/${album.id}`;

  const [{ items, hasMore }, { data: counts }, { data: unfinished }, { data: readyIds }] = await Promise.all([
    listAlbumMedia(supabase, album.id, 0, { includeProcessing: canManage }),
    supabase.from("album_media_counts").select("*").eq("album_id", album.id).maybeSingle(),
    canManage
      ? supabase
          .from("media")
          .select("id, original_filename, created_at, status")
          .eq("album_id", album.id)
          .neq("status", "ready")
          .order("created_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [] }),
    supabase
      .from("media")
      .select("id")
      .eq("album_id", album.id)
      .eq("status", "ready")
      .order("sort_at", { ascending: true })
      .limit(240),
  ]);

  // "Added by Mahi and 1 guest" — who put the night together, which is the
  // line the design leads the album with.
  const [{ data: uploaders }, { count: guestFiles }, { count: savedTotal }] = await Promise.all([
    supabase.from("media").select("uploaded_by").eq("album_id", album.id).not("uploaded_by", "is", null).limit(400),
    supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("album_id", album.id)
      .not("guest_link_id", "is", null),
    supabase
      .from("favourites")
      .select("media_id", { count: "exact", head: true })
      .eq("club_id", ctx.club.id)
      .eq("user_id", ctx.userId)
      .in("media_id", (readyIds ?? []).map((m) => m.id)),
  ]);

  // Members can't read an unfinished row, so the count comes from the service
  // role — after the membership check above, never before it. It's a tally of
  // files in an album they can already open, and no more than that.
  let processingPhotos = 0;
  let processingVideos = 0;
  if (!canManage && ctx.membership) {
    const { data: pending } = await createAdminClient()
      .from("media")
      .select("kind")
      .eq("album_id", album.id)
      .eq("status", "processing")
      .is("hidden_at", null)
      .limit(200);
    for (const row of pending ?? []) {
      if (row.kind === "video") processingVideos += 1;
      else processingPhotos += 1;
    }
  }

  const uploaderIds = [...new Set((uploaders ?? []).map((m) => m.uploaded_by).filter((id): id is string => Boolean(id)))];
  const { data: uploaderNames } = uploaderIds.length
    ? await supabase
        .from("memberships")
        .select("user_id, roster_name, claimed_name")
        .eq("club_id", ctx.club.id)
        .in("user_id", uploaderIds.slice(0, 10))
    : { data: [] };

  const firstNames = (uploaderNames ?? [])
    .map((m) => (m.claimed_name ?? m.roster_name).trim().split(/\s+/)[0])
    .filter(Boolean);
  const guestCount = guestFiles ?? 0;
  const addedBy = [
    firstNames.length === 1
      ? firstNames[0]
      : firstNames.length > 1
        ? `${firstNames.slice(0, 2).join(" and ")}${firstNames.length > 2 ? ` +${firstNames.length - 2}` : ""}`
        : null,
    guestCount > 0 ? "a guest photographer" : null,
  ]
    .filter(Boolean)
    .join(" and ");

  let coverUrl: string | null = null;
  let coverSource = "The first photo in the album is used until you choose one.";
  if (album.cover_path) {
    coverUrl = (await signPaths(supabase, [album.cover_path], SIGNED_URL_TTL.display)).get(album.cover_path) ?? null;
    coverSource = "Your own cover image.";
  } else if (album.cover_media_id) {
    const { data: cover } = await supabase
      .from("media")
      .select("display_path, thumb_path")
      .eq("id", album.cover_media_id)
      .maybeSingle();
    const path = cover?.display_path ?? cover?.thumb_path;
    if (path) coverUrl = (await signPaths(supabase, [path], SIGNED_URL_TTL.display)).get(path) ?? null;
    coverSource = "Chosen from this album.";
  } else if (items[0]?.thumbUrl) {
    coverUrl = items[0].thumbUrl;
  }

  const savedIds = await favouritedIds(supabase, ctx.userId, items.map((item) => item.id));

  const photoCount = counts?.photo_count ?? 0;
  const videoCount = counts?.video_count ?? 0;

  return (
    <main className="flex flex-1 flex-col">
      {/* Sticky album header: the title and the download stay reachable while
          you scroll a thousand photos. */}
      <div className="sticky top-0 z-20 border-b border-[color:var(--kb-line)] bg-[rgb(255_248_244/0.94)] backdrop-blur-md">
        <div className="flex w-full flex-wrap items-center gap-4 px-4 py-3.5 sm:px-6">
          <Link
            href={`/c/${handle}`}
            aria-label="Back to all events"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] text-ink no-underline transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
              <path d="M14 6l-6 6 6 6" />
            </svg>
          </Link>

          <div className="min-w-[220px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="soft-display truncate text-[clamp(20px,2.6vw,28px)]">{album.title}</h1>
              {eventTypeLabel(album.event_type) ? (
                <span className="soft-chip">{eventTypeLabel(album.event_type)}</span>
              ) : null}
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[14px] text-[color:var(--ink-70)]">
              <span className="whitespace-nowrap">
                {[
                  formatLongDate(album.event_date),
                  photoCount ? `${photoCount.toLocaleString("en-AU")} photos` : null,
                  videoCount ? `${videoCount.toLocaleString("en-AU")} videos` : null,
                  addedBy ? `added by ${addedBy}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              <span className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                Members only
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canManage && album.status !== "published" ? (
              <span className="soft-chip soft-chip-muted hidden sm:inline-flex">Draft · members can&rsquo;t see it</span>
            ) : null}
            <AlbumActions
              albumId={album.id}
              mediaIds={(readyIds ?? []).map((m) => m.id)}
              parts={Math.max(1, Math.ceil((photoCount + videoCount) / 150))}
              canDownload={album.allow_download || canManage}
              canManage={canManage}
              canAdd={canAdd}
              published={album.status === "published"}
              albumHref={albumHref}
              editing={editing}
              adding={adding}
            />
          </div>
        </div>
      </div>

      {album.description ? (
        <div className="w-full px-4 pt-5 sm:px-6">
          <p className="max-w-[60ch] text-[15px] leading-normal text-[color:var(--ink-70)]">{album.description}</p>
        </div>
      ) : null}

      {album.contributor_scope === "members" && !canManage && ctx.membership ? (
        <div className="kb-info mx-4 mt-4 sm:mx-6">Everyone in {ctx.club.name} can add photos to this album. Yours appear straight away.</div>
      ) : null}

      {canManage && unfinished?.length ? <UnfinishedUploads items={unfinished} addHref={`${albumHref}?add=1`} /> : null}

      <ProcessingBanner photos={processingPhotos} videos={processingVideos} />

      {adding ? (
        <div className="border-b border-[color:var(--kb-line)] p-4 sm:p-6">
          <Uploader albumId={album.id} />
        </div>
      ) : null}

      {editing ? (
        <AlbumEditPanel
          album={{
            id: album.id,
            clubId: album.club_id,
            title: album.title,
            eventDate: album.event_date,
            eventType: album.event_type,
            description: album.description,
            allowDownload: album.allow_download,
            visibility: album.visibility,
            contributorScope: album.contributor_scope,
            coverUrl,
            coverSource,
          }}
          closeHref={albumHref}
          onPickCover={`${albumHref}?pickCover=1`}
        />
      ) : null}

      <AlbumGrid
        key={`${items.length}-${album.cover_media_id ?? album.cover_path ?? ""}`}
        albumId={album.id}
        hrefBase={albumHref}
        initialItems={items}
        initialHasMore={hasMore}
        coverMediaId={album.cover_media_id}
        canManage={canManage}
        selectMode={search.pickCover === "1"}
        photoCount={photoCount}
        videoCount={videoCount}
        savedIds={[...savedIds]}
        savedTotal={savedTotal ?? savedIds.size}
        processingCount={processingPhotos + processingVideos}
        canDownload={album.allow_download || canManage}
      />
    </main>
  );
}
