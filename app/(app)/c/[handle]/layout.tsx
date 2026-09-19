import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { MemberSidebar } from "@/components/MemberSidebar";
import { MemberTabBar } from "@/components/MemberTabBar";
import { getClubContext, getProfile, listMyClubs } from "@/lib/auth/session";
import { displayNameFor } from "@/lib/auth/display-name";
import { SIGNED_URL_TTL, signPaths } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { clubToneStyle } from "@/lib/theme";

export default async function ClubLayout(props: LayoutProps<"/c/[handle]">) {
  const { handle } = await props.params;
  const ctx = await getClubContext(handle);
  if (!ctx) notFound();

  const supabase = await createClient();
  const [{ clubs }, profile, displayName, saved, fresh] = await Promise.all([
    listMyClubs(),
    getProfile(),
    displayNameFor(ctx),
    supabase.from("favourites").select("media_id", { count: "exact", head: true }).eq("club_id", ctx.club.id).eq("user_id", ctx.userId),
    // "New since you were here", the same rule the album cards use.
    ctx.membership?.last_seen_at
      ? supabase
          .from("albums")
          .select("id", { count: "exact", head: true })
          .eq("club_id", ctx.club.id)
          .eq("status", "published")
          .gt("published_at", ctx.membership.last_seen_at)
      : Promise.resolve({ count: 0 }),
  ]);

  const avatarUrl = profile?.avatar_url
    ? ((await signPaths(supabase, [profile.avatar_url], SIGNED_URL_TTL.display)).get(profile.avatar_url) ?? null)
    : null;

  return (
    <div className="flex flex-1 flex-col" style={clubToneStyle(ctx.club.accent_colour)}>
      {/* Wide screens get the rail instead of a top bar — the design puts every
          club you're in down the left and nothing above the photos. */}
      <div className="lg:hidden">
        <AppHeader ctx={ctx} />
      </div>
      <div className="flex flex-1 flex-col lg:flex-row lg:items-start lg:gap-6 lg:px-6 lg:pt-5">
        <MemberSidebar
          handle={handle}
          clubs={clubs}
          savedCount={saved.count ?? 0}
          newCount={fresh.count ?? 0}
          person={{ name: displayName, role: ctx.role?.name ?? "Member", avatarUrl }}
        />
        <div className="min-w-0 flex-1">{props.children}</div>
      </div>
      <MemberTabBar handle={handle} />
    </div>
  );
}
