import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/ui";

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
    <main className="flex flex-col">
      <header className="flex items-center justify-between gap-4 border-b-2 border-divider px-6 py-4">
        <Brand />
        <nav className="flex items-center gap-2">
          <Link href="/start" className="btn btn-secondary">
            Start a club
          </Link>
          <Link href="/signin" className="btn btn-primary">
            Member log in
          </Link>
        </nav>
      </header>

      <section className="border-b-2 border-divider px-6 py-12">
        <span className="kicker">How it works</span>
        <h1
          className="mt-3 max-w-[20ch] font-heading"
          style={{ fontWeight: 900, fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1, letterSpacing: "-0.035em" }}
        >
          One member list. One private place for the photos.
        </h1>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-normal text-neutral-800">
          Klubbies replaces the shared drive folder that half the committee can edit and anyone can forward. Here is the
          whole thing, start to finish.
        </p>
      </section>

      {STEPS.map((step) => (
        <section key={step.num} className="grid items-start gap-6 border-b-2 border-divider px-6 py-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <div>
            <span className="text-[12px] font-bold tracking-[0.16em] text-accent-700">{step.num}</span>
            <h2 className="mt-2 font-heading text-[26px] font-extrabold tracking-[-0.02em]">{step.title}</h2>
          </div>
          <p className="max-w-[56ch] text-[16px] leading-normal text-neutral-800">{step.body}</p>
        </section>
      ))}

      <section className="border-b-2 border-divider px-6 py-8">
        <h2 className="font-heading text-[28px] font-black tracking-[-0.02em]">Questions we get</h2>
        <dl className="mt-4 flex flex-col gap-4">
          {FAQ.map(([q, a]) => (
            <div key={q} className="border-t border-divider pt-4">
              <dt className="font-heading text-[17px] font-extrabold">{q}</dt>
              <dd className="mt-1 max-w-[60ch] text-[15px] leading-normal text-neutral-800">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col items-start gap-6 bg-accent px-6 py-[72px] text-white">
        <h2 className="max-w-[18ch] font-heading" style={{ fontWeight: 900, fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1, letterSpacing: "-0.035em" }}>
          Ready when your next event is.
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/start" className="bg-white px-[22px] py-[14px] text-[16px] font-bold text-accent-700 no-underline hover:bg-accent-100">
            Start a club
          </Link>
          <Link href="/signin" className="border-2 border-white px-[22px] py-[14px] text-[16px] font-bold text-white no-underline">
            I&apos;m a member
          </Link>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 text-[13px] text-neutral-700">
        <Link href="/">← Back home</Link>
        <nav className="flex gap-4">
          <Link href="/terms">Terms</Link>
          <Link href="/refunds">Refunds</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </main>
  );
}
