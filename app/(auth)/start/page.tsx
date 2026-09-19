import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthHeadline, AuthNote, AuthShell } from "@/components/AuthShell";
import { getSessionUser } from "@/lib/auth/session";
import { SignInForm } from "../signin/SignInForm";

export const metadata: Metadata = { title: "Start a club" };

export default async function StartPage() {
  if (await getSessionUser()) redirect("/admin/new");

  return (
    <AuthShell
      band
      footer={
        <>
          Already in a club?{" "}
          <Link href="/signin" className="font-bold">
            Log in instead
          </Link>
        </>
      }
    >
      <AuthHeadline>
        Your club&rsquo;s nights, <span className="text-accent-700">off</span> the group chat.
      </AuthHeadline>
      <p className="mt-2.5 text-[15px] text-[color:var(--color-neutral-700)]">
        Confirm your email and you&rsquo;re the club&rsquo;s admin. Nothing is charged until you publish your first
        album.
      </p>

      <div className="mt-5">
        <SignInForm flow="create" />
      </div>

      <AuthNote>
        Name the club, drop in the member list you already keep, upload the first event. Five minutes, once.
      </AuthNote>
    </AuthShell>
  );
}
