import Link from "next/link";
import type { ReactNode } from "react";
import { Brand, PageTitle } from "./ui";

export function supportEmail(): string | null {
  const value = process.env.SUPPORT_EMAIL?.trim();
  return value ? value : null;
}

export function ContactLine() {
  const email = supportEmail();
  return email ? (
    <>
      email <a href={`mailto:${email}`}>{email}</a>
    </>
  ) : (
    <>reply to your Stripe receipt</>
  );
}

export function LegalPage({
  kicker,
  title,
  updated,
  sections,
}: {
  kicker: string;
  title: string;
  updated: string;
  sections: { title: string; body: ReactNode }[];
}) {
  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-6 py-8">
      <Brand />
      <PageTitle kicker={kicker} title={title}>
        Last updated {updated}
      </PageTitle>
      <div className="hr" />
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="font-heading text-[22px] font-extrabold">{section.title}</h2>
          <div className="flex flex-col gap-3 text-[16px] leading-normal text-ink-70">{section.body}</div>
        </section>
      ))}
      <nav className="flex flex-wrap gap-4 border-t-2 border-divider pt-4 text-[13px]">
        <Link href="/terms">Terms</Link>
        <Link href="/refunds">Refunds and cancellation</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
    </main>
  );
}
