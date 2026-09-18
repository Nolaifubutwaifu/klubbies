/* eslint-disable @next/next/no-img-element -- fixed-size thumbnails inside a mock UI */
import { PhotoBand } from "@/components/soft/PhotoBand";
import { Reveal } from "@/components/soft/Reveal";

const MONTHS = [
  {
    month: "Mar",
    label: "Social",
    title: "O-Week Sausage Sizzle",
    meta: "2 Mar · 96 photos",
    src: "/marketing/hero-1.jpg",
    pos: "top",
  },
  {
    month: "Apr",
    label: "Night out",
    title: "First Social, Naughtons",
    meta: "11 Apr · 214 photos",
    src: "/marketing/night-dancefloor.jpg",
    pos: "center",
  },
  {
    month: "Jun",
    label: "Sport",
    title: "Round 7 vs Monash",
    meta: "6 Jun · 173 photos",
    src: "/marketing/night-grandfinal.jpg",
    pos: "center",
  },
  {
    month: "Sept",
    label: "Formal",
    title: "Semester 2 Ball",
    meta: "12 Sept · 412 photos",
    src: "/marketing/night-ball.jpg",
    pos: "center",
    current: true,
  },
];

/**
 * The calendar band. Dark tinted photos behind white album cards: the same
 * treatment as the closing CTA, turned diagonally so the two don't read as
 * the same slide twice.
 */
export function YearInTheLife() {
  return (
    <section className="soft-fx-host soft-on-dark relative overflow-hidden">
      <PhotoBand columns={8} rows={3} tint="diagonal" />
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-[clamp(28px,4vw,40px)] text-white">A year in the life of a club.</h2>
          <p className="soft-muted mt-3 max-w-[54ch] text-[17px]">
            One account, one subscription, the whole calendar stacking up behind you.
          </p>
        </Reveal>

        <div className="relative mt-9">
          <span
            className="absolute inset-x-0 top-[96px] hidden h-[3px] xl:block"
            style={{ background: "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.45) 0 12px, transparent 12px 20px)" }}
            aria-hidden
          />
          <ol className="relative m-0 grid list-none gap-5 p-0 sm:grid-cols-2 xl:grid-cols-5">
            {MONTHS.map((entry, i) => (
              <Reveal key={entry.title} delay={i * 70}>
                <li>
                  <span className="soft-muted block h-[26px] text-[13px] font-bold">{entry.month}</span>
                  <span
                    className={`my-4 block h-[13px] w-[13px] rounded-full xl:mt-[62px] ${
                      entry.current ? "bg-white ring-4 ring-[color-mix(in_srgb,var(--color-accent)_55%,transparent)]" : "bg-[#ff9783]"
                    }`}
                    aria-hidden
                  />
                  <div
                    className={`overflow-hidden rounded-[20px] bg-white shadow-[0_18px_36px_-12px_rgba(0,0,0,0.5)] ${
                      entry.current ? "border-2 border-accent" : "border border-[color-mix(in_srgb,var(--color-text)_7%,transparent)]"
                    }`}
                  >
                    <div className="relative h-[126px] bg-[color:var(--tone-support)]">
                      <img src={entry.src} alt="" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: entry.pos }} />
                      {entry.current ? (
                        <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white">New</span>
                      ) : null}
                    </div>
                    <div className="px-3.5 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${entry.current ? "bg-[color-mix(in_srgb,var(--color-accent)_12%,white)] text-accent-700" : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] text-[color:var(--ink-70)]"}`}>
                        {entry.label}
                      </span>
                      <span className="soft-display mt-1.5 block text-[15px] text-ink">{entry.title}</span>
                      <span className="block text-[12px] text-[color:var(--ink-70)]">{entry.meta}</span>
                    </div>
                  </div>
                </li>
              </Reveal>
            ))}

            {/* Up next: the slot the club hasn't filled yet. */}
            <Reveal delay={280}>
              <li>
                <span className="soft-muted block h-[26px] text-[13px] font-bold">Oct</span>
                <span className="my-4 block h-[13px] w-[13px] rounded-full bg-white/45 xl:mt-[62px]" aria-hidden />
                <div className="overflow-hidden rounded-[20px] border border-dashed border-white/50 bg-white/10">
                  <div className="flex h-[126px] items-center justify-center text-white/60" aria-hidden>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <div className="px-3.5 py-3">
                    <span className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white">Up next</span>
                    <span className="soft-display mt-1.5 block text-[15px] text-white">End of Season Awards</span>
                    <span className="soft-faint block text-[12px]">24 Oct &middot; not yet</span>
                  </div>
                </div>
              </li>
            </Reveal>
          </ol>
        </div>
      </div>
    </section>
  );
}
