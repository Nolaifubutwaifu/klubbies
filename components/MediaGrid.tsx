"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { loadAlbumPageAction } from "@/app/(app)/c/[handle]/actions";
import type { GridItem } from "@/lib/media/queries";

function duration(seconds: number | null): string {
  if (!seconds) return "";
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function MediaTile({ item }: { item: GridItem }) {
  const ratio = item.width && item.height ? `${item.width} / ${item.height}` : "1 / 1";
  return (
    <div className="relative w-full overflow-hidden bg-neutral-400" style={{ aspectRatio: ratio }}>
      {item.thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
        <img src={item.thumbUrl} alt={item.original_filename ?? ""} className="h-full w-full object-cover" loading="lazy" />
      ) : null}
      {item.kind === "video" ? (
        <span className="absolute bottom-0 left-0 bg-accent px-2 py-1 text-[11px] font-bold tracking-[0.08em] text-white">
          VIDEO{item.duration_seconds ? ` · ${duration(item.duration_seconds)}` : ""}
        </span>
      ) : null}
    </div>
  );
}

export function MediaGrid({
  albumId,
  hrefBase,
  initialItems,
  initialHasMore,
}: {
  albumId: string;
  hrefBase: string;
  initialItems: GridItem[];
  initialHasMore: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(0);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const next = await loadAlbumPageAction(albumId, page + 1);
      setItems((current) => [...current, ...next.items.filter((i) => !current.some((c) => c.id === i.id))]);
      setHasMore(next.hasMore);
      setPage(page + 1);
    });
  }

  return (
    <div className="flex flex-col">
      <div className="masonry bg-divider p-[2px]">
        {items.map((item) => (
          <Link key={item.id} href={`${hrefBase}/${item.id}`} className="block hover:opacity-90" scroll={false}>
            <MediaTile item={item} />
          </Link>
        ))}
      </div>
      {hasMore ? (
        <div className="flex justify-center p-6">
          <button type="button" className="btn btn-secondary" onClick={loadMore} disabled={pending}>
            {pending ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
