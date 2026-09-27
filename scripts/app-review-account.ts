/**
 * The account Apple's reviewers sign in with: a plain member of the demo club
 * UniMelb FC (demo_umfc), with a password, invitation accepted and the face
 * notice acknowledged, so the first screen is the club's albums.
 *
 *   pnpm tsx --env-file=.env.local scripts/app-review-account.ts
 *
 * Reads APP_REVIEW_EMAIL and APP_REVIEW_PASSWORD from .env.local. Safe to
 * re-run: it resets the password and repairs the membership. Run the demo
 * script first if the demo club doesn't exist.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/db/types";
import { MEMBER_NOTICE_VERSION } from "../lib/faces/constants";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.APP_REVIEW_EMAIL?.trim().toLowerCase();
const password = process.env.APP_REVIEW_PASSWORD;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
if (!email || !password || password.length < 12) throw new Error("Set APP_REVIEW_EMAIL and APP_REVIEW_PASSWORD (12+ characters) in .env.local");

const db = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const HANDLE = "demo_umfc";
const NAME = "Jordan Lee";

async function findUserId(address: string): Promise<string | null> {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === address);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function main() {
  const { data: club } = await db.from("clubs").select("id, name").eq("handle", HANDLE).maybeSingle();
  if (!club) throw new Error(`No club ${HANDLE}. Run scripts/demo.ts first.`);

  let userId = await findUserId(email!);
  if (userId) {
    const { error } = await db.auth.admin.updateUserById(userId, { password, email_confirm: true });
    if (error) throw error;
  } else {
    const { data, error } = await db.auth.admin.createUser({ email: email!, password, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("createUser returned nothing");
    userId = data.user.id;
  }
  await db.from("users").update({ display_name: NAME }).eq("id", userId);

  const { data: memberRole } = await db.from("club_roles").select("id").eq("club_id", club.id).eq("key", "member").maybeSingle();
  const now = new Date().toISOString();
  const { error } = await db.from("memberships").upsert(
    {
      club_id: club.id,
      roster_name: NAME,
      roster_email: email!,
      claimed_name: NAME,
      role: "club_member",
      role_id: memberRole?.id ?? null,
      status: "active",
      user_id: userId,
      accepted_at: now,
      declined_at: null,
      first_seen_at: now,
      face_notice_ack_at: now,
      face_notice_version: MEMBER_NOTICE_VERSION,
    },
    { onConflict: "club_id,roster_email" },
  );
  if (error) throw error;
  console.log(`${email} is a member of ${club.name} and can sign in with "Use a password instead".`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
