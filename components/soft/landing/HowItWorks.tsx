/* eslint-disable @next/next/no-img-element -- fixed-size thumbnails inside a mock UI */
import { Reveal } from "@/components/soft/Reveal";
import { SectionFx } from "@/components/soft/SectionFx";

const ROSTER_ROWS = [
  ["Tilly Nguyen", "t.nguyen@student…"],
  ["Mahi Patel", "m.patel@student…"],
  ["Jack Ryan", "j.ryan@student…"],
];

const UPLOADS = [
  { name: "IMG_4482.HEIC", pct: 100, label: "Done" },
  { name: "IMG_4483.HEIC", pct: 72, label: "72%" },
  { name: "MVI_0091.MOV · 1.4 GB", pct: 18, label: "18%" },
];

const PHONE_TILES = [
  "/marketing/night-ball.jpg",
  "/marketing/night-dancefloor.jpg",
  "/marketing/hero-1.jpg",
  "/marketing/hero-2.jpg",
  "/marketing/night-bigone.jpg",
  "/marketing/hero-3.jpg",
  "/marketing/night-grandfinal.jpg",
  "/marketing/hero-4.jpg",
  "/marketing/night-ball.jpg",
];

/** Three steps, each paired with the piece of product it actually describes. */
export function HowItWorks() {
  return (
    <section id="how" className="soft-fx-host border-y border-[color-mix(in_srgb,var(--color-text)_6%,transparent)] bg-[color:var(--color-surface)]">
      <SectionFx dots="faint" />
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-[clamp(28px,4vw,40px)]">
            Three steps, <span className="soft-word">once</span>.
          </h2>
          <p className="mt-3 max-w-[54ch] text-[17px] text-[color:var(--ink-70)]">
            Set up on a Sunday arvo. Every event after that is a drag and drop.
          </p>
        </Reveal>

        <div className="mt-9 grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {/* 01 — roster */}
          <Reveal className="h-full">
            <article className="flex h-full flex-col gap-3 rounded-[var(--soft-r)] border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color:var(--color-bg)] p-6">
              <div className="flex items-baseline gap-2.5">
                <span className="soft-display text-[15px] text-accent-700">01</span>
                <h3 className="text-[21px]">Bring your member list</h3>
              </div>
              <p className="text-[15px] text-[color:var(--ink-70)]">
                Upload the CSV your club already keeps. Map the columns once. That list is the door.
              </p>
              <div className="mt-auto overflow-hidden rounded-[var(--soft-r-sm)] border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-white">
                <div className="flex items-center gap-2 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-3 py-2.5 text-[12px] font-bold text-[color:var(--ink-70)]">
                  members-s2-2026.csv
                  <span className="ml-auto text-accent-700">128 rows</span>
                </div>
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-[color:var(--tone-support)] text-[color:var(--tone-support-ink)]">
                      <th scope="col" className="px-3 py-2 text-left font-bold">Name &rarr; Full name</th>
                      <th scope="col" className="px-3 py-2 text-left font-bold">Email &rarr; Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROSTER_ROWS.map(([name, email]) => (
                      <tr key={name} className="border-t border-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                        <td className="px-3 py-2">{name}</td>
                        <td className="px-3 py-2 text-[color:var(--ink-70)]">{email}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                      <td className="px-3 py-2 text-[color:var(--ink-55)]" colSpan={2}>+125 more</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </Reveal>

          {/* 02 — upload */}
          <Reveal className="h-full" delay={80}>
            <article className="flex h-full flex-col gap-3 rounded-[var(--soft-r)] border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color:var(--color-bg)] p-6">
              <div className="flex items-baseline gap-2.5">
                <span className="soft-display text-[15px] text-accent-700">02</span>
                <h3 className="text-[21px]">Drop the whole night in</h3>
              </div>
              <p className="text-[15px] text-[color:var(--ink-70)]">
                400 phone photos, the drone clip, the committee headshots. Full quality, one album.
              </p>
              <div className="mt-auto flex flex-col gap-3 rounded-[var(--soft-r-sm)] border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-white p-4">
                <div className="soft-dashed rounded-[14px] p-4 text-center">
                  <span className="soft-display block text-[14px] text-accent-700">Drop 412 files</span>
                </div>
                {UPLOADS.map((file) => (
                  <div key={file.name}>
                    <div className="flex text-[12px] text-[color:var(--ink-70)]">
                      <span>{file.name}</span>
                      <span className="ml-auto font-bold text-ink">{file.label}</span>
                    </div>
                    <div className="mt-1.5 h-[7px] rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent-500),var(--color-accent-700))]"
                        style={{ width: `${file.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[12px] text-[color:var(--ink-55)]">Close the tab if you want &mdash; it picks up where it stopped.</p>
              </div>
            </article>
          </Reveal>

          {/* 03 — member view */}
          <Reveal className="h-full" delay={160}>
            <article className="flex h-full flex-col gap-3 rounded-[var(--soft-r)] border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color:var(--color-bg)] p-6">
              <div className="flex items-baseline gap-2.5">
                <span className="soft-display text-[15px] text-accent-700">03</span>
                <h3 className="text-[21px]">Everyone finds themselves</h3>
              </div>
              <p className="text-[15px] text-[color:var(--ink-70)]">
                Members sign in with the email your club already has. Nobody else gets past the door.
              </p>
              <div className="mt-auto flex justify-center rounded-[var(--soft-r)] bg-ink p-2.5">
                <div className="w-[190px] overflow-hidden rounded-[14px] bg-[color:var(--color-bg)]">
                  <div className="border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-3 py-2.5">
                    <span className="soft-display block text-[13px]">Semester 2 Ball</span>
                    <span className="block text-[10px] text-[color:var(--ink-70)]">412 photos &middot; 9 videos</span>
                  </div>
                  <div className="grid grid-cols-3 gap-[3px] p-1.5">
                    {PHONE_TILES.map((src, i) => (
                      <span key={i} className="aspect-square overflow-hidden rounded-[7px] bg-[color:var(--tone-support)]">
                        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
