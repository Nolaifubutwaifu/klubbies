"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type Current = {
  id: string;
  kind: "photo" | "video";
  displayUrl: string | null;
  videoUrl: string | null;
  posterUrl: string | null;
  filename: string;
  width: number | null;
  height: number | null;
  duration: string;
};

export function Viewer({
  albumHref,
  albumTitle,
  itemHrefBase,
  current,
  details,
  prevId,
  nextId,
  position,
  total,
  strip,
  canDownload,
}: {
  albumHref: string;
  albumTitle: string;
  itemHrefBase: string;
  current: Current;
  details: { label: string; value: string }[];
  prevId: string | null;
  nextId: string | null;
  position: number;
  total: number;
  strip: { id: string; thumbUrl: string | null; kind: string }[];
  canDownload: boolean;
}) {
  const router = useRouter();
  const touchX = useRef<number | null>(null);
  const prevHref = prevId ? `${itemHrefBase}/${prevId}` : null;
  const nextHref = nextId ? `${itemHrefBase}/${nextId}` : null;

  useEffect(() => {
    if (prevHref) router.prefetch(prevHref);
    if (nextHref) router.prefetch(nextHref);
  }, [router, prevHref, nextHref]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && prevHref) router.replace(prevHref, { scroll: false });
      if (e.key === "ArrowRight" && nextHref) router.replace(nextHref, { scroll: false });
      if (e.key === "Escape") router.push(albumHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, prevHref, nextHref, albumHref]);

  const onTouchEnd = (x: number) => {
    if (touchX.current === null) return;
    const dx = x - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx > 0 && prevHref) router.replace(prevHref, { scroll: false });
    if (dx < 0 && nextHref) router.replace(nextHref, { scroll: false });
  };

  const arrow =
    "absolute top-1/2 -translate-y-1/2 border-0 bg-neutral-100 px-4 py-3 font-heading text-[18px] font-black text-neutral-900 no-underline hover:bg-accent hover:text-white";

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-divider px-6 py-4">
        <div className="min-w-0">
          <Link href={albumHref} className="btn btn-ghost pl-0 text-[13px]">
            ← All photos
          </Link>
          <div className="mt-1 truncate font-heading text-[26px] font-black tracking-[-0.03em]">{albumTitle}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-neutral-700">
            {position.toLocaleString("en-AU")} of {total.toLocaleString("en-AU")}
          </span>
          {canDownload ? (
            <a href={`/api/media/${current.id}/download`} className="btn btn-secondary text-[13px]">
              Download
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid border-b-2 border-divider md:grid-cols-[minmax(0,1fr)_260px]">
        <div
          className="relative flex min-h-[60dvh] items-center justify-center bg-neutral-900 p-2 sm:p-6 md:min-h-[420px]"
          onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => onTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
        >
          {current.kind === "video" && current.videoUrl ? (
            <video
              key={current.id}
              src={current.videoUrl}
              poster={current.posterUrl ?? undefined}
              controls
              playsInline
              preload="metadata"
              className="max-h-[75dvh] w-full max-w-[1200px] bg-black"
            />
          ) : current.displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
            <img
              key={current.id}
              src={current.displayUrl}
              alt={current.filename}
              className="max-h-[75dvh] w-auto max-w-full object-contain"
              width={current.width ?? undefined}
              height={current.height ?? undefined}
            />
          ) : (
            <div className="text-neutral-400">This item can&apos;t be previewed.</div>
          )}
          {prevHref ? (
            <Link href={prevHref} replace scroll={false} className={`${arrow} left-4`} aria-label="Previous">
              ←
            </Link>
          ) : null}
          {nextHref ? (
            <Link href={nextHref} replace scroll={false} className={`${arrow} right-4`} aria-label="Next">
              →
            </Link>
          ) : null}
        </div>
        <aside className="flex flex-col gap-4 border-divider p-4 md:border-l-2">
          {details.map((d, i) => (
            <div key={d.label} className={i > 0 ? "border-t-2 border-divider pt-3" : ""}>
              <div className="label-caps">{d.label}</div>
              <div className="mt-1 text-[15px] font-semibold">{d.value}</div>
            </div>
          ))}
          <div className="border-t-2 border-divider pt-3 text-[13px] leading-normal text-neutral-700">
            Only people on the club member list can open this. Views and downloads are logged.
          </div>
        </aside>
      </div>

      <div className="grid gap-[2px] p-[2px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}>
        {strip.map((item) => (
          <Link
            key={item.id}
            href={`${itemHrefBase}/${item.id}`}
            replace
            scroll={false}
            className="relative block aspect-square bg-neutral-400"
            style={{ outline: item.id === current.id ? "3px solid var(--color-accent)" : undefined, outlineOffset: -3 }}
            aria-current={item.id === current.id}
          >
            {item.thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
              <img src={item.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : null}
            {item.kind === "video" ? (
              <span className="absolute bottom-0 left-0 bg-accent px-1 text-[10px] font-bold text-white">VIDEO</span>
            ) : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
