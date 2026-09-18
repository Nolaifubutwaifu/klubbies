import Link from "next/link";
import type { ReactNode } from "react";
import { SoftBackdrop } from "@/components/soft/SoftBackdrop";

/**
 * Two-panel auth layout in the soft theme: the accent panel carries the
 * message, the card carries the form. Wrapping in .theme-soft is what restyles
 * the form controls each page passes in as children.
 */
export function AuthSplit({
  kicker,
  headline,
  detail,
  footnote,
  children,
}: {
  kicker: string;
  headline: string;
  detail?: string | null;
  footnote?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="theme-soft relative flex flex-1 flex-col">
      <SoftBackdrop />
      <main className="relative z-10 mx-auto grid w-full max-w-[1000px] flex-1 items-center gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
        <section className="soft-cta flex flex-col gap-6 p-8 sm:p-10">
          <Link href="/" className="soft-wordmark text-[20px] text-white no-underline">
            klubbies
          </Link>
          <div>
            <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-white/75">{kicker}</span>
            <h1 className="mt-3 text-[clamp(28px,4vw,42px)] text-white">{headline}</h1>
            {detail ? <p className="mt-3 max-w-[40ch] text-[16px] leading-[1.5] text-white/85">{detail}</p> : null}
          </div>
          <p className="m-0 text-[14px] leading-[1.5] text-white/70">
            {footnote ?? "Not on the list? Ask your committee to add you — takes them ten seconds."}
          </p>
        </section>
        <section className="soft-card flex flex-col justify-center gap-6 p-7 sm:p-9">{children}</section>
      </main>
    </div>
  );
}
