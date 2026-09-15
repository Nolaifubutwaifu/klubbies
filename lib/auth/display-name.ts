import "server-only";
import type { ClubContext } from "./session";
import { getProfile } from "./session";

export async function displayNameFor(ctx: ClubContext): Promise<string> {
  const profile = await getProfile();
  return ctx.membership?.claimed_name ?? profile?.display_name ?? ctx.membership?.roster_name ?? profile?.email ?? "";
}
