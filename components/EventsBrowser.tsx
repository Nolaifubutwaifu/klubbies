"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { StackedAlbum } from "@/lib/media/album-list";
import { formatDate, formatLongDate } from "@/lib/format";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

export function EventsBrowser({
  albums,
  hrefBase,
  canManage,
}: {
  albums: StackedAlbum[];
  hrefBase: string;
  canManage: boolean;
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
  // Only lead with a hero when the newest album actually has a picture in it.
  const hero = !filtersOn && filtered[0]?.coverUrl && filtered[0].photoCount + filtered[0].videoCount > 0 ? filtered[0] : null;
  const rows = hero ? filtered.slice(1) : filtered;
  const monthLabel = month.toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  return (
    <>
      <div className="grid border-b-2 border-divider" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div className="p-6">
          <h1 className="display" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>
            Events
          </h1>
          <p className="mt-2 text-[15px] text-neutral-700">
            {albums.length
              ? `${albums.length} ${albums.length === 1 ? "album" : "albums"}, newest first.`
              : "Everything the committee has shared with you."}
          </p>
        </div>
        <div className="flex flex-col justify-end gap-2 bg-surface p-6">
          <div className="flex flex-wrap items-stretch gap-2">
            <input
              className="input min-w-[200px] flex-1 text-[14px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search event names"
              aria-label="Search event names"
              type="search"
            />
            <button type="button" className="btn btn-secondary text-[14px]" onClick={() => setCalOpen((v) => !v)} aria-expanded={calOpen}>
              {day ? formatLongDate(day) : "Any date"}
            </button>
            {filtersOn ? (
              <button
                type="button"
                className="btn btn-ghost text-[14px]"
                onClick={() => {
                  setQuery("");
                  setDay(null);
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
          <span className="text-[12px] text-neutral-600">
            {filtersOn ? `${filtered.length} of ${albums.length} shown` : `${albums.length} in total`}
          </span>
        </div>
      </div>

      {calOpen ? (
        <div className="flex flex-wrap gap-6 border-b-2 border-divider p-6">
          <div className="w-[320px] max-w-full">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className="h-8 w-8 border-2 border-divider bg-transparent text-[16px] hover:border-accent"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                aria-label="Previous month"
              >
                ←
              </button>
              <span className="font-heading text-[16px] font-extrabold tracking-[0.02em]">{monthLabel}</span>
              <button
                type="button"
                className="h-8 w-8 border-2 border-divider bg-transparent text-[16px] hover:border-accent"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                aria-label="Next month"
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7">
              {WEEKDAYS.map((w) => (
                <span key={w} className="p-1 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-600">
                  {w[0]}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-neutral-300">
              {monthGrid(month).map((d) => {
                const key = dayKey(d);
                const inMonth = d.getMonth() === month.getMonth();
                const has = daysWithPhotos.has(key);
                const selected = day === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className="flex aspect-square flex-col items-center justify-center gap-1 border-0 text-[13px]"
                    style={{
                      background: selected ? "var(--color-accent)" : "var(--color-bg)",
                      color: selected ? "#fff" : inMonth ? "var(--color-text)" : "var(--color-neutral-400)",
                      fontWeight: has ? 700 : 400,
                      cursor: "pointer",
                    }}
                    onClick={() => setDay(selected ? null : key)}
                  >
                    {d.getDate()}
                    <span
                      className="h-1 w-1"
                      style={{ background: has ? (selected ? "#fff" : "var(--color-accent)") : "transparent" }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex min-w-[220px] flex-1 flex-col gap-3">
            <span className="label-caps">Or jump to</span>
            <div className="flex flex-wrap gap-2">
              {albums.slice(0, 4).map((album) => (
                <button
                  key={album.id}
                  type="button"
                  className="btn btn-ghost border-2 border-divider text-[13px]"
                  onClick={() => {
                    setDay(dayKey(album.date));
                    setMonth(startOfMonth(new Date(album.date)));
                  }}
                >
                  {formatDate(album.date)}
                </button>
              ))}
            </div>
            <p className="m-0 max-w-[40ch] text-[13px] leading-normal text-neutral-700">
              Days with a red dot have photos. Click a day to filter, click it again to clear.
            </p>
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="p-6">
          <div className="panel max-w-[520px] p-6">
            <div className="font-heading text-[20px] font-extrabold">
              {albums.length ? "Nothing matches that" : "Nothing shared yet"}
            </div>
            <p className="mb-4 mt-2 text-[14px] text-neutral-700">
              {albums.length
                ? "No album name or date matches your search."
                : "When the committee publishes an event album, it shows up here."}
            </p>
            {filtersOn ? (
              <button
                type="button"
                className="btn btn-secondary text-[14px]"
                onClick={() => {
                  setQuery("");
                  setDay(null);
                }}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {hero ? (
            <Link href={`${hrefBase}/${hero.id}`} className="tile block border-b-2 border-divider text-ink no-underline">
              <div className="relative aspect-[16/9] max-h-[420px] w-full sm:aspect-[21/9]">
                {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                <img src={hero.coverUrl ?? ""} alt="" />
                <div className="overlay-title">
                  <span className="chip-date self-start">{formatDate(hero.date)}</span>
                  <span className="display text-[clamp(28px,5vw,52px)] text-white">{hero.title}</span>
                  <span className="text-[14px] text-white/85">
                    {[
                      hero.photoCount ? `${hero.photoCount.toLocaleString("en-AU")} photos` : null,
                      hero.videoCount ? `${hero.videoCount.toLocaleString("en-AU")} videos` : null,
                      hero.openToMembers ? "members can add" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Newest album"}
                  </span>
                </div>
              </div>
            </Link>
          ) : null}

          {rows.map((album, index) => (
            <section
              key={album.id}
              className={`grid gap-6 border-b-2 border-divider p-6 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] ${
                index % 2 === 1 ? "bg-surface" : ""
              }`}
            >
              <div className="flex flex-col items-start gap-3">
                <span className="chip-date">{formatDate(album.date)}</span>
                <Link
                  href={`${hrefBase}/${album.id}`}
                  className="font-heading text-[26px] font-black tracking-[-0.02em] text-ink no-underline hover:text-accent"
                >
                  {album.title}
                </Link>
                <span className="text-[13px] text-neutral-700">
                  {[
                    album.photoCount ? `${album.photoCount.toLocaleString("en-AU")} photos` : null,
                    album.videoCount ? `${album.videoCount.toLocaleString("en-AU")} videos` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Empty"}
                </span>
                {album.description ? (
                  <p className="m-0 max-w-[36ch] text-[13px] leading-normal text-neutral-700">{album.description}</p>
                ) : null}
                <span className="flex flex-wrap gap-2">
                  {album.status === "draft" && canManage ? <span className="tag tag-neutral">Draft</span> : null}
                  {album.openToMembers ? <span className="tag tag-accent">Members can add</span> : null}
                </span>
                <Link href={`${hrefBase}/${album.id}`} className="btn btn-secondary text-[13px]">
                  Open album
                </Link>
              </div>
              <div className="flex gap-[2px]">
                {album.tiles.length === 0 ? (
                  <div className="panel flex aspect-[3/1] w-full items-center justify-center text-[13px] text-neutral-600">
                    Nothing uploaded yet
                  </div>
                ) : (
                  album.tiles.map((tile, tileIndex) => (
                    <Link
                      key={tile.id}
                      href={`${hrefBase}/${album.id}/${tile.id}`}
                      className="tile aspect-square min-w-0 flex-1"
                    >
                      {tile.url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
                        <img src={tile.url} alt="" loading="lazy" />
                      ) : null}
                      {tileIndex === album.tiles.length - 1 && album.moreCount > 0 ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-neutral-900/70 font-heading text-[18px] font-extrabold text-white">
                          +{album.moreCount}
                        </span>
                      ) : null}
                    </Link>
                  ))
                )}
              </div>
            </section>
          ))}
        </>
      )}
    </>
  );
}
