import "server-only";
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is not set"),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(3).default("Klubbies <onboarding@resend.dev>"),
  APP_URL: z.url(),
  SIGNED_URL_SECRET: z.string().min(16),
  CRON_SECRET: z.string().min(16),
  // Test-only: shortens every signed URL so expiry can be exercised quickly.
  SIGNED_URL_TTL_OVERRIDE_SECONDS: z.coerce.number().int().positive().optional(),
});

export type ServerEnv = z.infer<typeof schema>;

export function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  cached ??= schema.parse(process.env);
  return cached;
}
