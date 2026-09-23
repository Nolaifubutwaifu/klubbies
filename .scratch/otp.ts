import { createClient } from "@supabase/supabase-js";
async function main() {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const email = process.argv[2];
  await db.from("pending_sign_ins").upsert({ email, claimed_name: "Mahi Patel", flow: "member", attempts: 0, expires_at: new Date(Date.now() + 900_000).toISOString() });
  const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email });
  if (error) throw error;
  console.log(data.properties.email_otp);
}
main().catch((e) => { console.error(e); process.exit(1); });
