import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Uploader } from "@/app/(app)/admin/[handle]/albums/[albumId]/Uploader";
import { PublishToggle } from "@/app/(app)/admin/[handle]/albums/[albumId]/PublishToggle";
import { AlbumEditPanel } from "@/components/AlbumEditPanel";
import { AlbumGrid } from "@/components/AlbumGrid";
import { UnfinishedUploads } from "@/components/UnfinishedUploads";
import { getClubContext } from "@/lib/auth/session";
import { formatLongDate } from "@/lib/format";
import { listAlbumMedia } from "@/lib/media/queries";
import { SIGNED_URL_TTL, signPaths } from "@/lib/storage";
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

  const [{ items, hasMore }, { data: counts }, { data: unfinished }] = await Promise.all([
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
  ]);

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

  const photoCount = counts?.photo_count ?? 0;
  const videoCount = counts?.video_count ?? 0;

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-divider px-6 pb-4 pt-6">
        <div className="min-w-0">
          <Link href={`/c/${handle}`} className="btn btn-ghost pl-0 text-[13px]">
            ← All events
          </Link>
          {canManage ? (
            <div className="kicker mt-2 block">{album.status === "published" ? "Published" : "Draft · members can't see it yet"}</div>
          ) : null}
          <h1 className="display mt-1" style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>
            {album.title}
          </h1>
          <p className="mt-2 text-[14px] text-neutral-700">
            {[
              formatLongDate(album.event_date),
              photoCount ? `${photoCount.toLocaleString("en-AU")} photos` : null,
              videoCount ? `${videoCount.toLocaleString("en-AU")} videos` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {album.description ? (
            <p className="mt-3 max-w-[60ch] text-[15px] leading-normal text-neutral-800">{album.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage ? (
            <Link href={editing ? albumHref : `${albumHref}?edit=1`} className="btn btn-secondary text-[14px]">
              {editing ? "Close details" : "Edit album details"}
            </Link>
          ) : null}
          {canAdd ? (
            <Link href={adding ? albumHref : `${albumHref}?add=1`} className="btn btn-primary text-[14px]">
              {adding ? "Close uploader" : "Add photos"}
            </Link>
          ) : null}
          {canManage ? <PublishToggle albumId={album.id} published={album.status === "published"} readyCount={photoCount + videoCount} /> : null}
        </div>
      </div>

      {album.contributor_scope === "members" && !canManage && ctx.membership ? (
        <div className="border-b-2 border-divider border-l-4 border-l-accent bg-accent-100 px-6 py-3 text-[14px] text-accent-800">
          Everyone in {ctx.club.name} can add photos to this album. Yours appear straight away.
        </div>
      ) : null}

      {canManage && unfinished?.length ? <UnfinishedUploads items={unfinished} addHref={`${albumHref}?add=1`} /> : null}

      {adding ? (
        <div className="border-b-2 border-divider p-6">
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
      />
    </main>
  );
}
