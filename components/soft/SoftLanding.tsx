import Link from "next/link";
import type React from "react";
import { PhotoCarousel, type Slide } from "@/components/soft/PhotoCarousel";
import { Reveal } from "@/components/soft/Reveal";
import { SoftBackdrop } from "@/components/soft/SoftBackdrop";
import { CameraIcon, PlayIcon, SearchIcon } from "@/components/soft/icons";
import { PhotoStackArt, SquiggleUnderline } from "@/components/soft/illustrations";

/** Club photos in /public/marketing, cropped to 2000x1000. The tint shows
 *  while the photo loads. */
const NIGHTS: Slide[] = [
  { src: "/marketing/night-ball.jpg", title: "Ball night", caption: "Formal", tint: "linear-gradient(140deg,#f6d6a6,#c98a3a)" },
  { src: "/marketing/night-grandfinal.jpg", title: "Grand final", caption: "Sport", tint: "linear-gradient(140deg,#bfe0a8,#3f7a45)" },
  { src: "/marketing/night-bigone.jpg", title: "The whole club, one room", caption: "End of season", tint: "linear-gradient(140deg,#f6b8a6,#a8443a)" },
  { src: "/marketing/night-bar.jpg", title: "Bar night", caption: "Social", tint: "linear-gradient(140deg,#a8d8e0,#2a6a7f)" },
  { src: "/marketing/night-dancefloor.jpg", title: "Dance floor", caption: "Night out", tint: "linear-gradient(140deg,#c9b6f7,#5b3fa8)" },
];

/** Square crops for the hero album stack. */
const HERO_TILES = ["/marketing/hero-1.jpg", "/marketing/hero-2.jpg", "/marketing/hero-3.jpg"];

const TICKER = ["Ball night", "Grand final", "O-Week", "Camp", "Bar crawl", "Awards night", "Trials", "End of season"];

const STEPS = [
  { num: "01", title: "Bring your member list", body: "Upload the CSV your club already keeps, or type names in. That list is the door." },
  { num: "02", title: "Drop the whole night in", body: "300 phone photos, the drone clip, the committee headshots. Full quality, one album." },
  { num: "03", title: "Everyone finds themselves", body: "Members log in with their own email and scroll the night back. Nobody else can." },
];

const PROMISES = [
  { title: "Nothing is public", body: "No indexing, no shareable link that escapes into a group chat." },
  { title: "Photos, not compression", body: "Videos and full-size images sit in the event album they belong to." },
  { title: "Leaving is handled", body: "When someone leaves the club, their access winds down on its own." },
];

const FOR_MEMBERS = [
  { title: "One login, no password", body: "A code to the email your club already has. That's the whole sign-in." },
  { title: "Search by night", body: "Every album by name or date, so last year's ball is two taps away." },
  { title: "Save what you want", body: "Download the album, or send a batch straight to your phone's Photos app." },
];

const FAQS = [
  {
    q: "Who can see our photos?",
    a: "Only people on your member list, signed in with their own email. Albums aren't public, aren't indexed by search engines, and there's no link you can forward to someone outside the club.",
  },
  {
    q: "What does it cost?",
    a: "A$20 a month per club, no matter how many members or photos. Cancel any time from your billing page — members keep seeing what's already there.",
  },
  {
    q: "What happens when someone leaves the club?",
    a: "Take them off the list and their access winds down over 30 days, with reminders so they can save anything they want to keep. Someone who never signed in loses access straight away.",
  },
  {
    q: "Do we have to re-type our member list?",
    a: "No. Upload the CSV your university or club already keeps. You map the columns once, and later imports can also flag people who have dropped off the list.",
  },
  {
    q: "Can members add their own photos?",
    a: "Per album, yes. Open an album to contributions and anyone in the club can add the shots on their camera roll; leave it closed and only the committee can.",
  },
];

