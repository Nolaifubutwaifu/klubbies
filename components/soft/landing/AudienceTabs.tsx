"use client";

/* eslint-disable @next/next/no-img-element -- fixed-size thumbnails inside a mock UI */
import { useId, useState } from "react";
import { Reveal } from "@/components/soft/Reveal";
import { SectionFx } from "@/components/soft/SectionFx";

/** Stroke paths for the feature icons, kept local: one-offs, not app icons. */
const PATHS: Record<string, string> = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M20 20l-4-4",
  heart: "M12 20s-7-4.6-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.4 12 20 12 20Z",
  download: "M12 4v11M7 11l5 5 5-5M5 20h14",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10.3 21a2 2 0 0 0 3.4 0",
  rewind: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5",
  hide: "M4 4l16 16M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z",
  roles: "M9 4.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8M3 20c0-3.3 2.7-5.4 6-5.4s6 2.1 6 5.4M17 8h5M19.5 5.5v5",
  link: "M10 13a4.5 4.5 0 0 0 6.4 0l2.6-2.6a4.5 4.5 0 1 0-6.4-6.4L11.4 5M14 11a4.5 4.5 0 0 0-6.4 0L5 13.6a4.5 4.5 0 1 0 6.4 6.4l1.2-1.2",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3.5 2",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
};

function FeatureIcon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}

type Feature = { icon: keyof typeof PATHS; title: string; body: string };

const MEMBER_FEATURES: Feature[] = [
  { icon: "search", title: "Every album you were at", body: "Search by event name or scroll the year back. Last year's ball is two taps away." },
  { icon: "heart", title: "Favourite as you scroll", body: "Double tap the good ones. They land in Saved, full quality, ready to download." },
  { icon: "download", title: "The whole album, one tap", body: "Straight to your Photos app at the size it was shot. No zip, no 200kb screenshots." },
  { icon: "bell", title: "A nudge when photos drop", body: "One email the morning after. Turn it off in two taps if that's not you." },
  { icon: "rewind", title: "One year ago tonight", body: "A card on your home screen when an album has a birthday. Usually a mistake you'd forgotten." },
  { icon: "hide", title: "Take that one down", body: "Ask for any photo of you to go. It hides straight away, then the committee confirms." },
];

const COMMITTEE_FEATURES: Feature[] = [
  { icon: "download", title: "Bulk upload, full quality", body: "Originals in, originals out. Resumes if your wifi drops mid-album." },
  { icon: "rewind", title: "Roster sync each semester", body: "Re-upload the CSV. It adds the new lot and flags who's dropped off." },
  { icon: "roles", title: "Roles that make sense", body: "President, media officer, uploader. Only one of them can touch billing." },
  { icon: "link", title: "A link for your photographer", body: "Upload-only, expires on a date you pick. They never see the albums." },
  { icon: "clock", title: "Schedule the drop", body: "Queue the album at 2am, let it go live at 10. Everyone wakes up to it." },
  { icon: "chart", title: "Stats you can quote at AGM", body: "Views and downloads per album, so you know which nights actually landed." },
];

const MEMBER_ALBUMS = [
  { src: "/marketing/night-ball.jpg", title: "Semester 2 Ball", meta: "12 Sept · 412 photos", isNew: true },
  { src: "/marketing/night-grandfinal.jpg", title: "Grand Final vs Engineering", meta: "5 Sept · 288 photos" },
];

const STATS = [
  ["128", "Members"],
  ["17", "Albums"],
  ["6,204", "Photos"],
  ["892", "Views"],
];

