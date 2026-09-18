import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/ui";
import { getSessionUser } from "@/lib/auth/session";

const FEATURES = [
  {
    num: "01",
    title: "One list, one door",
    body: "Upload the membership CSV your club already keeps, or type names in by hand. Members log in with the name and email on that list, confirmed with a code — if they're not on it, there is no way in.",
  },
  {
    num: "02",
    title: "Photos and video, same place",
    body: "Drop the whole night in: 300 phone photos, the drone clip, the committee headshots. Everything stays in the event album it belongs to, at full quality.",
  },
  {
    num: "03",
    title: "Quiet by default",
    body: "Nothing is public, nothing is indexed, and no link escapes into a group chat. When someone leaves the club, their access winds down on its own.",
  },
];

const HERO_TONES = ["#bab6b6", "#605d5d", "#9b9797", "#444141"];

export default async function ClassicLandingPage() {
  if (await getSessionUser()) redirect("/clubs");

  return (
    <main>
      <header className="flex items-center justify-between gap-4 border-b-2 border-divider px-6 py-4">
        <Brand />
        <nav className="flex items-center gap-2">
          <Link href="/how-it-works" className="hidden text-[14px] font-semibold sm:inline">
            How it works
          </Link>
          <Link href="/signin" className="btn btn-primary">
            Log in
          </Link>
        </nav>
      </header>

      <section className="flex flex-col items-start gap-6 border-b-2 border-divider bg-accent px-6 py-16 text-white">
        <h1
          className="max-w-[18ch] font-heading"
          style={{ fontWeight: 900, fontSize: "clamp(36px, 6vw, 68px)", lineHeight: 0.98, letterSpacing: "-0.035em" }}
        >
          Every photo from Friday, waiting on Saturday.
        </h1>
        <p className="max-w-[46ch] text-[17px] leading-normal text-white/90">
          Private photo and video albums for university clubs. Only the people on your member list get in.
        </p>
        <div className="flex w-full flex-wrap gap-3">
          <Link
            href="/start"
            className="flex-1 bg-white px-8 py-5 text-center font-heading text-[18px] font-black text-accent-700 no-underline hover:bg-accent-100 sm:flex-none"
          >
            Start a club
          </Link>
          <Link
            href="/signin"
            className="flex-1 border-2 border-white px-8 py-5 text-center font-heading text-[18px] font-black text-white no-underline hover:bg-white/10 sm:flex-none"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="grid border-b-2 border-divider" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div className="flex flex-col gap-6 border-divider px-6 py-16 md:border-r-2">
          <span className="kicker">For university clubs</span>
          <h2
            className="font-heading"
            style={{ fontWeight: 900, fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 0.98, letterSpacing: "-0.035em", textWrap: "balance" }}
          >
            Your club&apos;s photos, for your club only.
          </h2>
          <p className="max-w-[46ch] text-[17px] leading-normal text-neutral-800">
            Upload the night&apos;s photos and videos to Klubbies, and everyone on your member list can see them. Nobody
            else can.
          </p>
          <Link href="/how-it-works" className="btn btn-secondary self-start">
            See how it works
          </Link>
        </div>
        <div className="grid min-h-[380px] grid-cols-2 gap-[2px] bg-neutral-800 p-[2px]" aria-hidden>
          {HERO_TONES.map((tone) => (
            <div key={tone} style={{ background: tone, minHeight: 160 }} />
          ))}
        </div>
      </section>

      <section className="grid border-b-2 border-divider" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {[
          ["2 fields", "Name and email. No password to forget."],
          ["CSV in", "Drop the member list you already keep."],
          ["0 links", "Nothing to forward, nothing to leak."],
        ].map(([big, small], i) => (
          <div key={big} className={`p-6 ${i < 2 ? "md:border-r-2 border-divider" : ""}`}>
            <div className="display text-[40px]">{big}</div>
            <div className="mt-2 text-[14px] text-neutral-700">{small}</div>
          </div>
        ))}
      </section>

      <section id="how" className="flex flex-col gap-8 border-b-2 border-divider px-6 py-8">
        {FEATURES.map((f) => (
          <div key={f.num} className="grid items-start gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <div>
              <span className="text-[12px] font-bold tracking-[0.16em] text-accent-700">{f.num}</span>
              <h3 className="mt-2 font-heading text-[26px] font-extrabold tracking-[-0.02em]">{f.title}</h3>
            </div>
            <p className="max-w-[52ch] text-[16px] leading-normal text-neutral-800">{f.body}</p>
          </div>
        ))}
        <Link href="/how-it-works" className="btn btn-secondary self-start">
          The full walkthrough
        </Link>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 text-[13px] text-neutral-700">
        <span>© {new Date().getFullYear()} Klubbies</span>
        <nav className="flex gap-4">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refunds">Refunds</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </main>
  );
}
