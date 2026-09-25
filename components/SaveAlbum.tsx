"use client";

import { useState, useSyncExternalStore } from "react";

const SHARE_BATCH = 8;

const subscribeNever = () => () => {};

/** True only where the share sheet accepts files, which is how iOS saves to Photos. */
function canShareSnapshot(): boolean {
  try {
    const probe = new File([new Blob([new Uint8Array([1])])], "probe.jpg", { type: "image/jpeg" });
    return Boolean(navigator.canShare?.({ files: [probe] }));
  } catch {
    return false;
  }
}

/**
 * "Save to Photos" hands the files to the phone's share sheet, which offers
 * "Save N Images" straight into the Photos app. Desktop browsers get the zip
 * instead, in parts for very large albums.
 */
export function SaveAlbum({
  albumId,
  mediaIds,
  parts,
  canDownload,
}: {
  albumId: string;
  mediaIds: string[];
  parts: number;
  canDownload: boolean;
}) {
  const canShareFiles = useSyncExternalStore(subscribeNever, canShareSnapshot, () => false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  if (!canDownload) return null;

  async function saveToPhotos() {
    setBusy(true);
    setError("");
    try {
      for (let i = 0; i < mediaIds.length; i += SHARE_BATCH) {
        const batch = mediaIds.slice(i, i + SHARE_BATCH);
        setProgress(`Preparing ${i + 1}–${Math.min(i + SHARE_BATCH, mediaIds.length)} of ${mediaIds.length}`);

        const res = await fetch("/api/media/sign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mediaIds: batch, variant: "display" }),
        });
        const { urls }: { urls: Record<string, string> } = await res.json();

        const files: File[] = [];
        for (const id of batch) {
          const url = urls[id];
          if (!url) continue;
          const blob = await (await fetch(url)).blob();
          const ext = blob.type === "image/png" ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
          files.push(new File([blob], `klubbies-${id.slice(0, 8)}.${ext}`, { type: blob.type || "image/jpeg" }));
        }
        if (files.length === 0) continue;

        setProgress(`Saving ${files.length} photos…`);
        await navigator.share({ files, title: "Klubbies" });
      }
      setProgress("Done");
    } catch (shareError) {
      const message = shareError instanceof Error ? shareError.message : String(shareError);
      if (!/abort/i.test(message)) setError("Saving stopped. You can also use Download all.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap gap-2">
        {parts <= 1 ? (
          <a href={`/api/albums/${albumId}/zip`} className="btn btn-ghost text-[14px]">
            Download all
          </a>
        ) : (
          Array.from({ length: parts }, (_, i) => (
            <a key={i} href={`/api/albums/${albumId}/zip?part=${i}`} className="btn btn-ghost text-[14px]">
              Download part {i + 1}
            </a>
          ))
        )}
        {/* After the downloads: it appears only once the browser answers,
            and appended last it can't push anything else along. */}
        {canShareFiles && mediaIds.length > 0 ? (
          <button type="button" className="btn btn-ghost text-[14px]" onClick={saveToPhotos} disabled={busy}>
            {busy ? "Saving…" : "Save to Photos"}
          </button>
        ) : null}
      </div>
      {progress ? <span className="text-[12px] text-ink-55">{progress}</span> : null}
      {error ? <span className="text-[12px] text-accent-700">{error}</span> : null}
    </div>
  );
}