/** Two audiences, two moods: a camera roll and a control panel. */
export function AudienceTabs() {
  const [tab, setTab] = useState<"members" | "committees">("members");
  const id = useId();
  const members = tab === "members";
  const features = members ? MEMBER_FEATURES : COMMITTEE_FEATURES;

  return (
    <section className="soft-fx-host">
      <SectionFx blobs={["lilac", "right"]} />
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end gap-6">
          <Reveal className="min-w-[280px] flex-1">
            <h2 className="text-[clamp(28px,4vw,40px)]">Two sides of the same night.</h2>
            <p className="mt-3 max-w-[52ch] text-[17px] text-[color:var(--ink-70)]">
              Members get a camera roll. The committee gets a control panel.
            </p>
          </Reveal>
          <div role="tablist" aria-label="Audience" className="soft-card flex gap-1.5 !rounded-full p-1.5">
            <button
              type="button"
              role="tab"
              id={`${id}-members-tab`}
              aria-selected={members}
              aria-controls={`${id}-members`}
              onClick={() => setTab("members")}
              className={`soft-btn ${members ? "soft-btn-primary" : "soft-btn-tonal"}`}
            >
              For members
            </button>
            <button
              type="button"
              role="tab"
              id={`${id}-committees-tab`}
              aria-selected={!members}
              aria-controls={`${id}-committees`}
              onClick={() => setTab("committees")}
              className={`soft-btn ${!members ? "soft-btn-primary" : "soft-btn-tonal"}`}
            >
              For committees
            </button>
          </div>
        </div>

        <div
          role="tabpanel"
          id={members ? `${id}-members` : `${id}-committees`}
          aria-labelledby={members ? `${id}-members-tab` : `${id}-committees-tab`}
          className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]"
        >
          {members ? (
            /* Camera roll: a phone with the latest albums on it. */
            <div className="mx-auto w-full max-w-[320px] rounded-[30px] bg-ink p-2.5 shadow-[var(--shadow-lg)]">
              <div className="flex flex-col gap-2.5 rounded-[22px] bg-[color:var(--color-bg)] p-3.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--color-accent-500),var(--color-accent-700))] text-[12px] font-bold text-white">
                    UM
                  </span>
                  <span className="soft-display text-[15px]">UniMelb FC</span>
                  <span className="soft-chip ml-auto !px-2.5 !py-1 !text-[11px]">3 new</span>
                </div>
                {MEMBER_ALBUMS.map((album) => (
                  <div key={album.title} className="overflow-hidden rounded-[18px] border border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] bg-white">
                    <div className="relative h-[132px] bg-[color:var(--tone-support)]">
                      <img src={album.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                      {album.isNew ? (
                        <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white">New</span>
                      ) : null}
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="soft-display block text-[14px]">{album.title}</span>
                      <span className="block text-[11px] text-[color:var(--ink-70)]">{album.meta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Control panel: the dashboard, calm and organised. */
            <div className="soft-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] bg-[color:var(--tone-support)] px-4 py-3 text-[12px] font-bold text-[color:var(--tone-support-ink)]">
                klubbies.com/admin/umfc
              </div>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-[20px]">This week</h3>
                  <span className="soft-chip ml-auto !text-[12px]">2 tasks</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {STATS.map(([value, label]) => (
                    <div key={label} className="rounded-[14px] border border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] bg-[color:var(--color-bg)] p-2.5">
                      <span className="soft-display block text-[20px]">{value}</span>
                      <span className="block text-[11px] text-[color:var(--ink-70)]">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2.5 rounded-[16px] border border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] bg-[color:var(--color-bg)] p-3">
                  <span className="text-[12px] font-bold text-[color:var(--ink-70)]">Needs you</span>
                  <span className="flex items-center gap-2.5 text-[13px]">
                    <span className="h-[7px] w-[7px] rounded-full bg-accent" />
                    Removal request from Zoe Kaur
                    <span className="ml-auto font-bold text-accent-700">Review</span>
                  </span>
                  <span className="flex items-center gap-2.5 text-[13px]">
                    <span className="h-[7px] w-[7px] rounded-full bg-accent" />
                    Trivia Night draft, 94 photos
                    <span className="ml-auto font-bold text-accent-700">Publish</span>
                  </span>
                </div>
                <div className="flex flex-col gap-2 rounded-[16px] border border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] bg-[color:var(--color-bg)] p-3 text-[13px]">
                  <span className="text-[12px] font-bold text-[color:var(--ink-70)]">Recent activity</span>
                  <span>Mahi published <strong className="font-bold">Semester 2 Ball</strong> <span className="text-[color:var(--ink-55)]">· 2d</span></span>
                  <span>Guest link used by <strong className="font-bold">Ruth (photographer)</strong> <span className="text-[color:var(--ink-55)]">· 3d</span></span>
                  <span>14 members signed in for the first time <span className="text-[color:var(--ink-55)]">· 4d</span></span>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {features.map((feature) => (
              <div key={feature.title} className="soft-card p-5">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                    members ? "bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))] text-accent-700" : "bg-[color:var(--tone-support)] text-[color:var(--tone-support-ink)]"
                  }`}
                >
                  <FeatureIcon name={feature.icon} />
                </span>
                <h3 className="mt-2.5 text-[17px]">{feature.title}</h3>
                <p className="mt-1.5 text-[14px] text-[color:var(--ink-70)]">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
