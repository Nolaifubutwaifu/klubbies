import type { Metadata } from "next";
import Link from "next/link";
import { SquiggleUnderline } from "@/components/soft/illustrations";

export const metadata: Metadata = { title: "How Klubbies works" };

const STEPS: { num: string; title: string; body: string }[] = [
  {
    num: "01",
    title: "Start the club and add your list",
    body: "Name the club and you get a fixed web address to share. Drop in the membership CSV or Excel file your club already keeps, or type people in by hand. Klubbies reads messy files: it finds the header row, lets you map the name and email columns, and shows you exactly what will be added before anything happens.",
  },
  {
    num: "02",
    title: "Members sign in with a code",
    body: "A member types their name and email. If the email is on the list, we send a short code to that address. No password to forget, no link that works for whoever is forwarded it. Members can set a password later if they sign in often.",
  },
  {
    num: "03",
    title: "Upload the whole night",
    body: "Drag in 300 phone photos, the drone clip and the committee headshots. Originals are kept at full quality, and smaller copies are made for fast browsing. Uploads keep going while you use the rest of the app, and pick up again if your connection drops.",
  },
  {
    num: "04",
    title: "Everyone sees their club, nobody else does",
    body: "Albums are private to the people on that club's member list. Every photo is served through a link that expires within minutes, so nothing escapes into a group chat. Members can download originals when you allow it.",
  },
  {
    num: "05",
    title: "People join and leave",
    body: "Give roles like Committee or Treasurer, and decide what each role can do: add members, make albums, upload photos, post to the feed. When someone leaves, they keep access to earlier albums for 30 days, get an email about it, and then their access ends by itself.",
  },
];

const FAQ: [string, string][] = [
  ["What does it cost?", "A$20 per club per month. One price, unlimited members, unlimited photos and videos."],
  ["Who can see our photos?", "Only people on your member list who have confirmed their email. Nothing is public and nothing is indexed by search engines."],
  ["Can members add their own photos?", "Yes, per album. Turn on \"Any member\" for an album and everyone's phone photos land in the same place."],
  ["Where is our data stored?", "In Sydney, Australia."],
  ["Can we leave?", "Cancel any time. You keep access until the end of the month you paid for, and we give 30 days' notice before deleting anything."],
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1000px] flex-col px-4 sm:px-6">
      <header className="soft-card mt-5 flex items-center gap-3 !rounded-full py-2 pl-5 pr-3">
        <Link href="/" className="soft-wordmark text-[22px] text-ink no-underline">
          klubbies
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <Link href="/start" className="soft-btn soft-btn-tonal !min-h-[40px] !px-4 !text-[14px] no-underline">
            Start a club
          </Link>
          <Link href="/signin" className="soft-btn soft-btn-primary !min-h-[40px] !px-5 !text-[14px] no-underline">
            Log in
          </Link>
        </nav>
      </header>

      <section className="pb-6 pt-12">
        <h1 className="max-w-[20ch] text-[clamp(34px,5vw,58px)] leading-[1.03]">
          One member list. One <span className="soft-word">private</span> place for the photos.
        </h1>
        <SquiggleUnderline className="soft-squiggle mt-1 !w-[min(240px,55%)]" />
        <p className="mt-5 max-w-[60ch] text-[17px] leading-[1.5] text-[color:var(--ink-70)]">
          Klubbies replaces the shared drive folder that half the committee can edit and anyone can forward. Here is the
          whole thing, start to finish.
        </p>
      </section>

      {STEPS.map((step) => (
        <section
          key={step.num}
          className="soft-card mt-4 grid items-start gap-6 p-6 sm:p-7"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
        >
          <div>
            <span className="soft-chip">{step.num}</span>
            <h2 className="mt-3 text-[24px]">{step.title}</h2>
          </div>
          <p className="max-w-[56ch] text-[16px] leading-[1.55] text-[color:var(--ink-70)]">{step.body}</p>
        </section>
      ))}

      <section className="pt-12">
        <h2 className="text-[clamp(26px,4vw,36px)]">
          Questions we <span className="soft-word">get</span>.
        </h2>
        <dl className="mt-6 flex flex-col gap-3">
          {FAQ.map(([q, a]) => (
            <div key={q} className="soft-card p-6">
              <dt className="soft-display text-[18px]">{q}</dt>
              <dd className="mt-2 max-w-[60ch] text-[15px] leading-[1.55] text-[color:var(--ink-70)]">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="soft-cta mt-14 flex flex-col items-start gap-6 p-8 sm:p-12">
        <h2 className="max-w-[18ch] text-[clamp(28px,4.5vw,46px)] text-white">Ready when your next event is.</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/start" className="soft-btn soft-btn-lg bg-white !text-[color:var(--color-accent-700)] no-underline">
            Start a club
          </Link>
          <Link href="/signin" className="soft-btn soft-btn-lg bg-white/15 !text-white no-underline">
            Log in
          </Link>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 py-8 text-[13px] text-[color:var(--ink-55)]">
        <Link href="/" className="text-[color:var(--ink-55)] no-underline hover:text-accent">
          &larr; Back home
        </Link>
        <nav className="flex gap-4">
          <Link href="/terms" className="text-[color:var(--ink-55)] no-underline hover:text-accent">
            Terms
          </Link>
          <Link href="/refunds" className="text-[color:var(--ink-55)] no-underline hover:text-accent">
            Refunds
          </Link>
          <Link href="/privacy" className="text-[color:var(--ink-55)] no-underline hover:text-accent">
            Privacy
          </Link>
        </nav>
      </footer>
    </main>
  );
}
