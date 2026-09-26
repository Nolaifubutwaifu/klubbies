import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/ui";

export const metadata: Metadata = { title: "Account deleted" };

export default function AccountDeletedPage() {
  return (
    <main className="mx-auto flex w-full max-w-[560px] flex-col gap-6 px-6 py-12">
      <Brand />
      <h1 className="display text-[32px]">Your account is deleted.</h1>
      <p className="text-[15px] leading-normal text-ink-70">
        Your sign-in, profile, saved photos, face recognition data and feed posts are gone. Photos you added to club
        albums stay with the club. If you&apos;re still on a club&apos;s member list, you can sign in again any time and
        start fresh.
      </p>
      <Link href="/" className="btn btn-secondary self-start">
        Klubbies home
      </Link>
    </main>
  );
}
