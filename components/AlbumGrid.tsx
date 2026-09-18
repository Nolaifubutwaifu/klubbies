"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { loadAlbumPageAction } from "@/app/(app)/c/[handle]/actions";
import { deleteMediaAction, setAlbumCoverAction } from "@/app/(app)/admin/actions";
import { Dialog } from "@/components/Dialog";
import type { GridItem } from "@/lib/media/queries";

function duration(seconds: number | null): string {
  if (!seconds) return "";
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function Tile({ item, cover }: { item: GridItem; cover: boolean }) {
  return (
    <>
      {item.thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
        <img src={item.thumbUrl} alt={item.original_filename ?? ""} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-neutral-400 p-2 text-center text-[11px] text-neutral-900">
          {item.status === "ready" ? "No preview" : item.original_filename || "Not finished"}
        </span>
      )}
      {item.kind === "video" ? (
        <span className="absolute bottom-0 left-0 bg-accent px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-white">
          VIDEO{item.duration_seconds ? ` · ${duration(item.duration_seconds)}` : ""}
        </span>
      ) : null}
      {cover ? (
        <span className="absolute left-0 top-0 bg-neutral-900 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-white">COVER</span>
      ) : null}
      {item.status !== "ready" ? (
        <span className="absolute inset-x-0 top-0 bg-accent-100/95 px-2 py-1 text-[11px] font-semibold text-accent-800">
          {item.status === "failed" ? "Failed" : "Not finished"}
        </span>
      ) : null}
    </>
  );
}

export function AlbumGrid({
  albumId,
  hrefBase,
  initialItems,
  initialHasMore,
  coverMediaId,
  canManage,
  selectMode = false,
}: {
  albumId: string;
  hrefBase: string;
  initialItems: GridItem[];
  initialHasMore: boolean;
  coverMediaId: string | null;
  canManage: boolean;
  selectMode?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(0);
  const [selecting, setSelecting] = useState(selectMode);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedIds = [...selected];

  const loadMore = () =>
    startTransition(async () => {
      const next = await loadAlbumPageAction(albumId, page + 1, canManage);
      setItems((current) => [...current, ...next.items.filter((i) => !current.some((c) => c.id === i.id))]);
      setHasMore(next.hasMore);
      setPage(page + 1);
    });

  if (items.length === 0) {
    return <p className="m-6 border-2 border-divider p-6 text-[14px] text-neutral-700">Nothing in this album yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {canManage ? (
        <div className="flex min-h-[40px] flex-wrap items-center gap-2 px-6 text-[14px]">
          {selecting ? (
            <>
              <strong>{selected.size} selected</strong>
              {selected.size === 1 ? (
                <button
                  type="button"
                  className="btn btn-secondary text-[13px]"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await setAlbumCoverAction(albumId, selectedIds[0]);
                      setMessage(res.error ?? res.message ?? "");
                      if (res.ok) router.refresh();
                    })
                  }
                >
                  Use as cover
                </button>
              ) : null}
              <button type="button" className="btn btn-primary text-[13px]" disabled={!selected.size} onClick={() => setConfirm(true)}>
                Delete
              </button>
              <button
                type="button"
                className="btn btn-ghost text-[13px]"
                onClick={() => {
                  setSelected(new Set());
                  setSelecting(false);
                }}
              >
                Done
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-secondary text-[13px]" onClick={() => setSelecting(true)}>
              Select photos
            </button>
          )}
          {message ? <span className="text-neutral-700">{message}</span> : null}
        </div>
      ) : null}

      <div className="grid gap-[2px] px-6 pb-6 pt-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
        {items.map((item) =>
          selecting ? (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              aria-pressed={selected.has(item.id)}
              className="relative block aspect-square border-0 bg-bg p-0"
              style={{ outline: selected.has(item.id) ? "3px solid var(--color-accent)" : undefined, outlineOffset: -3 }}
            >
              <Tile item={item} cover={item.id === coverMediaId} />
            </button>
          ) : (
            <Link key={item.id} href={`${hrefBase}/${item.id}`} className="relative block aspect-square hover:opacity-90" scroll={false}>
              <Tile item={item} cover={item.id === coverMediaId} />
            </Link>
          ),
        )}
      </div>

      {hasMore ? (
        <button type="button" className="btn btn-secondary mb-6 self-center" disabled={pending} onClick={loadMore}>
          {pending ? "Loading…" : "Load more"}
        </button>
      ) : null}

      <Dialog open={confirm} onClose={() => setConfirm(false)} title={`Delete ${selected.size} ${selected.size === 1 ? "item" : "items"}?`}>
        <p className="text-[15px]">The originals go too. Members who already downloaded a copy keep it.</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setConfirm(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await deleteMediaAction(selectedIds);
                setMessage(res.error ?? res.message ?? "");
                if (res.ok) {
                  setItems((current) => current.filter((i) => !selected.has(i.id)));
                  setSelected(new Set());
                  setConfirm(false);
                  router.refresh();
                }
              })
            }
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
