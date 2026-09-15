"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type DragEvent } from "react";
import { ACCEPT_ATTRIBUTE } from "@/lib/media/constants";
import { EMPTY_SNAPSHOT, UploadQueue } from "@/lib/media/upload-queue";

const serverSnapshot = () => EMPTY_SNAPSHOT;

export function Uploader({ albumId }: { albumId: string }) {
  const router = useRouter();
  const [queue] = useState(() => new UploadQueue(albumId, () => router.refresh()));
  const jobs = useSyncExternalStore(queue.subscribe, queue.getSnapshot, serverSnapshot);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const result = queue.add(Array.from(list));
    setRejected(result.rejected);
    setWarnings(result.warnings);
  };

  const totalBytes = jobs.reduce((sum, j) => sum + j.size, 0);
  const sentBytes = jobs.reduce((sum, j) => sum + (j.status === "done" ? j.size : Math.min(j.uploaded, j.size)), 0);
  const pct = totalBytes ? Math.floor((sentBytes / totalBytes) * 100) : 0;
  const done = jobs.filter((j) => j.status === "done").length;
  const failed = jobs.filter((j) => j.status === "failed");
  const busy = jobs.some((j) => j.status !== "done" && j.status !== "failed");

  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="dropzone px-4 py-8"
        data-active={dragging}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <span className="font-heading text-[18px] font-extrabold">Drop photos and videos</span>
        <span className="text-[13px] text-neutral-700">JPG, PNG, HEIC, WebP, MP4, MOV · originals kept at full quality</span>
        <input
          ref={input}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {rejected.length ? <div className="notice">Skipped {rejected.join(", ")}: only photos and videos can be uploaded.</div> : null}
      {warnings.map((w) => (
        <div key={w} className="notice">
          {w}
        </div>
      ))}

      {jobs.length ? (
        <div className="flex flex-col gap-3 border-2 border-divider p-4">
          <div className="flex justify-between text-[13px] font-semibold">
            <span>
              {busy
                ? `Uploading ${jobs.length} ${jobs.length === 1 ? "file" : "files"}`
                : failed.length
                  ? "Some files need a retry"
                  : "Upload complete"}
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-[10px] bg-neutral-300">
            <div className="h-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[13px] text-neutral-700">
            {done} of {jobs.length} ready{failed.length ? ` · ${failed.length} failed` : ""}
            {!busy && !failed.length ? " · publish the album when you're happy with it" : ""}
          </div>
          {failed.map((job) => (
            <div key={job.key} className="flex flex-wrap items-center justify-between gap-2 border-t border-divider pt-2 text-[13px]">
              <span className="min-w-0 truncate">
                <strong>{job.name}</strong> — {job.error}
              </span>
              <button type="button" className="btn btn-secondary text-[13px]" onClick={() => queue.retry(job.key)}>
                Retry
              </button>
            </div>
          ))}
          <div className="tile-grid p-[2px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))" }}>
            {jobs.slice(-60).map((job) => (
              <div
                key={job.key}
                className="relative aspect-square bg-neutral-400"
                style={{ opacity: job.status === "done" ? 1 : 0.35 }}
                title={job.name}
              >
                {job.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local object URL
                  <img src={job.previewUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
                {job.status === "failed" ? (
                  <span className="absolute inset-x-0 bottom-0 bg-accent px-1 text-[10px] font-bold text-white">FAILED</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
