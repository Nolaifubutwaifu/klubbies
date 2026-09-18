/* eslint-disable @next/next/no-img-element -- fixed-size thumbnails inside a mock UI */
import { Reveal } from "@/components/soft/Reveal";
import { SectionFx } from "@/components/soft/SectionFx";

const COMMITTEES = [
  { year: "2023", lead: "Dana's committee", meta: "4 albums · 1,102 photos", shots: ["/marketing/hero-2.jpg", "/marketing/hero-3.jpg"] },
  { year: "2024", lead: "Hugo's committee", meta: "5 albums · 1,640 photos", shots: ["/marketing/night-dancefloor.jpg", "/marketing/hero-4.jpg"] },
  { year: "2025", lead: "Priya's committee", meta: "4 albums · 1,458 photos", shots: ["/marketing/night-bigone.jpg", "/marketing/hero-1.jpg"] },
  { year: "2026 · now", lead: "Mahi's committee", meta: "4 albums · 2,004 photos", shots: ["/marketing/night-ball.jpg", "/marketing/night-grandfinal.jpg"], current: true },
];

/** Ownership moves; the albums do not. */
export function Handover() {
  return (
    <section className="soft-fx-host border-y border-[color-mix(in_srgb,var(--color-text)_6%,transparent)] bg-[color:var(--color-surface)]">
      <SectionFx dots="faint" />
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="max-w-[22ch] text-[clamp(28px,4vw,40px)]">
            Your club&rsquo;s history doesn&rsquo;t <span className="soft-word">graduate</span> with your media officer.
          </h2>
          <p className="mt-3 max-w-[58ch] text-[17px] text-[color:var(--ink-70)]">
            Ownership moves in one click. The albums stay exactly where they are.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,330px)]">
          <Reveal>
            <div className="relative">
              <span
                className="absolute inset-x-0 top-[52px] h-[3px]"
                style={{ background: "repeating-linear-gradient(90deg, color-mix(in srgb, var(--color-text) 18%, transparent) 0 10px, transparent 10px 18px)" }}
                aria-hidden
              />
              <ol className="relative m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4">
                {COMMITTEES.map((committee) => (
                  <li key={committee.year}>
                    <div className="flex h-[46px] items-center">
                      {committee.current ? (
                        <span className="soft-chip soft-display !text-[13px]">{committee.year}</span>
                      ) : (
                        <span className="soft-display text-[15px] text-[color:var(--ink-70)]">{committee.year}</span>
                      )}
                    </div>
                    <span
                      className={`mb-4 block h-[15px] w-[15px] rounded-full border-[3px] ${
                        committee.current ? "border-[color-mix(in_srgb,var(--color-accent)_28%,white)] bg-accent" : "border-[#bab6b6] bg-white"
                      }`}
                      aria-hidden
                    />
                    <div
                      className={`rounded-[18px] border p-3 ${
                        committee.current
                          ? "border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] bg-[color:var(--color-bg)]"
                          : "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color:var(--color-bg)]"
                      }`}
                    >
                      <span className="block text-[13px] font-bold">{committee.lead}</span>
                      <span className="mt-0.5 block text-[12px] text-[color:var(--ink-70)]">{committee.meta}</span>
                      <span className="mt-2.5 flex gap-1">
                        {committee.shots.map((shot) => (
                          <span key={shot} className="h-[34px] flex-1 overflow-hidden rounded-[7px] bg-[color:var(--tone-support)]">
                            <img src={shot} alt="" loading="lazy" className="h-full w-full object-cover" />
                          </span>
                        ))}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-[14px] text-[color:var(--ink-70)]">
                Four committees, one club account. Nothing sitting in a graduate&rsquo;s personal Drive.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex h-full flex-col gap-3.5 rounded-[var(--soft-r)] border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color:var(--color-bg)] p-5">
              <h3 className="text-[19px]">Hand over to next committee</h3>
              <div className="flex items-center gap-2.5 rounded-[14px] border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-white p-3">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[color:var(--tone-support)] text-[13px] font-bold text-[color:var(--tone-support-ink)]">
                  MP
                </span>
                <span>
                  <span className="block text-[14px] font-bold">Mahi Patel</span>
                  <span className="block text-[12px] text-[color:var(--ink-70)]">Owner &middot; President</span>
                </span>
              </div>
              <span className="flex justify-center text-accent" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </span>
              <label className="field">
                <span className="text-[13px] font-bold text-[color:var(--ink-70)]">New owner</span>
                <select defaultValue="amara" className="mt-1.5">
                  <option value="amara">Amara Chen &mdash; President 2027</option>
                  <option value="lachlan">Lachlan Doyle &mdash; Media officer</option>
                </select>
              </label>
              <label className="flex items-start gap-2.5 text-[13px] text-[color:var(--ink-70)]">
                <input type="checkbox" defaultChecked className="mt-0.5 h-[17px] w-[17px] accent-[color:var(--color-accent)]" />
                Keep me as an uploader
              </label>
              <label className="flex items-start gap-2.5 text-[13px] text-[color:var(--ink-70)]">
                <input type="checkbox" defaultChecked className="mt-0.5 h-[17px] w-[17px] accent-[color:var(--color-accent)]" />
                Archive the 2026 committee
              </label>
              <span className="soft-btn soft-btn-primary mt-auto w-full justify-center">Hand over the club</span>
              <p className="text-[12px] text-[color:var(--ink-55)]">Amara gets an email. Nothing moves until she accepts.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