/** Marketing home in the soft theme. */
export function SoftLanding() {
  return (
    <div className="theme-soft relative flex flex-1 flex-col">
      <SoftBackdrop />

      <div className="relative z-10">
        <div className="mx-auto w-full max-w-[1100px] px-4 pt-5 sm:px-6">
          <header className="soft-card flex items-center gap-3 !rounded-full py-2 pl-5 pr-3">
            <Link href="/" className="soft-wordmark text-[22px] text-ink no-underline">
              klubbies
            </Link>
            <nav className="ml-auto flex items-center gap-2">
              <Link href="/how-it-works" className="soft-btn soft-btn-tonal !min-h-[40px] !px-4 !text-[14px] no-underline">
                How it works
              </Link>
              <Link href="/signin" className="soft-btn soft-btn-primary !min-h-[40px] !px-5 !text-[14px] no-underline">
                Log in
              </Link>
            </nav>
          </header>
        </div>

        {/* Hero */}
        <section className="mx-auto grid w-full max-w-[1100px] items-center gap-10 px-4 pb-6 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-16">
          <div>
            <span className="soft-chip">For university clubs</span>
            <h1 className="mt-4 max-w-[15ch] text-[clamp(38px,6vw,68px)] leading-[1.02]">
              Every photo from <span className="soft-word">Friday</span>, waiting on <span className="soft-word">Saturday</span>.
            </h1>
            <SquiggleUnderline className="soft-squiggle mt-1 !w-[min(260px,60%)]" />
            <p className="mt-5 max-w-[46ch] text-[18px] leading-[1.5] text-[color:var(--ink-70)]">
              One private album for your club&rsquo;s nights out. Only the people on your member list get in — no public
              links, no group-chat leaks.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/start" className="soft-btn soft-btn-primary soft-btn-lg no-underline">
                Start your club
              </Link>
              <Link href="/signin" className="soft-btn soft-btn-tonal soft-btn-lg no-underline">
                I&rsquo;m a member
              </Link>
            </div>
            <p className="mt-4 text-[14px] text-[color:var(--ink-55)]">A$20 a month per club · cancel any time</p>
          </div>

          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="soft-card absolute -left-3 top-8 hidden w-[58%] rotate-[-8deg] p-3 sm:block" aria-hidden>
              <div
                className="aspect-[4/3] rounded-[var(--soft-r-sm)] bg-cover bg-center"
                style={{ backgroundImage: "url(/marketing/hero-4.jpg)", backgroundColor: "var(--tone-support)" }}
              />
              <span className="mt-2 block h-3 w-2/3 rounded-full bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]" />
            </div>
            <div className="soft-card relative ml-auto w-[80%] rotate-[4deg] p-3">
              <div className="grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-1.5">
                {HERO_TILES.map((src, i) => (
                  <span
                    key={src}
                    className={`relative overflow-hidden rounded-[var(--soft-r-sm)] bg-cover bg-center ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                    style={{ backgroundImage: `url(${src})`, backgroundColor: "var(--tone-support)" }}
                  >
                    {/* The count rides the last tile: a fourth cell would spill onto a third row. */}
                    {i === HERO_TILES.length - 1 ? (
                      <>
                        <span className="absolute inset-0 bg-[rgba(25,18,22,0.58)]" aria-hidden />
                        <span className="absolute inset-0 flex items-center justify-center text-[15px] font-extrabold text-white">+38</span>
                      </>
                    ) : null}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="soft-chip">17 Sept</span>
                <span className="text-[14px] font-semibold">Ball 2026</span>
              </div>
            </div>
            <span className="soft-sticker absolute -top-3 right-2 sm:right-6">Members only</span>
          </div>
        </section>

        {/* Ticker: the kinds of nights that end up in an album. */}
        <div className="mt-10 overflow-hidden">
          <div className="-rotate-[1.2deg]">
          <div className="soft-marquee" aria-hidden>
            {[0, 1].map((copy) => (
              <div key={copy} className="soft-marquee-track">
                {TICKER.map((item) => (
                  <span key={item} className="soft-marquee-item">
                    {item}
                  </span>
                ))}
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Rotating banner */}
        <section className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="max-w-[16ch] text-[clamp(28px,4vw,42px)]">
                Made for the nights <span className="soft-word">worth keeping</span>.
              </h2>
              <p className="max-w-[34ch] text-[15px] text-[color:var(--ink-70)]">
                One album per event, in the order they happened, for as long as your club keeps running.
              </p>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="mt-7">
              <PhotoCarousel slides={NIGHTS} />
            </div>
          </Reveal>
        </section>

        {/* Steps */}
        <section className="mx-auto w-full max-w-[1100px] px-4 pb-16 sm:px-6">
          <Reveal>
            <h2 className="text-[clamp(28px,4vw,40px)]">
              Three steps, <span className="soft-word">once</span>.
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 80}>
                <article className="soft-bordered relative h-full overflow-hidden p-6">
                  <span className="soft-numeral" aria-hidden>
                    {step.num}
                  </span>
                  <h3 className="relative max-w-[16ch] text-[22px]">{step.title}</h3>
                  <p className="relative mt-2 text-[15px] leading-[1.5] text-[color:var(--ink-70)]">{step.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Members band: full-bleed accent, outline cards on top. */}
        <section className="soft-cta !rounded-none py-16">
          <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
            <Reveal>
              <span className="soft-chip bg-white/90">For everyone on the list</span>
              <h2 className="mt-4 max-w-[18ch] text-[clamp(28px,4vw,42px)] text-white">
                Members don&rsquo;t need a tutorial.
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {FOR_MEMBERS.map((item, i) => (
                <Reveal key={item.title} delay={i * 80}>
                  <div className="h-full rounded-[var(--soft-r)] border-2 border-white/45 p-6 transition-colors hover:border-white hover:bg-white/10">
                    <h3 className="text-[20px] text-white">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-[1.5] text-white/85">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Promises */}
        <section className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {PROMISES.map((promise, i) => (
              <Reveal key={promise.title} delay={i * 80}>
                <div className="soft-panel flex h-full flex-col items-start gap-3 p-7">
                  <span className="soft-bubble">{i === 0 ? <SearchIcon size={20} /> : i === 1 ? <CameraIcon size={20} /> : <PlayIcon size={20} />}</span>
                  <h3 className="text-[19px]">{promise.title}</h3>
                  <p className="m-0 text-[15px] leading-[1.5] text-[color:var(--ink-70)]">{promise.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto w-full max-w-[1100px] px-4 pb-16 sm:px-6">
          <Reveal>
            <div className="soft-offset flex flex-wrap items-center gap-8 p-8 sm:p-10">
              <div className="min-w-[240px] flex-1">
                <span className="soft-chip">One price</span>
                <h2 className="mt-4 text-[clamp(28px,4vw,40px)]">
                  A$20 a month, <span className="soft-word">per club</span>.
                </h2>
                <p className="mt-3 max-w-[44ch] text-[16px] leading-[1.5] text-[color:var(--ink-70)]">
                  Every member, every album, every event of the year. The committee pays once and hands it over to next
                  year&rsquo;s committee with the photos still in it.
                </p>
              </div>
              <ul className="m-0 min-w-[240px] flex-1 list-none space-y-2 p-0 text-[15px]">
                {["Unlimited members", "Unlimited albums", "Photos and video at full quality", "Roster import from CSV", "Cancel any time"].map(
                  (line) => (
                    <li key={line} className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)] text-[12px] font-bold text-accent-700">
                        ✓
                      </span>
                      {line}
                    </li>
                  ),
                )}
                <li className="pt-3">
                  <Link href="/start" className="soft-btn soft-btn-primary no-underline">
                    Start your club
                  </Link>
                </li>
              </ul>
            </div>
          </Reveal>
        </section>

        {/* Quotes: placeholders until real committees give them. */}
        <section className="mx-auto w-full max-w-[1100px] px-4 pb-16 sm:px-6">
          <Reveal>
            <h2 className="text-[clamp(28px,4vw,40px)]">
              What committees <span className="soft-word">say</span>.
            </h2>
          </Reveal>
          <div className="mt-7 grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {[1, 2, 3].map((n, i) => (
              <Reveal key={n} delay={i * 80}>
                <figure className="soft-dashed m-0 flex h-full flex-col gap-4 p-6">
                  <span className="soft-chip soft-chip-muted self-start text-[12px]">Placeholder</span>
                  <blockquote className="m-0 text-[17px] leading-[1.5] text-[color:var(--ink-70)]">
                    A real quote from a club that uses Klubbies goes here.
                  </blockquote>
                  <figcaption className="mt-auto text-[14px] text-[color:var(--ink-55)]">Club name · role</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-[820px] px-4 pb-16 sm:px-6">
          <Reveal>
            <h2 className="text-[clamp(28px,4vw,40px)]">
              Questions committees <span className="soft-word">ask</span>.
            </h2>
          </Reveal>
          <div className="mt-7 flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 60}>
                <details className="soft-faq soft-card overflow-hidden !p-0">
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-[1100px] px-4 pb-20 sm:px-6">
          <Reveal>
            <div className="soft-cta flex flex-wrap items-center gap-8 p-8 sm:p-12">
              <div className="min-w-[260px] flex-1">
                <h2 className="text-[clamp(28px,4vw,42px)] text-white">Your club&rsquo;s year, in one place.</h2>
                <p className="mt-3 max-w-[44ch] text-[17px] leading-[1.5] text-white/85">
                  Set it up tonight, and Saturday&rsquo;s photos land where everyone can find them.
                </p>
                <Link href="/start" className="soft-btn soft-btn-lg mt-6 bg-white !text-[color:var(--color-accent-700)] no-underline">
                  Start your club
                </Link>
              </div>
              <span className="hidden text-white/60 sm:block" style={{ "--color-surface": "transparent" } as React.CSSProperties}>
                <PhotoStackArt size={160} />
              </span>
            </div>
          </Reveal>
        </section>

        <footer className="mx-auto flex w-full max-w-[1100px] flex-wrap items-center gap-x-6 gap-y-2 px-4 pb-10 text-[14px] text-[color:var(--ink-55)] sm:px-6">
          <span className="soft-wordmark text-[17px] text-ink">klubbies</span>
          <span>Your club&rsquo;s photos, for your club only.</span>
          <span className="flex flex-wrap gap-x-4 gap-y-2 sm:ml-auto">
            <Link href="/how-it-works" className="text-[color:var(--ink-55)] no-underline hover:text-accent">
              How it works
            </Link>
            <Link href="/privacy" className="text-[color:var(--ink-55)] no-underline hover:text-accent">
              Privacy
            </Link>
            <Link href="/terms" className="text-[color:var(--ink-55)] no-underline hover:text-accent">
              Terms
            </Link>
            <Link href="/refunds" className="text-[color:var(--ink-55)] no-underline hover:text-accent">
              Refunds
            </Link>
          </span>
        </footer>
      </div>
    </div>
  );
}
