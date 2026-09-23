"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { decideFaceMatchAction } from "@/app/(app)/face-actions";
import { requestRemovalAction } from "@/app/(app)/removal-actions";
import { toggleFavouriteAction } from "@/app/(app)/c/[handle]/actions";

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
  takenAt: string;
};

/** One of the four things you can do to the photo you're looking at. */
function Action({
  label,
  onClick,
  href,
  active = false,
  quiet = false,
  filled = false,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
  quiet?: boolean;
  filled?: boolean;
  children: React.ReactNode;
}) {
  const colour = active ? "#ff7a63" : quiet ? "rgba(255,255,255,0.86)" : "#ffffff";
  const inner = (
    <>
      <svg
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill={filled ? colour : "none"}
        stroke={colour}
        strokeWidth={filled ? 1.6 : 2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
      {label}
    </>
  );
  const className =
    "flex min-h-[52px] flex-1 cursor-pointer flex-col items-center justify-center gap-[3px] border-0 bg-transparent text-[11px] font-bold no-underline";
  return href ? (
    <a href={href} className={className} style={{ color: colour }}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className} style={{ color: colour }}>
      {inner}
    </button>
  );
}

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
  favourited,
  canAskRemoval,
  alreadyAsked,
  faceMatchId,
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
  favourited: boolean;
  canAskRemoval: boolean;
  alreadyAsked: boolean;
  /** Set when face recognition has matched the viewer to this photo. */
  faceMatchId: string | null;
}) {
  const router = useRouter();
  const touchX = useRef<number | null>(null);
  const [saved, setSaved] = useState(favourited);
  const [sheet, setSheet] = useState<"none" | "removal" | "details">("none");
  const [asked, setAsked] = useState(alreadyAsked);
  const [matched, setMatched] = useState(faceMatchId);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const prevHref = prevId ? `${itemHrefBase}/${prevId}` : null;
  const nextHref = nextId ? `${itemHrefBase}/${nextId}` : null;

  useEffect(() => {
    if (prevHref) router.prefetch(prevHref);
    if (nextHref) router.prefetch(nextHref);
  }, [router, prevHref, nextHref]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape" && sheet !== "none") return setSheet("none");
      if (e.key === "ArrowLeft" && prevHref) router.replace(prevHref, { scroll: false });
      if (e.key === "ArrowRight" && nextHref) router.replace(nextHref, { scroll: false });
      if (e.key === "Escape") router.push(albumHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, prevHref, nextHref, albumHref, sheet]);

  const onTouchEnd = (x: number) => {
    if (touchX.current === null) return;
    const dx = x - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx > 0 && prevHref) router.replace(prevHref, { scroll: false });
    if (dx < 0 && nextHref) router.replace(nextHref, { scroll: false });
  };

  const round =
    "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-[rgba(20,16,15,0.5)] text-white no-underline backdrop-blur-sm transition-colors hover:bg-[rgba(20,16,15,0.75)]";

  return (
    // The one screen that leaves the cream behind: a photo is easier to read
    // against near-black, and nothing else on this page competes with it.
    <main className="relative flex h-full min-h-0 flex-1 flex-col bg-[#14100f]">
      <div className="flex flex-none items-center gap-3 px-3.5 pb-2.5 pt-3.5 sm:px-6">
        <Link
          href={albumHref}
          aria-label="Close photo"
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white/[0.14] text-white no-underline"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-[14px] font-bold text-white">{albumTitle}</div>
          <div className="text-[12px] text-white/[0.68]">
            {position.toLocaleString("en-AU")} of {total.toLocaleString("en-AU")}
            {current.takenAt ? ` · ${current.takenAt}` : ""}
          </div>
        </div>
        <button
          type="button"
          aria-label="Photo details"
          aria-expanded={sheet === "details"}
          onClick={() => setSheet(sheet === "details" ? "none" : "details")}
          className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-white/[0.14]"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="#ffffff" aria-hidden>
            <circle cx="12" cy="5" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="12" cy="19" r="1.8" />
          </svg>
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
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
            className="max-h-full w-full max-w-[1200px] bg-black"
          />
        ) : current.displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
          <img
            key={current.id}
            src={current.displayUrl}
            alt={current.filename}
            className="max-h-full w-auto max-w-full object-contain"
            width={current.width ?? undefined}
            height={current.height ?? undefined}
          />
        ) : (
          <div className="text-white/70">This item can&apos;t be previewed.</div>
        )}
        {prevHref ? (
          <Link href={prevHref} replace scroll={false} className={`${round} left-2.5`} aria-label="Previous photo">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
              <path d="M14 6l-6 6 6 6" />
            </svg>
          </Link>
        ) : null}
        {nextHref ? (
          <Link href={nextHref} replace scroll={false} className={`${round} right-2.5`} aria-label="Next photo">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
              <path d="M10 6l6 6-6 6" />
            </svg>
          </Link>
        ) : null}
        {nextHref ? (
          <span className="pointer-events-none absolute bottom-3.5 left-1/2 -translate-x-1/2 text-[12px] text-white/70 sm:hidden">
            Swipe for the next one
          </span>
        ) : null}
      </div>

      {/* Filmstrip: where you are in the night, without leaving the photo. */}
      <div className="flex flex-none gap-1 overflow-x-auto px-3 pt-2.5">
        {strip.map((item) => {
          const here = item.id === current.id;
          return (
            <Link
              key={item.id}
              href={`${itemHrefBase}/${item.id}`}
              replace
              scroll={false}
              aria-current={here}
              className="block h-[46px] w-[46px] flex-none overflow-hidden rounded-[9px] bg-white/10"
              style={here ? { border: "2px solid var(--color-accent)" } : { opacity: 0.5 }}
            >
              {item.thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
                <img src={item.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-none px-2 pb-6 pt-3">
        <Action
          label={saved ? "Favourited" : "Favourite"}
          active={saved}
          filled={saved}
          onClick={() => {
            const next = !saved;
            setSaved(next);
            startTransition(async () => setSaved((await toggleFavouriteAction(current.id)).favourited));
          }}
        >
          <path d="M12 20s-7-4.6-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />
        </Action>
        {canDownload ? (
          <Action label="Original" href={`/api/media/${current.id}/download`}>
            <path d="M12 4v11M7 11l5 5 5-5" />
            <path d="M5 20h14" />
          </Action>
        ) : null}
        <Action label="Details" quiet onClick={() => setSheet(sheet === "details" ? "none" : "details")}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 7.6v.1" />
        </Action>
        {/* Getting it wrong has to be one tap to correct, wherever you are
            when you notice — not only on the Photos of you page. */}
        {matched ? (
          <Action
            label="Not me"
            quiet
            onClick={() =>
              startTransition(async () => {
                const res = await decideFaceMatchAction(matched, "reject");
                setMatched(null);
                setMessage(res.error ?? "Thanks. We won't suggest this one again.");
              })
            }
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9 9l6 6M15 9l-6 6" />
          </Action>
        ) : null}
        {canAskRemoval ? (
          <Action label={asked ? "Asked" : "Take it down"} quiet onClick={() => setSheet("removal")}>
            <path d="M12 3 2.5 20h19z" />
            <path d="M12 10v4M12 17.2v.1" />
          </Action>
        ) : null}
      </div>

      {message ? (
        <div
          role="status"
          className="pointer-events-none absolute bottom-[104px] left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-ink shadow-lg"
        >
          {message}
        </div>
      ) : null}

      {sheet === "details" ? (
        <div className="absolute inset-x-0 bottom-0 rounded-t-[26px] bg-[color:var(--color-bg)] p-5 pb-6 shadow-[0_-18px_40px_rgba(0,0,0,0.45)]">
          <span className="mx-auto mb-3.5 block h-1 w-[42px] rounded-full bg-[color-mix(in_srgb,var(--color-text)_18%,transparent)]" />
          <h2 className="soft-display text-[19px]">About this one</h2>
          <dl className="m-0 mt-3 grid gap-x-5 gap-y-2.5" style={{ gridTemplateColumns: "auto 1fr" }}>
            {details.map((d) => (
              <div key={d.label} className="contents">
                <dt className="text-[13px] text-[color:var(--ink-70)]">{d.label}</dt>
                <dd className="m-0 text-[14px] font-semibold">{d.value}</dd>
              </div>
            ))}
          </dl>
          <p className="m-0 mt-3 text-[13px] text-[color:var(--ink-70)]">
            Only people on the club member list can open this. Views and downloads are logged.
          </p>
          <button type="button" className="soft-btn soft-btn-tonal mt-4 w-full" onClick={() => setSheet("none")}>
            Close
          </button>
        </div>
      ) : null}

      {sheet === "removal" ? (
        <div className="absolute inset-x-0 bottom-0 rounded-t-[26px] bg-[color:var(--color-bg)] px-5 pb-6 pt-4.5 shadow-[0_-18px_40px_rgba(0,0,0,0.45)]">
          <span className="mx-auto mb-3.5 block h-1 w-[42px] rounded-full bg-[color-mix(in_srgb,var(--color-text)_18%,transparent)]" />
          <h2 className="soft-display text-[21px]">{asked ? "Already on its way down." : "Take this one down?"}</h2>
          <p className="mt-1.5 text-[14px] text-[color:var(--ink-70)]">
            {asked
              ? "It's hidden from the album. Your media officer confirms it within seven days, and if they don't, it deletes itself."
              : "It hides from the album straight away. Your media officer gets a note and confirms it — no reason needed."}
          </p>
          <div className="mt-4 flex gap-2.5">
            <button type="button" className="soft-btn soft-btn-tonal flex-1" onClick={() => setSheet("none")}>
              {asked ? "Close" : "Not now"}
            </button>
            {asked ? null : (
              <button
                type="button"
                className="soft-btn soft-btn-primary flex-1"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await requestRemovalAction(current.id);
                    setMessage(res.error ?? res.message ?? "");
                    if (res.ok) {
                      setAsked(true);
                      setSheet("none");
                    }
                  })
                }
              >
                {pending ? "Hiding…" : "Hide it now"}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
