import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/AuthSplit";
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

  const club = await clubPreview(clubHandle);

  return (
    <AuthSplit
      kicker={club ? "You're joining" : "Members only"}
      headline={club?.name ?? "Your club's photos"}
      detail={club?.organisation ?? "Every event album your committee has shared with you, in one private place."}
    >
      <div>
        <h1 className="display mb-2 text-[32px]">Log in</h1>
        <p className="text-[15px] text-neutral-700">
          Use the name and email your club has on file. Admins sign in here too.
        </p>
      </div>
      <SignInForm flow="member" />
      <p className="text-[13px] text-neutral-600">
        Running a club?{" "}
        <Link href="/start" className="font-semibold">
          Start one here
        </Link>
      </p>
    </AuthSplit>
  );
}
