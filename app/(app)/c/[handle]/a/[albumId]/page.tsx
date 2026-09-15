import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { albumMeta } from "@/components/AlbumCard";
import { MediaGrid } from "@/components/MediaGrid";
import { EmptyState } from "@/components/ui";
import { getClubContext } from "@/lib/auth/session";
import { formatLongDate } from "@/lib/format";
import { listAlbumMedia } from "@/lib/media/queries";
import { createClient } from "@/lib/supabase/server";

type Props = PageProps<"/c/[handle]/a/[albumId]">;

async function loadAlbum(props: Props) {
  const { handle, albumId } = await props.params;
  if (!z.uuid().safeParse(albumId).success) return null;
  const ctx = await getClubContext(handle);
  if (!ctx) return null;
  const supabase = await createClient();
  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("id", albumId)
    .eq("club_id", ctx.club.id)
    .eq("status", "published")
    .maybeSingle();
  return album ? { ctx, album, supabase, handle } : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await loadAlbum(props);
  return { title: data?.album.title ?? "Album" };
}

export default async function AlbumPage(props: Props) {
  const data = await loadAlbum(props);
  if (!data) notFound();
  const { album, supabase, handle } = data;

  const [{ items, hasMore }, { data: counts }] = await Promise.all([
    listAlbumMedia(supabase, album.id, 0),
    supabase.from("album_media_counts").select("*").eq("album_id", album.id).maybeSingle(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-divider px-6 py-4">
        <div>
          <Link href={`/c/${handle}`} className="btn btn-ghost pl-0 text-[13px]">
            ← All events
          </Link>
          <h1 className="display mt-1 text-[clamp(26px,4vw,40px)]">{album.title}</h1>
          <p className="mt-1 text-[13px] text-neutral-700">
            {[formatLongDate(album.event_date), albumMeta({ photoCount: counts?.photo_count ?? 0, videoCount: counts?.video_count ?? 0 })]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {album.description ? <p className="mt-2 max-w-[60ch] text-[15px] text-neutral-800">{album.description}</p> : null}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="p-6">
          <EmptyState title="This album is empty">Check back once the committee has uploaded the photos.</EmptyState>
        </div>
      ) : (
        <MediaGrid albumId={album.id} hrefBase={`/c/${handle}/a/${album.id}`} initialItems={items} initialHasMore={hasMore} />
      )}
    </main>
  );
}
