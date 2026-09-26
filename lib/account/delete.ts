import "server-only";
import { stripe, stripeConfigured } from "@/lib/billing/stripe";
import { revokeProfile } from "@/lib/faces/enrol";
import { deleteClubCollection, drainFacePurgeQueue } from "@/lib/faces/purge";
import { BUCKET, logoMarkPath, removeObjects } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Deleting your own account, which Apple requires any app with sign-in to
 * offer inside the app.
 *
 * What goes: the sign-in itself, profile and photo, favourites, face
 * recognition (selfie, faceprints and matches, deleted from AWS before this
 * returns), feed posts and comments, and this person's phones for push.
 *
 * What stays, because it belongs to the club rather than to the person:
 * photos and videos they added to club albums (the uploader is forgotten),
 * and their line on the club's member list, reset to "not signed in yet".
 * The club's access log keeps its entries, as the privacy policy says.
 *
 * A club can't be left without anyone running it. If this person is its only
 * admin and other members have signed in, they must hand it over first. If
 * nobody else has ever signed in, the club closes with the account: its
 * subscription is cancelled and its albums are deleted.
 */

export type ClubRef = { id: string; name: string; handle: string };
export type DeletionPlan = { handOver: ClubRef[]; closes: ClubRef[] };

type MembershipRow = {
  id: string;
  club_id: string;
  role: string | null;
  status: string;
  club_roles: { manage_club: boolean } | null;
  clubs: { id: string; name: string; handle: string } | null;
};

function runsClub(m: Pick<MembershipRow, "role" | "club_roles">): boolean {
  return Boolean(m.club_roles?.manage_club) || m.role === "club_admin";
}

export async function planAccountDeletion(userId: string): Promise<DeletionPlan> {
  const admin = createAdminClient();
  const { data: mine, error } = await admin
    .from("memberships")
    .select("id, club_id, role, status, club_roles(manage_club), clubs!inner(id, name, handle)")
    .eq("user_id", userId)
    .in("status", ["active", "grace"]);
  if (error) throw error;

  const plan: DeletionPlan = { handOver: [], closes: [] };
  for (const m of (mine ?? []) as unknown as MembershipRow[]) {
    if (!runsClub(m) || !m.clubs) continue;
    const { data: others } = await admin
      .from("memberships")
      .select("id, role, club_roles(manage_club)")
      .eq("club_id", m.club_id)
      .eq("status", "active")
      .not("user_id", "is", null)
      .neq("id", m.id);
    const people = (others ?? []) as unknown as Pick<MembershipRow, "role" | "club_roles">[];
    if (people.some(runsClub)) continue; // someone else already runs it
    const club = { id: m.clubs.id, name: m.clubs.name, handle: m.clubs.handle };
    if (people.length > 0) plan.handOver.push(club);
    else plan.closes.push(club);
  }
  return plan;
}

/** Closes a club nobody else has joined: billing, face data, files, rows. */
async function closeClub(clubId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: club } = await admin.from("clubs").select("id, logo_path, stripe_subscription_id").eq("id", clubId).maybeSingle();
  if (!club) return;

  if (club.stripe_subscription_id && stripeConfigured()) {
    try {
      await stripe().subscriptions.cancel(club.stripe_subscription_id);
    } catch (error) {
      // Already cancelled is fine; anything else stops the deletion so a
      // closed club is never still being charged.
      const code = (error as { code?: string }).code;
      if (code !== "resource_missing") throw error;
    }
  }

  const { data: settings } = await admin.from("club_face_settings").select("collection_id").eq("club_id", clubId).maybeSingle();
  if (settings?.collection_id) {
    await deleteClubCollection(settings.collection_id);
    await admin.from("face_purge_queue").delete().eq("collection_id", settings.collection_id);
  }

  const paths: string[] = [];
  const { data: media } = await admin.from("media").select("storage_path, thumb_path, display_path, poster_path").eq("club_id", clubId);
  for (const m of media ?? []) paths.push(...[m.storage_path, m.thumb_path, m.display_path, m.poster_path].filter((p): p is string => Boolean(p)));
  const { data: albums } = await admin.from("albums").select("cover_path").eq("club_id", clubId);
  for (const a of albums ?? []) if (a.cover_path) paths.push(a.cover_path);
  const { data: selfies } = await admin.from("member_face_profiles").select("selfie_path").eq("club_id", clubId);
  for (const s of selfies ?? []) if (s.selfie_path) paths.push(s.selfie_path);
  if (club.logo_path) paths.push(club.logo_path, logoMarkPath(club.logo_path));

  const { error } = await admin.from("clubs").delete().eq("id", clubId);
  if (error) throw error;
  await removeObjects(paths).catch((removeError) => console.error("could not remove files of closed club", clubId, removeError));
}

export type DeletionResult = { ok: true; closed: ClubRef[] } | { ok: false; handOver: ClubRef[] };

export async function deleteAccount(userId: string, email: string): Promise<DeletionResult> {
  const plan = await planAccountDeletion(userId);
  if (plan.handOver.length > 0) return { ok: false, handOver: plan.handOver };

  const admin = createAdminClient();
  for (const club of plan.closes) await closeClub(club.id);

  // Face recognition first, so faceprints leave AWS before anything else goes.
  const { data: profiles } = await admin.from("member_face_profiles").select("id").eq("user_id", userId);
  for (const profile of profiles ?? []) await revokeProfile(profile.id);
  await drainFacePurgeQueue();

  const { data: memberships } = await admin.from("memberships").select("id, status").eq("user_id", userId);
  const membershipIds = (memberships ?? []).map((m) => m.id);
  if (membershipIds.length) {
    await admin.from("post_comments").delete().in("author_membership_id", membershipIds);
    await admin.from("posts").delete().in("author_membership_id", membershipIds);
    // Back to how the club's list looked before this person first signed in.
    await admin
      .from("memberships")
      .update({ claimed_name: null, name_mismatch: false, first_seen_at: null })
      .in("id", membershipIds);
    const liveIds = (memberships ?? []).filter((m) => m.status === "active").map((m) => m.id);
    if (liveIds.length) await admin.from("memberships").update({ status: "pending" }).in("id", liveIds);
  }

  // Profile photos live under avatars/<user id>/.
  const { data: avatars } = await admin.storage.from(BUCKET).list(`avatars/${userId}`, { limit: 100 });
  const avatarPaths = (avatars ?? []).map((object) => `avatars/${userId}/${object.name}`);
  if (avatarPaths.length) await removeObjects(avatarPaths).catch((error) => console.error("could not remove avatar", error));

  await admin.from("pending_sign_ins").delete().eq("email", email.toLowerCase());

  // Cascades to the profile row, favourites, face profiles and push devices;
  // memberships, uploads and logs keep their rows with the person unlinked.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
  return { ok: true, closed: plan.closes };
}
