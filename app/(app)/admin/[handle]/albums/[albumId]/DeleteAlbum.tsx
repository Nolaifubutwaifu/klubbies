"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/Dialog";
import { deleteAlbumAction } from "../../../actions";

export function DeleteAlbum({ albumId, title }: { albumId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-divider pt-4">
      <span className="text-[13px] text-neutral-700">Deleting an album removes every photo and video in it for good.</span>
      <button type="button" className="btn btn-ghost" onClick={() => setOpen(true)}>
        Delete album
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Delete this album?">
        <p className="text-[15px]">All photos and videos in “{title}” will be permanently deleted, including the originals.</p>
        <label className="field">
          Type the album name to confirm
          <input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
        </label>
        {error ? <div className="notice">{error}</div> : null}
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending || typed.trim().toLowerCase() !== title.trim().toLowerCase()}
            onClick={() =>
              startTransition(async () => {
                const res = await deleteAlbumAction(albumId, typed);
                if (res?.error) setError(res.error);
              })
            }
          >
            {pending ? "Deleting…" : "Delete album"}
          </button>
        </div>
      </Dialog>
    </section>
  );
}
