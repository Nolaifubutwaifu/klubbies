import { NextResponse } from "next/server";
import { z } from "zod";
import { landingPath } from "@/lib/auth/landing";
import { LIMITS, hitRateLimit } from "@/lib/auth/rate-limit";
import { clientFingerprint } from "@/lib/auth/request";
import { normaliseEmail } from "@/lib/roster/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().max(254),
  password: z.string().min(1).max(200),
  club: z.string().regex(/^[a-z0-9_]{1,48}$/i).optional(),
});

const GENERIC = "That email and password don't match. Try a code instead.";

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: GENERIC }, { status: 400 });

  const { ip } = await clientFingerprint();
  if (await hitRateLimit(LIMITS.verifyPerIp, ip)) return NextResponse.json({ error: GENERIC }, { status: 429 });

  const email = normaliseEmail(parsed.data.email);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error || !data.user) return NextResponse.json({ error: GENERIC }, { status: 400 });

  // Where to land: the same rule as a code sign-in (lib/auth/landing.ts).
  const { data: memberships } = await createAdminClient()
    .from("memberships")
    .select("status, grace_ends_at, declined_at, clubs!inner(handle, status)")
    .eq("user_id", data.user.id)
    .in("status", ["active", "grace"])
    .eq("clubs.status", "active");

  const now = new Date().toISOString();
  const live = (memberships ?? []).filter((m) => m.status !== "grace" || (m.grace_ends_at !== null && m.grace_ends_at > now));
  const redirectTo = landingPath(
    live.map((m) => ({ handle: m.clubs.handle, declined: m.declined_at !== null })),
    parsed.data.club,
  );
  return NextResponse.json({ ok: true, redirectTo });
}
