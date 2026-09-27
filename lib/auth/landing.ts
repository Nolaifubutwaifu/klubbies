/**
 * Where someone lands after signing in. One rule for every route in (code,
 * password, sign up), so the first screen doesn't depend on how they typed
 * their way in:
 *
 * - came through a club's own link and is on its list: that club
 * - in exactly one club: that club (an invitation not yet accepted shows its
 *   Accept card there, decision 29)
 * - otherwise: "Your clubs"
 *
 * Invitations the person said "Not me" to don't count.
 */
export type LandingMembership = { handle: string; declined: boolean };

export function landingPath(memberships: LandingMembership[], wantedHandle?: string | null): string {
  const open = memberships.filter((m) => !m.declined);
  const wanted = wantedHandle?.toLowerCase();
  if (wanted && open.some((m) => m.handle === wanted)) return `/c/${wanted}`;
  const handles = [...new Set(open.map((m) => m.handle))];
  if (handles.length === 1) return `/c/${handles[0]}`;
  return "/clubs";
}
