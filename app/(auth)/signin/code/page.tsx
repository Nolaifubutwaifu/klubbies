import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/AuthSplit";
import { NEUTRAL_MESSAGE, SIGNIN_COOKIE } from "@/lib/auth/flow";
import { CodeForm } from "./CodeForm";

export const metadata: Metadata = { title: "Enter your code" };

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}${"•".repeat(Math.max(1, Math.min(6, local.length - 2)))}@${domain}`;
}

export default async function CodePage(props: PageProps<"/signin/code">) {
  const params = await props.searchParams;
  const isCreate = params.flow === "create";
  const email = (await cookies()).get(SIGNIN_COOKIE)?.value;
  if (!email) redirect(isCreate ? "/start" : "/signin");

  return (
    <AuthSplit
      kicker="Check your inbox"
      headline={maskEmail(email)}
      detail={isCreate ? "We've sent a six digit code. It expires in 10 minutes." : NEUTRAL_MESSAGE}
      footnote="Codes work once. Nobody from your club or from Klubbies will ever ask you for one."
    >
      <div>
        <h1 className="display mb-2 text-[32px]">Enter your code</h1>
        <p className="text-[15px] text-neutral-700">Type the six digits from the email.</p>
      </div>
      <CodeForm restartHref={isCreate ? "/start" : "/signin"} />
    </AuthSplit>
  );
}
