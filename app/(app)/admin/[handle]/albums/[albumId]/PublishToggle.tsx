"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setAlbumPublishedAction } from "../../../actions";

export function PublishToggle({ albumId, published, readyCount }: { albumId: string; published: boolean; readyCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className={published ? "btn btn-secondary" : "btn btn-primary"}
        disabled={pending || (!published && readyCount === 0)}
        onClick={() =>
          startTransition(async () => {
            const res = await setAlbumPublishedAction(albumId, !published);
            setError(res.error ?? "");
            if (res.ok) router.refresh();
          })
        }
      >
        {pending ? "Saving…" : published ? "Unpublish" : "Publish album"}
      </button>
      {error ? <span className="text-[12px] text-accent-700">{error}</span> : null}
      {!published && readyCount === 0 ? <span className="text-[12px] text-neutral-600">Upload something first</span> : null}
    </div>
  );
}
