/* eslint-disable @next/next/no-img-element -- fixed-size thumbnails inside a mock UI */
import Link from "next/link";
import { Reveal } from "@/components/soft/Reveal";
import { SectionFx } from "@/components/soft/SectionFx";

const INCLUDED = [
  "Unlimited members and albums",
  "Full quality photos and video",
  "Roster import from CSV, every semester",
  "Cancel any time, keep what's there",
];

/** The stack of albums piling up behind the price. */
const STACK = [
  {
    label: "O-Week Sausage Sizzle · 96 photos",
    shots: ["/marketing/hero-2.jpg", "/marketing/hero-4.jpg", "/marketing/hero-3.jpg"],
    className: "left-0 top-[132px] w-[300px] -rotate-4",
    shadow: "0 10px 24px -8px rgba(43,34,40,0.22)",
  },
  {
    label: "Round 7 vs Monash · 173 photos",
    shots: ["/marketing/night-dancefloor.jpg", "/marketing/hero-1.jpg", "/marketing/night-grandfinal.jpg"],
    className: "left-[120px] top-[68px] w-[300px] rotate-3",
    shadow: "0 10px 24px -8px rgba(43,34,40,0.24)",
  },
  {
    label: "Semester 2 Ball · 412 photos",
    shots: ["/marketing/night-ball.jpg", "/marketing/night-bigone.jpg", "/marketing/hero-2.jpg"],
    className: "left-[244px] top-0 w-[320px] -rotate-2",
    shadow: "0 18px 36px -10px rgba(43,34,40,0.3)",
  },
];

/** One price, and what a season of it actually looks like. */
export function Pricing() {
  return (
    <section id="pricing" className="soft-fx-host border-y border-[color-mix(in_srgb,var(--color-text)_6%,transparent)] bg-[color:var(--color-surface)]">
      <SectionFx dots="faint" />
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
        <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          <Reveal>
            <div className="flex h-full flex-col rounded-[26px] border-2 border-accent bg-[color:var(--color-bg)] p-7">
              <span className="soft-chip self-start">One plan, that&rsquo;s it</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="soft-display text-[clamp(44px,6vw,60px)] tracking-[-0.03em]">A$20</span>
                <span className="text-[17px] text-[color:var(--ink-70)]">/ month, per club</span>
              </div>
              <p className="mt-2.5 text-[15px] text-[color:var(--ink-70)]">
                Not per member. Not per gigabyte. Split four ways at committee drinks and it&rsquo;s a round.
              </p>
              <ul className="m-0 mt-5 flex list-none flex-col gap-2.5 p-0">
                {INCLUDED.map((line) => (
                  <li key={line} className="flex gap-2.5 text-[15px]">
                    <span className="mt-0.5 shrink-0 text-accent-700" aria-hidden>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                        <path d="M4 12.5 9.5 18 20 6.5" />
                      </svg>
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/start"
                className="soft-btn soft-btn-primary soft-btn-lg mt-auto w-full justify-center !text-[17px] no-underline"
              >
                Start your club
              </Link>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="flex h-full flex-col">
              <h2 className="text-[clamp(26px,3.4vw,34px)]">What A$20 actually buys.</h2>
              <p className="mt-3 max-w-[52ch] text-[16px] text-[color:var(--ink-70)]">
                A season of albums, stacked up and still there when the next committee takes over.
              </p>

              {/* Overlapping cards, so the year reads as a pile rather than a list. */}
              <div className="relative mt-6 hidden h-[260px] sm:block" aria-hidden>
                {STACK.map((card) => (
                  <div
                    key={card.label}
                    className={`absolute rounded-[20px] border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-white p-2.5 ${card.className}`}
                    style={{ boxShadow: card.shadow }}
                  >
                    <div className="flex gap-1.5">
                      {card.shots.map((shot) => (
                        <span key={shot} className="h-[66px] flex-1 overflow-hidden rounded-[12px] bg-[color:var(--tone-support)]">
                          <img src={shot} alt="" loading="lazy" className="h-full w-full object-cover" />
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-[12px] text-[color:var(--ink-70)]">{card.label}</div>
                  </div>
                ))}
                <span className="soft-sticker absolute right-2 top-[186px]">17 albums and counting</span>
              </div>

              {/* Phones get the same idea without the overlap. */}
              <div className="mt-6 flex flex-col gap-3 sm:hidden">
                {STACK.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[18px] border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-white p-2.5"
                  >
                    <div className="flex gap-1.5">
                      {card.shots.map((shot) => (
                        <span key={shot} className="h-[58px] flex-1 overflow-hidden rounded-[11px] bg-[color:var(--tone-support)]">
                          <img src={shot} alt="" loading="lazy" className="h-full w-full object-cover" />
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-[12px] text-[color:var(--ink-70)]">{card.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
