import type { Metadata } from "next";
import { Brand, PageTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy" };

const SECTIONS: [string, string][] = [
  [
    "What we store",
    "Your club gives us your name and email as part of its member list. When you sign in we store the name you typed, when you first signed in, and a session so you stay signed in for up to 30 days. Clubs upload photos and videos, which we keep exactly as uploaded, plus smaller preview copies.",
  ],
  [
    "Who can see club media",
    "Only people on that club's member list who have confirmed their email with a one-time code. Nothing is public, and every image is served through a link that expires within minutes.",
  ],
  [
    "We log who opens what",
    "Every time a member views or downloads a photo or video we record which item, when, a scrambled version of the network address, and the browser. Club admins can see this log. We tell you because it is a record of your activity and you should know it exists.",
  ],
  [
    "When you leave a club",
    "If a club admin takes you off the member list, you keep access to what was shared before that for 30 days, and we email you about it. After that your access to that club ends.",
  ],
  [
    "Where data lives",
    "Club data is stored in Sydney, Australia. Sign-in emails are delivered by Resend.",
  ],
  [
    "Removing a photo of you",
    "Ask the club's committee to remove it; admins can delete any item. A built-in report button is coming soon.",
  ],
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-6 py-8">
      <Brand />
      <PageTitle kicker="Plain English" title="Privacy at Klubbies" />
      <div className="hr" />
      {SECTIONS.map(([title, body]) => (
        <section key={title} className="flex flex-col gap-2">
          <h2 className="font-heading text-[22px] font-extrabold">{title}</h2>
          <p className="text-[16px] leading-normal text-ink-70">{body}</p>
        </section>
      ))}
    </main>
  );
}
