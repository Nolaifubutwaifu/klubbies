"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { loadAlbumPageAction } from "@/app/(app)/c/[handle]/actions";
import { Dialog } from "@/components/Dialog";
import { MediaTile } from "@/components/MediaGrid";
import type { GridItem } from "@/lib/media/queries";
import { deleteMediaAction, setAlbumCoverAction } from "../../../actions";

export function AdminMediaGrid({
  albumId,
  coverMediaId,
  initialItems,
  initialHasMore,
}: {
  albumId: string;
  coverMediaId: string | null;
  initialItems: GridItem[];
  initialHasMore: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return <p className="border-2 border-divider p-6 text-[14px] text-neutral-700">Nothing uploaded yet.</p>;
  }

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedIds = [...selected];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-[40px] flex-wrap items-center gap-2 text-[14px]">
        {selected.size ? (
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
            <button type="button" className="btn btn-primary text-[13px]" onClick={() => setConfirm(true)}>
              Delete
            </button>
            <button type="button" className="btn btn-ghost text-[13px]" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </>
        ) : (
          <span className="text-neutral-700">Tap items to select them.</span>
        )}
        {message ? <span className="text-neutral-700">{message}</span> : null}
      </div>

      <div className="tile-grid p-[2px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
        {items.map((item) => {
          const isSelected = selected.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className="relative block border-0 bg-bg p-0 text-left"
              style={{ outline: isSelected ? "3px solid var(--color-accent)" : undefined, outlineOffset: -3 }}
              aria-pressed={isSelected}
            >
              <div className="aspect-square overflow-hidden">
                <MediaTile item={{ ...item, width: 1, height: 1 }} />
              </div>
              {item.id === coverMediaId ? (
                <span className="absolute top-0 left-0 bg-neutral-900 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-white">COVER</span>
              ) : null}
              {item.status !== "ready" ? (
                <span className="absolute inset-x-0 top-0 bg-neutral-100/90 px-2 py-1 text-[11px] font-semibold">
                  {item.status === "failed" ? "Failed" : "Not finished"}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {hasMore ? (
        <button
          type="button"
          className="btn btn-secondary self-center"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const next = await loadAlbumPageAction(albumId, page + 1, true);
              setItems((current) => [...current, ...next.items.filter((i) => !current.some((c) => c.id === i.id))]);
              setHasMore(next.hasMore);
              setPage(page + 1);
            })
          }
        >
          {pending ? "Loading…" : "Load more"}
        </button>
      ) : null}

      <Dialog open={confirm} onClose={() => setConfirm(false)} title={`Delete ${selected.size} ${selected.size === 1 ? "item" : "items"}?`}>
        <p className="text-[15px]">The originals are deleted too. Members who already downloaded a copy keep it.</p>
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
