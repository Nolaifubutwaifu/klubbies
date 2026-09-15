import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/AuthSplit";
import { getSessionUser } from "@/lib/auth/session";
import { SignInForm } from "../signin/SignInForm";

export const metadata: Metadata = { title: "Start a club" };

export default async function StartPage() {
  if (await getSessionUser()) redirect("/admin/new");

  return (
    <AuthSplit
      kicker="For committees"
      headline="Start a club in three steps"
      detail="Name your club, drop in the member list you already keep, then upload the first event album."
      footnote="Only people on your member list will ever see what you upload."
    >
      <div>
        <h1 className="display mb-2 text-[32px]">Start a club</h1>
        <p className="text-[15px] text-neutral-700">First, confirm your email. You&apos;ll be the club&apos;s admin.</p>
      </div>
      <SignInForm flow="create" />
    </AuthSplit>
  );
}
