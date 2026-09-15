import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Club, Membership } from "@/lib/db/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});

export async function requireUser(next?: string) {
  const user = await getSessionUser();
  if (!user) redirect(next ? `/signin?next=${encodeURIComponent(next)}` : "/signin");
  return user;
}

export const getProfile = cache(async () => {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();
  return data;
});

export type ClubContext = {
  club: Club;
  membership: Membership | null;
  isAdmin: boolean;
  userId: string;
};

function membershipIsLive(m: Membership): boolean {
  if (m.status === "active") return true;
  return m.status === "grace" && m.grace_ends_at !== null && new Date(m.grace_ends_at) > new Date();
}

/**
 * Resolves a club by handle for the signed-in user. Returns null when the club
 * does not exist or the user cannot see it; the two cases are deliberately
 * indistinguishable.
 */
export const getClubContext = cache(async (handle: string): Promise<ClubContext | null> => {
  const user = await requireUser(`/c/${handle}`);
  const supabase = await createClient();
  const normalised = handle.toLowerCase();

  const { data: club } = await supabase.from("clubs").select("*").eq("handle", normalised).maybeSingle();
  if (!club) {
    const { data: redirectRow } = await createAdminClient()
      .from("club_handle_redirects")
      .select("clubs(handle)")
      .eq("old_handle", normalised)
      .maybeSingle();
    if (redirectRow?.clubs?.handle) redirect(`/c/${redirectRow.clubs.handle}`);
    return null;
  }

  return resolveContext(club, user.id);
});

async function resolveContext(club: Club, userId: string): Promise<ClubContext | null> {
  const supabase = await createClient();
  const [{ data: membership }, { data: profile }] = await Promise.all([
    supabase.from("memberships").select("*").eq("club_id", club.id).eq("user_id", userId).maybeSingle(),
    supabase.from("users").select("is_super_admin").eq("id", userId).maybeSingle(),
  ]);

  const live = membership && membershipIsLive(membership) ? membership : null;
  const isAdmin = Boolean(profile?.is_super_admin) || (live?.role === "club_admin" && live.status === "active");
  if (!live && !isAdmin) return null;

  return { club, membership: live, isAdmin, userId };
}

/** For route handlers: never redirects, returns null when unauthorised. */
export async function getClubContextById(clubId: string): Promise<ClubContext | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data: club } = await supabase.from("clubs").select("*").eq("id", clubId).maybeSingle();
  if (!club) return null;
  return resolveContext(club, user.id);
}

export async function listMyClubs() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("id, role, status, grace_ends_at, clubs!inner(id, name, handle, organisation, status)")
    .eq("user_id", user.id)
    .in("status", ["active", "grace"])
    .order("created_at", { ascending: true });
  return (data ?? []).filter(
    (m) => m.clubs.status === "active" && (m.status === "active" || (m.grace_ends_at && new Date(m.grace_ends_at) > new Date())),
  );
}
