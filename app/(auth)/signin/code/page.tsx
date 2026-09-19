import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { SIGNIN_COOKIE } from "@/lib/auth/flow";
import { CodeForm } from "./CodeForm";

export const metadata: Metadata = { title: "Enter your code" };

export default async function CodePage(props: PageProps<"/signin/code">) {
  const params = await props.searchParams;
  const isCreate = params.flow === "create";
  const email = (await cookies()).get(SIGNIN_COOKIE)?.value;
  if (!email) redirect(isCreate ? "/start" : "/signin");

  return (
    <AuthShell footer="Codes work once. Nobody from your club or from Klubbies will ever ask you for one.">
      <div className="mt-12 text-center">
        <span
          className="mx-auto flex h-[78px] w-[78px] items-center justify-center rounded-full"
          style={{ background: "#eaf5ea" }}
          aria-hidden
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2f6b36" strokeWidth="2.4" strokeLinecap="round">
            <path d="M3.5 7.5 12 13l8.5-5.5" />
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
          </svg>
        </span>
        <h1 className="mt-4 text-[clamp(24px,7vw,27px)]">Check your uni email.</h1>
        {/* The address is theirs — they just typed it — so spelling it back is
            a help, not a leak. */}
        <p className="mt-2.5 text-[15px] text-[color:var(--color-neutral-700)]">
          We sent an eight digit code to <strong className="font-bold text-ink">{email}</strong>. It works for ten
          minutes.
        </p>
      </div>

      <div className="mt-6">
        <CodeForm restartHref={isCreate ? "/start" : "/signin"} />
      </div>

      <div className="mt-auto rounded-[18px] bg-[color:var(--color-surface)] px-4 py-3.5">
        <span className="block text-[13px] font-bold">Nothing arrived at all?</span>
        <p className="m-0 mt-1.5 text-[13px] text-[color:var(--color-neutral-700)]">
          Two things usually fix it: try your uni email rather than a personal one, and if that&rsquo;s already what you
          used, ask your committee to add you to the member list — it takes them about ten seconds.
        </p>
      </div>
    </AuthShell>
  );
}
