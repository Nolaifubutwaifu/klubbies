import type { ReactNode } from "react";
import { Brand } from "./ui";

// The two-panel layout from the "Member log in" mockup screen.
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
    <main className="grid flex-1" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
      <section className="flex flex-col justify-between gap-8 bg-neutral-900 px-6 py-8 text-neutral-100">
        <span className="[&_a]:!text-neutral-100">
          <Brand size={18} />
        </span>
        <div>
          <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent-400">{kicker}</div>
          <h2 className="display mt-3 mb-3" style={{ fontSize: "clamp(30px, 4vw, 46px)" }}>
            {headline}
          </h2>
          {detail ? <p className="max-w-[40ch] text-[15px] text-neutral-400">{detail}</p> : null}
        </div>
        <div className="text-[13px] leading-normal text-neutral-500">
          {footnote ?? "Not on the list? Ask your committee to add you — takes them ten seconds."}
        </div>
      </section>
      <section className="flex flex-col justify-center gap-6 px-6 py-8">{children}</section>
    </main>
  );
}
