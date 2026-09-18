/* eslint-disable @next/next/no-img-element -- fixed-size album thumbnails inside a mock UI */
import { Reveal } from "@/components/soft/Reveal";
import { SectionFx } from "@/components/soft/SectionFx";

/** The five photos in the "after" album mock, with the crop each tile uses. */
const ALBUM_TILES = [
  { src: "/marketing/night-ball.jpg", pos: "center", span: true },
  { src: "/marketing/hero-1.jpg", pos: "30% 20%" },
  { src: "/marketing/night-dancefloor.jpg", pos: "top" },
  { src: "/marketing/hero-2.jpg", pos: "bottom" },
  { src: "/marketing/night-grandfinal.jpg", pos: "center" },
  { src: "/marketing/hero-3.jpg", pos: "left" },
  { src: "/marketing/hero-4.jpg", pos: "right" },
  { src: "/marketing/night-bigone.jpg", pos: "center" },
  { src: "/marketing/night-ball.jpg", pos: "bottom" },
];

const BEFORE_TAGS = ["Link escapes the club", "Compressed to mush", "Dies with the media officer"];
const AFTER_TAGS = ["Full quality, always", "Roster is the door", "Still here in 2030"];

/**
 * The before/after that sets up the whole page: a group chat falling apart
 * next to the album it should have been.
 */
export function ProblemStrip() {
  return (
    <section className="soft-fx-host">
      <SectionFx blobs={["right"]} dots="full" />
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="max-w-[20ch] text-[clamp(28px,4vw,42px)]">
            The Google Drive link is <span className="soft-word">not a system</span>.
          </h2>
          <p className="mt-3 max-w-[58ch] text-[17px] text-[color:var(--ink-70)]">
            Every committee has done this. It works for about nine days.
          </p>
        </Reveal>

        <div className="mt-9 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* Before */}
          <Reveal className="h-full">
            <div className="soft-card flex h-full flex-col gap-4 p-6">
              <span className="soft-chip soft-chip-muted self-start">Before &mdash; the club group chat</span>
              <div className="flex flex-col gap-3">
                <p className="max-w-[78%] self-start rounded-[18px_18px_18px_6px] bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-4 py-2.5 text-[14px]">
                  <strong className="font-bold">Tilly</strong>
                  <br />
                  anyone got the ball photos??
                </p>
                <p className="max-w-[82%] self-end rounded-[18px_18px_6px_18px] bg-[color:var(--tone-support)] px-4 py-2.5 text-[14px]">
                  <strong className="font-bold">Mahi</strong>
                  <br />
                  drive.google.com/drive/folders/1kQ&hellip;
                  <span className="mt-1.5 inline-block rounded-lg bg-[#ffe2dd] px-2.5 py-1 text-[12px] font-bold text-[#8c1600]">
                    You need access &middot; Request?
                  </span>
                </p>
                <p className="max-w-[78%] self-start rounded-[18px_18px_18px_6px] bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-4 py-2.5 text-[14px]">
                  <strong className="font-bold">Jack</strong>
                  <br />
                  mine says expired, here&rsquo;s a zip
                  <span className="mt-2 flex w-fit items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] bg-white px-3 py-2 text-[12px] text-[color:var(--ink-70)]">
                    ball-night-FINAL-v3.zip &middot; 4.2 GB
                  </span>
                </p>
                <p className="max-w-[82%] self-end rounded-[18px_18px_6px_18px] bg-[color:var(--tone-support)] px-4 py-2.5 text-[14px]">
                  <strong className="font-bold">Sofia</strong>
                  <br />
                  can someone reupload, it&rsquo;s all 200kb now
                </p>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {BEFORE_TAGS.map((tag) => (
                  <span key={tag} className="soft-chip soft-chip-muted !text-[12px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="flex items-center justify-center text-accent" aria-hidden>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="rotate-90 lg:rotate-0">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>

          {/* After */}
          <Reveal className="h-full" delay={90}>
            <div className="soft-card flex h-full flex-col gap-4 p-6">
              <span className="soft-chip self-start">After &mdash; one Klubbies album</span>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-accent-500),var(--color-accent-700))] text-[15px] font-bold text-white">
                  UM
                </span>
                <span className="flex-1">
                  <span className="soft-display block text-[18px]">Semester 2 Ball</span>
                  <span className="block text-[13px] text-[color:var(--ink-70)]">Sat 12 Sept 2026 &middot; 412 photos &middot; 9 videos</span>
                </span>
                <span className="soft-chip whitespace-nowrap !text-[12px]">Members only</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5" style={{ gridAutoRows: "84px" }}>
                {ALBUM_TILES.map((tile, i) => (
                  <span
                    key={`${tile.src}-${i}`}
                    className={`relative overflow-hidden rounded-[14px] bg-[color:var(--tone-support)] ${tile.span ? "col-span-2 row-span-2" : ""}`}
                  >
                    <img src={tile.src} alt="" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: tile.pos }} />
                    {i === ALBUM_TILES.length - 1 ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-[rgba(25,18,22,0.62)] text-[15px] font-bold text-white">
                        +403
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {AFTER_TAGS.map((tag) => (
                  <span key={tag} className="soft-chip !text-[12px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
