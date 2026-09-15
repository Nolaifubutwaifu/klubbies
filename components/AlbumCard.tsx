import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { AlbumCard as AlbumCardData } from "@/lib/media/queries";
import { Placeholder } from "./ui";

export function albumMeta(album: Pick<AlbumCardData, "photoCount" | "videoCount">): string {
  const parts: string[] = [];
  if (album.photoCount) parts.push(`${album.photoCount.toLocaleString("en-AU")} ${album.photoCount === 1 ? "photo" : "photos"}`);
  if (album.videoCount) parts.push(`${album.videoCount.toLocaleString("en-AU")} ${album.videoCount === 1 ? "video" : "videos"}`);
  return parts.join(" · ") || "Empty";
}

export function AlbumCard({ album, href, showStatus = false }: { album: AlbumCardData; href: string; showStatus?: boolean }) {
  const total = album.photoCount + album.videoCount;
  return (
    <Link href={href} className="group flex flex-col bg-bg text-ink no-underline hover:bg-neutral-200">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {album.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
          <img src={album.coverUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <Placeholder seed={album.id} className="h-full w-full" />
        )}
        <span className="absolute bottom-0 left-0 bg-neutral-900 px-2 py-[5px] text-[11px] font-bold tracking-[0.08em] text-white">
          {total.toLocaleString("en-AU")}
        </span>
        {showStatus && album.status === "draft" ? (
          <span className="absolute top-0 right-0 bg-accent px-2 py-[5px] text-[11px] font-bold tracking-[0.08em] text-white">
            DRAFT
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent-700">
          {formatDate(album.event_date ?? album.published_at ?? album.created_at)}
        </div>
        <div className="mt-2 mb-1 font-heading text-[20px] font-extrabold tracking-[-0.02em]">{album.title}</div>
        <div className="text-[13px] text-neutral-700">{albumMeta(album)}</div>
      </div>
    </Link>
  );
}
