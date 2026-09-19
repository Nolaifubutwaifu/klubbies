import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthHeadline, AuthNote, AuthShell } from "@/components/AuthShell";
import { getSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Log in" };

async function clubPreview(handle: string | undefined) {
  if (!handle || !/^[a-z0-9_]{1,48}$/i.test(handle)) return null;
  try {
    const { data } = await createAdminClient()
      .from("clubs")
      .select("name, organisation, handle")
      .eq("handle", handle.toLowerCase())
      .eq("status", "active")
      .maybeSingle();
    return data;
  } catch (error) {
    console.error("club preview failed", error);
    return null;
  }
}

export default async function SignInPage(props: PageProps<"/signin">) {
  const params = await props.searchParams;
  const clubHandle = typeof params.club === "string" ? params.club : undefined;
  const user = await getSessionUser();
  if (user) redirect(clubHandle ? `/c/${clubHandle}` : "/clubs");

  // Someone following a club's own link already knows which club they want;
  // everyone else gets the line the design leads with.
  const club = await clubPreview(clubHandle);

  return (
    <AuthShell
      band
      footer={
        <>
          Committee instead?{" "}
          <Link href="/start" className="font-bold">
            Set up your club
          </Link>
        </>
      }
    >
      <AuthHeadline>
        {club ? (
          <>
            Every photo from <span className="text-accent-700">{club.name}</span>, waiting for you.
          </>
        ) : (
          <>
            Every photo from <span className="text-accent-700">Friday</span>, waiting on Saturday.
          </>
        )}
      </AuthHeadline>
      <p className="mt-2.5 text-[15px] text-[color:var(--color-neutral-700)]">
        Sign in with the email your club has on its list. No password to forget.
      </p>

      <div className="mt-5">
        <SignInForm flow="member" />
      </div>

      <AuthNote>
        Klubbies checks that email against your club&rsquo;s member list. If it&rsquo;s there, you&rsquo;re in.
      </AuthNote>
    </AuthShell>
  );
}
