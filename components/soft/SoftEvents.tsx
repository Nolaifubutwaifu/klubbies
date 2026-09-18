"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarIcon, CameraIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, PlusIcon, SearchIcon, XIcon } from "@/components/soft/icons";
import { ConfettiArt, PhotoStackArt, SquiggleUnderline } from "@/components/soft/illustrations";
import { formatDate, formatLongDate } from "@/lib/format";
import { findAnniversary } from "@/lib/media/anniversary";
import type { StackedAlbum } from "@/lib/media/album-list";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function dayKey(value: string | Date): string {
  const d = typeof value === "string" ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00+10:00` : value) : value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  const offset = (first.getDay() + 6) % 7; // Monday first
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function countLabel(album: StackedAlbum): string {
  const parts = [
    album.photoCount ? `${album.photoCount.toLocaleString("en-AU")} photo${album.photoCount === 1 ? "" : "s"}` : null,
    album.videoCount ? `${album.videoCount.toLocaleString("en-AU")} video${album.videoCount === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  return parts.join(" · ") || "Nothing in here yet";
}

export function SoftEvents({
  albums,
  hrefBase,
  canManage,
  clubName,
  newAlbumHref,
  savedHref,
}: {
  albums: StackedAlbum[];
  hrefBase: string;
  canManage: boolean;
  clubName: string;
  newAlbumHref: string;
  savedHref: string;
}) {
  const [query, setQuery] = useState("");
  const [day, setDay] = useState<string | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(albums[0] ? new Date(albums[0].date) : new Date()));

  const daysWithPhotos = useMemo(() => new Set(albums.map((a) => dayKey(a.date))), [albums]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return albums.filter((album) => {
      const matchesText = !q || album.title.toLowerCase().includes(q) || (album.description ?? "").toLowerCase().includes(q);
      const matchesDay = !day || dayKey(album.date) === day;
      return matchesText && matchesDay;
    });
  }, [albums, query, day]);

  const filtersOn = query.trim() !== "" || day !== null;
  /* Lead with the newest album that has something to show, not just the newest
     one — an empty draft shouldn't cost the page its hero. */
  const hero = filtersOn ? null : (filtered.find((a) => a.coverUrl && a.photoCount + a.videoCount > 0) ?? null);
  const rows = hero ? filtered.filter((a) => a.id !== hero.id) : filtered;
  const totals = albums.reduce((sum, a) => sum + a.photoCount + a.videoCount, 0);
  const memory = filtersOn ? null : findAnniversary(albums);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="soft-chip">{clubName}</span>
          <h1 className="mt-3 text-[clamp(34px,5vw,50px)]">Events</h1>
          <SquiggleUnderline />
          <p className="mt-2 text-[15px] text-neutral-700">
            {albums.length
              ? `${albums.length} album${albums.length === 1 ? "" : "s"} · ${totals.toLocaleString("en-AU")} photos and videos`
              : "Everything the committee shares lands here."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={savedHref} className="soft-btn soft-btn-tonal no-underline">
            Saved
          </Link>
          {canManage ? (
            <Link href={newAlbumHref} className="soft-btn soft-btn-primary no-underline">
              <PlusIcon />
              New album
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600">
            <SearchIcon />
          </span>
          <input
            className="soft-input pl-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${clubName} events`}
            aria-label="Search event names"
            type="search"
          />
        </div>
        <button type="button" className="soft-btn soft-btn-tonal" onClick={() => setCalOpen((v) => !v)} aria-expanded={calOpen}>
          <CalendarIcon />
          {day ? formatLongDate(day) : "Any date"}
        </button>
        {filtersOn ? (
          <button
            type="button"
            className="soft-btn soft-btn-tonal"
            onClick={() => {
              setQuery("");
              setDay(null);
            }}
          >
            <XIcon />
            Clear
          </button>
        ) : null}
      </div>

      {filtersOn ? (
        <p className="mt-3 text-[14px] text-neutral-700">
          {filtered.length} of {albums.length} albums
        </p>
      ) : null}

      {calOpen ? (
        <div className="soft-card mt-4 flex flex-wrap gap-8 p-6">
          <div className="w-[300px] max-w-full">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className="soft-btn soft-btn-tonal h-11 w-11 !min-h-0 !p-0"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                aria-label="Previous month"
              >
                <ChevronLeftIcon />
              </button>
              <span className="soft-display text-[17px]">{month.toLocaleDateString("en-AU", { month: "long", year: "numeric" })}</span>
              <button
                type="button"
                className="soft-btn soft-btn-tonal h-11 w-11 !min-h-0 !p-0"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                aria-label="Next month"
              >
                <ChevronRightIcon />
              </button>
            </div>
            <div className="grid grid-cols-7">
              {WEEKDAYS.map((w, i) => (
                <span key={`${w}${i}`} className="p-1 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-600">
                  {w}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthGrid(month).map((d) => {
                const key = dayKey(d);
                const inMonth = d.getMonth() === month.getMonth();
                const has = daysWithPhotos.has(key);
                const selected = day === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDay(selected ? null : key)}
                    className="flex aspect-square flex-col items-center justify-center gap-[3px] rounded-full border-0 text-[13px] font-semibold"
                    style={{
                      background: selected
                        ? "var(--color-accent)"
                        : has
                          ? "color-mix(in srgb, var(--color-accent) 14%, transparent)"
                          : "transparent",
                      color: selected ? "#fff" : inMonth ? "var(--color-text)" : "var(--color-neutral-400)",
                      cursor: "pointer",
                    }}
                  >
                    {d.getDate()}
                    <span
                      className="h-[4px] w-[4px] rounded-full"
                      style={{ background: has ? (selected ? "#fff" : "var(--color-accent)") : "transparent" }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex min-w-[200px] flex-1 flex-col gap-3">
            <span className="soft-display text-[15px]">Jump to an event</span>
            <div className="flex flex-wrap gap-2">
              {albums.slice(0, 5).map((album) => (
                <button
                  key={album.id}
                  type="button"
                  className="soft-chip soft-chip-muted cursor-pointer"
                  onClick={() => {
                    setDay(dayKey(album.date));
                    setMonth(startOfMonth(new Date(album.date)));
                  }}
                >
                  {formatDate(album.date)}
                </button>
              ))}
            </div>
            <p className="m-0 max-w-[36ch] text-[14px] text-neutral-700">Tinted days have photos. Tap a day to filter, tap again to clear.</p>
          </div>
        </div>
      ) : null}

      {memory ? (
        <Link
          href={`${hrefBase}/${memory.album.id}`}
          className="mt-6 flex items-center gap-4 rounded-[var(--soft-r)] bg-[color:var(--tone-support)] p-4 text-[color:var(--tone-support-ink)] no-underline transition-transform hover:-translate-y-0.5"
        >
          {memory.album.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
            <img src={memory.album.coverUrl} alt="" className="h-[62px] w-[62px] flex-none rounded-[16px] object-cover" />
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-bold">
              {memory.years === 1 ? "One year ago tonight" : `${memory.years} years ago tonight`}
            </span>
            <span className="soft-display block truncate text-[17px] text-ink">{memory.album.title}</span>
            <span className="block text-[12px]">{countLabel(memory.album)}</span>
          </span>
          <ChevronRightIcon />
        </Link>
      ) : null}

      {filtered.length === 0 ? (
        <div className="soft-card mt-6 flex flex-col items-start gap-3 p-8">
          <span className="text-accent-400">
            <ConfettiArt />
          </span>
          <span className="soft-chip">
            <CameraIcon />
            {albums.length ? "No matches" : "Nothing yet"}
          </span>
          <h2 className="text-[26px]">{albums.length ? "Nothing matches that" : "No albums yet"}</h2>
          <p className="m-0 max-w-[44ch] text-[15px] text-neutral-700">
            {albums.length
              ? "Try a different name, or clear the date filter."
              : "When the committee publishes an event album, it shows up here first."}
          </p>
          {filtersOn ? (
            <button
              type="button"
              className="soft-btn soft-btn-primary"
              onClick={() => {
                setQuery("");
                setDay(null);
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {hero ? (
            <Link href={`${hrefBase}/${hero.id}`} className="soft-card group mt-6 block overflow-hidden !p-0 no-underline">
              <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
                {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                <img src={hero.coverUrl ?? ""} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(25,18,22,0.82)] via-[rgba(25,18,22,0.15)] to-transparent" />
                <span className="soft-sticker absolute right-4 top-4 sm:right-6 sm:top-6">
                  {hero.isNew ? "New since you were here" : "Latest album"}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5 sm:p-7">
                  <span className="soft-chip bg-white/90 text-[--color-accent-700]">{formatDate(hero.date)}</span>
                  <span className="soft-display text-[clamp(26px,4.5vw,44px)] text-white">{hero.title}</span>
                  <span className="flex flex-wrap items-center gap-3 text-[14px] font-semibold text-white/90">
                    {hero.photoCount ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CameraIcon size={16} />
                        {hero.photoCount.toLocaleString("en-AU")} photos
                      </span>
                    ) : null}
                    {hero.videoCount ? (
                      <span className="inline-flex items-center gap-1.5">
                        <PlayIcon size={16} />
                        {hero.videoCount.toLocaleString("en-AU")} videos
                      </span>
                    ) : null}
                    {hero.openToMembers ? <span>members can add</span> : null}
                  </span>
                </div>
              </div>
            </Link>
          ) : null}

          <div className="mt-6 grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {rows.map((album) => (
              <Link key={album.id} href={`${hrefBase}/${album.id}`} className="soft-card flex flex-col gap-3 p-4 no-underline">
                {album.tiles.length === 0 ? (
                  <div
                    className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-[var(--soft-r-sm)] text-[14px] text-neutral-600"
                    style={{ background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}
                  >
                    <span className="text-accent-400">
                      <PhotoStackArt size={104} />
                    </span>
                    Nothing uploaded yet
                  </div>
                ) : (
                  <div className="grid aspect-[4/3] w-full grid-cols-3 grid-rows-2 gap-1.5">
                    {album.tiles.slice(0, 3).map((tile, index) => {
                      const last = index === Math.min(album.tiles.length, 3) - 1;
                      const hidden = album.moreCount + Math.max(0, album.tiles.length - 3);
                      return (
                        <span key={tile.id} className={`soft-tile ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
                          {tile.url ? (
                            // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
                            <img src={tile.url} alt="" loading="lazy" />
                          ) : null}
                          {last && hidden > 0 ? (
                            <span className="absolute inset-0 flex items-center justify-center bg-[rgba(25,18,22,0.55)] text-[15px] font-extrabold text-white">
                              +{hidden}
                            </span>
                          ) : null}
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {album.isNew ? (
                    <span className="soft-chip !bg-accent !text-white">New</span>
                  ) : null}
                  <span className="soft-chip">{formatDate(album.date)}</span>
                  {album.status === "draft" && canManage ? <span className="soft-chip soft-chip-muted">Draft</span> : null}
                  {album.openToMembers ? <span className="soft-chip soft-chip-muted">Members can add</span> : null}
                </div>
                <div>
                  <span className="soft-display block text-[22px] text-ink">{album.title}</span>
                  <span className="mt-1 block text-[14px] text-neutral-700">{countLabel(album)}</span>
                </div>
                {album.description ? (
                  <p className="m-0 line-clamp-2 text-[14px] text-neutral-700">{album.description}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
