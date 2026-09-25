import Link from "next/link";
import { ClubSwitcher } from "@/components/ClubSwitcher";
import { ViewToggle } from "@/components/ViewToggle";
import { currentArea } from "@/lib/area";
import { displayNameFor } from "@/lib/auth/display-name";
import { listMyClubs, type ClubContext } from "@/lib/auth/session";
import { canWrite } from "@/lib/billing/status";
import { formatLongDate } from "@/lib/format";
import { signLogoMarks } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export async function AppHeader({
  ctx,
  forceAdmin = false,
  photosOfYou = false,
}: {
  ctx: ClubContext;
  forceAdmin?: boolean;
  /** Face recognition is on here and this member has enrolled. */
  photosOfYou?: boolean;
}) {
  const [{ clubs, invites }, displayName, area] = await Promise.all([
    listMyClubs(),
    displayNameFor(ctx),
    currentArea(),
  ]);
  const { club, membership, perms } = ctx;
  const adminArea = (forceAdmin || area === "admin") && perms.manage_club;

  // Every logo the header can show, in one call: the current club's, plus
  // each club in the switcher list. The dropdown used to fall back to
  // initials even for clubs whose logo was already uploaded.
  const signed = await signLogoMarks(await createClient(), [club.logo_path, ...clubs.map((c) => c.logoPath)]);
  const logoUrl = club.logo_path ? (signed.get(club.logo_path) ?? null) : null;
  const clubLogoUrls: Record<string, string> = {};
  for (const c of clubs) {
    const url = c.logoPath ? signed.get(c.logoPath) : null;
    if (url) clubLogoUrls[c.clubId] = url;
  }

  const memberLinks = [
    { href: `/c/${club.handle}`, label: "Events" },
    ...(photosOfYou ? [{ href: `/c/${club.handle}/me`, label: "Photos of you" }] : []),
    { href: `/c/${club.handle}/saved`, label: "Saved" },
    { href: `/c/${club.handle}/feed`, label: "Club feed" },
  ];

  // The switcher is the one menu a phone always has, so the two places that
  // otherwise only live in the desktop rail get a door here too.
  const shortcuts = [
    ...(photosOfYou ? [{ href: `/c/${club.handle}/me`, label: "Photos of you" }] : []),
    ...(perms.manage_club
      ? [forceAdmin ? { href: `/c/${club.handle}`, label: "Member view" } : { href: `/admin/${club.handle}`, label: "Admin view" }]
      : []),
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-5 sm:px-6">
        {/* On a phone this is one row: the club you're in, and you. Everything
            else lives in the tab bar or behind the avatar. */}
        <header className="soft-card flex items-center gap-2 !rounded-[28px] px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
          <Link href="/clubs" className="soft-wordmark hidden text-[19px] text-ink no-underline sm:block">
            klubbies
          </Link>
          <ClubSwitcher
            current={{ name: club.name, handle: club.handle, accentColour: club.accent_colour }}
            clubs={clubs}
            invites={invites}
            logoUrl={logoUrl}
            clubLogoUrls={clubLogoUrls}
            shortcuts={shortcuts}
          />
          {adminArea ? <span className="soft-chip hidden text-[11px] sm:inline-flex">Admin view</span> : null}

          <div className="ml-auto flex items-center gap-2">
            {perms.manage_club ? (
              <span className="hidden sm:block">
                <ViewToggle area={adminArea ? "admin" : "member"} handle={club.handle} />
              </span>
            ) : (
              <span className="soft-chip soft-chip-muted hidden text-[11px] sm:inline-flex">{ctx.role?.name ?? "Member"}</span>
            )}
            <form action="/api/auth/signout" method="post" className="hidden sm:block">
              <button type="submit" className="soft-btn soft-btn-tonal !min-h-[38px] !px-4 !text-[13px]">
                Sign out
              </button>
            </form>
            <Link
              href="/account"
              aria-label={`Your profile, ${displayName}`}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[color:var(--tone-support)] text-[13px] font-extrabold text-[color:var(--tone-support-ink)] no-underline sm:hidden"
            >
              {displayName
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase() || "?"}
            </Link>
          </div>
        </header>
      </div>

      {/* Members get their sections here on a wide screen; on a phone the
          tab bar at the bottom of the window carries them instead. */}
      {adminArea ? null : (
        <nav className="mx-auto hidden w-full max-w-[1320px] flex-wrap gap-2 px-4 pb-2 pt-3 sm:flex sm:px-6">
          {memberLinks.map((link) => (
            <Link key={link.href} href={link.href} className="soft-chip soft-chip-muted no-underline">
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {adminArea && !canWrite(club.billing_status) ? (
        <div className="mx-auto mt-3 flex w-full max-w-[1320px] flex-wrap items-center justify-between gap-3 rounded-[var(--soft-r)] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))] px-5 py-4 text-[14px] text-accent-800 sm:mx-auto">
          <span>This club isn&apos;t active yet. Adding members and uploading unlock after payment.</span>
          <Link href={`/admin/${club.handle}/billing`} className="btn btn-primary">
            Activate club
          </Link>
        </div>
      ) : null}

      {membership?.status === "grace" && membership.grace_ends_at ? (
        <div className="mx-auto mt-3 flex w-full max-w-[1320px] flex-wrap items-center justify-between gap-3 rounded-[var(--soft-r)] bg-[color-mix(in_srgb,var(--color-accent-2)_16%,var(--color-surface))] px-5 py-4 text-[14px] text-accent-2-800">
          <span>
            <strong>Your access to {club.name} ends on {formatLongDate(membership.grace_ends_at)}.</strong> You can still
            open and download everything shared before you left the member list.
          </span>
        </div>
      ) : null}
    </>
  );
}
