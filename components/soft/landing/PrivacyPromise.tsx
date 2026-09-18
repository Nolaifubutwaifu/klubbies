import { PhotoBand } from "@/components/soft/PhotoBand";
import { Reveal } from "@/components/soft/Reveal";

const PROMISES = [
  {
    title: "Members only, checked every time",
    body: "Your roster is the access list. There is no shareable link that works without it.",
  },
  {
    title: "Not indexed, not crawlable",
    body: "Albums never appear in Google. Searching a member's name will never surface your photos.",
  },
  {
    title: "Take me out of that one",
    body: "Any member can request removal. The photo hides immediately, then the committee confirms.",
  },
  {
    title: "Leaving comes with a 30 day window",
    body: "Off the roster? You get a month of reminders to save anything you want to keep.",
  },
];

/**
 * The trust section. Photos sit under a cream veil behind it — you sense them
 * without being able to read them, which is rather the point.
 */
export function PrivacyPromise() {
  return (
    <section className="soft-fx-host relative overflow-hidden">
      <PhotoBand columns={6} rows={2} tint="paper" desaturate />
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <Reveal>
            <span className="soft-chip !bg-[color:var(--tone-support)] !text-[color:var(--tone-support-ink)]">Privacy &amp; consent</span>
            <h2 className="mt-4 max-w-[18ch] text-[clamp(28px,4vw,40px)]">Nobody gets in who isn&rsquo;t on the list.</h2>
            <ul className="m-0 mt-6 flex list-none flex-col gap-3.5 p-0">
              {PROMISES.map((promise) => (
                <li key={promise.title} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-accent-700" aria-hidden>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12.5 9.5 18 20 6.5" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-[16px] font-bold">{promise.title}</span>
                    <span className="block text-[14px] text-[color:var(--ink-70)]">{promise.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* What an outsider gets: a locked page with nothing leaking from it. */}
          <Reveal delay={100}>
            <div className="mx-auto w-full max-w-[400px] rounded-[26px] bg-ink p-3 shadow-[var(--shadow-lg)]">
              <div className="flex items-center gap-1.5 px-1.5 pb-2.5">
                <span className="h-2 w-2 rounded-full bg-[#5f545a]" />
                <span className="h-2 w-2 rounded-full bg-[#5f545a]" />
                <span className="h-2 w-2 rounded-full bg-[#5f545a]" />
                <span className="ml-2 text-[11px] text-[#bab6b6]">klubbies.com/c/umfc/a/ball-2026</span>
              </div>
              <div className="rounded-[18px] bg-[color:var(--color-bg)] px-6 py-9 text-center">
                <span className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))] text-accent-700" aria-hidden>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="4" y="10" width="16" height="11" rx="2.5" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <h3 className="mt-4 text-[23px]">You&rsquo;re not on the list.</h3>
                <p className="mt-2 text-[15px] text-[color:var(--ink-70)]">
                  This album belongs to UniMelb FC. Ask your committee to add your email, and this page opens.
                </p>
                <span className="soft-btn soft-btn-tonal mt-4">How do I get added?</span>
                <p className="mt-3.5 text-[12px] text-[color:var(--ink-55)]">No preview. No thumbnails. Nothing leaks from this page.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
