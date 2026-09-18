import Link from "next/link";
import type React from "react";
import { SoftBackdrop } from "@/components/soft/SoftBackdrop";
import { CameraIcon, PlayIcon, SearchIcon } from "@/components/soft/icons";
import { PhotoStackArt, SquiggleUnderline } from "@/components/soft/illustrations";

const STEPS = [
  {
    num: "01",
    title: "Bring your member list",
    body: "Upload the CSV your club already keeps, or type names in. That list is the door.",
  },
  {
    num: "02",
    title: "Drop the whole night in",
    body: "300 phone photos, the drone clip, the committee headshots. Full quality, one album.",
  },
  {
    num: "03",
    title: "Everyone finds themselves",
    body: "Members log in with their own email and scroll the night back. Nobody else can.",
  },
];

const PROMISES = [
  { title: "Nothing is public", body: "No indexing, no shareable link that escapes into a group chat." },
  { title: "Photos, not compression", body: "Videos and full-size images sit in the event album they belong to." },
  { title: "Leaving is handled", body: "When someone leaves the club, their access winds down on its own." },
];

/** Marketing home in the soft theme. Structure: hero → how → promises → CTA. */
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

        {/* Hero: one message, one primary action. */}
        <section className="mx-auto grid w-full max-w-[1100px] items-center gap-10 px-4 pb-4 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-16">
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

          {/* Album stack: the same shapes the app uses, so the promise is visible. */}
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="soft-card absolute -left-3 top-8 hidden w-[58%] rotate-[-8deg] p-3 sm:block" aria-hidden>
              <div className="aspect-[4/3] rounded-[var(--soft-r-sm)] bg-[linear-gradient(140deg,var(--tone-support),color-mix(in_srgb,var(--color-accent)_18%,white))]" />
              <span className="mt-2 block h-3 w-2/3 rounded-full bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]" />
            </div>
            <div className="soft-card relative ml-auto w-[80%] rotate-[4deg] p-3">
              <div className="grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-1.5">
                <span className="col-span-2 row-span-2 rounded-[var(--soft-r-sm)] bg-[linear-gradient(150deg,color-mix(in_srgb,var(--color-accent)_40%,white),var(--tone-support))]" />
                <span className="rounded-[var(--soft-r-sm)] bg-[linear-gradient(150deg,var(--tone-support),color-mix(in_srgb,var(--color-accent)_28%,white))]" />
                <span className="flex items-center justify-center rounded-[var(--soft-r-sm)] bg-[color-mix(in_srgb,var(--color-text)_72%,transparent)] text-[15px] font-extrabold text-white">
                  +38
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="soft-chip">17 Sept</span>
                <span className="text-[14px] font-semibold">Ball 2026</span>
              </div>
            </div>
            <span className="soft-sticker absolute -top-3 right-2 sm:right-6">Members only</span>
          </div>
        </section>

        {/* How it works: numerals carry the rhythm, opacity keeps them quiet. */}
        <section className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
          <h2 className="text-[clamp(28px,4vw,40px)]">
            Three steps, <span className="soft-word">once</span>.
          </h2>
          <div className="mt-8 grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {STEPS.map((step) => (
              <article key={step.num} className="soft-card relative overflow-hidden p-6">
                <span className="soft-numeral" aria-hidden>
                  {step.num}
                </span>
                <h3 className="relative max-w-[16ch] text-[22px]">{step.title}</h3>
                <p className="relative mt-2 text-[15px] leading-[1.5] text-[color:var(--ink-70)]">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Promises: circle-bubble icons rhyme with the avatars and blobs. */}
        <section className="mx-auto w-full max-w-[1100px] px-4 pb-16 sm:px-6">
          <div className="soft-panel grid gap-8 p-8 sm:p-10" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {PROMISES.map((promise, i) => (
              <div key={promise.title} className="flex flex-col items-start gap-3">
                <span className="soft-bubble">{i === 0 ? <SearchIcon size={20} /> : i === 1 ? <CameraIcon size={20} /> : <PlayIcon size={20} />}</span>
                <h3 className="text-[19px]">{promise.title}</h3>
                <p className="m-0 text-[15px] leading-[1.5] text-[color:var(--ink-70)]">{promise.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA: the 10% colour, used once, at full strength. */}
        <section className="mx-auto w-full max-w-[1100px] px-4 pb-20 sm:px-6">
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
