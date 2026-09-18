import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { ClubSwitcher } from "@/components/ClubSwitcher";
import { ViewToggle } from "@/components/ViewToggle";
import { currentArea } from "@/lib/area";
import { displayNameFor } from "@/lib/auth/display-name";
import { listMyClubs, type ClubContext } from "@/lib/auth/session";
import { canWrite } from "@/lib/billing/status";
import { formatLongDate } from "@/lib/format";
import { SIGNED_URL_TTL, signPaths } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export async function AppHeader({ ctx, forceAdmin = false }: { ctx: ClubContext; forceAdmin?: boolean }) {
  const [{ clubs, invites }, displayName, area] = await Promise.all([
    listMyClubs(),
    displayNameFor(ctx),
    currentArea(),
  ]);
  const { club, membership, perms } = ctx;
  const adminArea = (forceAdmin || area === "admin") && perms.manage_club;

  let logoUrl: string | null = null;
  if (club.logo_path) {
    const supabase = await createClient();
    logoUrl = (await signPaths(supabase, [club.logo_path], SIGNED_URL_TTL.display)).get(club.logo_path) ?? null;
  }

  const memberLinks = [
    { href: `/c/${club.handle}`, label: "Events" },
    { href: `/c/${club.handle}/saved`, label: "Saved" },
    { href: `/c/${club.handle}/feed`, label: "Club feed" },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-[1100px] px-4 pt-5 sm:px-6">
        <header className="soft-card flex flex-wrap items-center gap-3 !rounded-[28px] px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-3">
          <Link href="/clubs" className="soft-wordmark text-[19px] text-ink no-underline">
            klubbies
          </Link>
          <ClubSwitcher current={{ name: club.name, handle: club.handle }} clubs={clubs} invites={invites} logoUrl={logoUrl} />
          {adminArea ? <span className="soft-chip text-[11px]">Admin view</span> : null}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
          <Link href="/account" className="text-[13px] text-[color:var(--ink-70)] no-underline">
            {displayName}
          </Link>
          {perms.manage_club ? (
            <ViewToggle area={adminArea ? "admin" : "member"} handle={club.handle} />
          ) : (
            <span className="soft-chip soft-chip-muted text-[11px]">{ctx.role?.name ?? "Member"}</span>
          )}
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost !min-h-[38px] !px-4 text-[13px]">
              Sign out
            </button>
          </form>
          </div>
        </header>
      </div>

      {adminArea ? (
        <AdminNav handle={club.handle} />
      ) : (
        <nav className="mx-auto flex w-full max-w-[1100px] flex-wrap gap-2 px-4 pb-2 pt-3 sm:px-6">
          {memberLinks.map((link) => (
            <Link key={link.href} href={link.href} className="soft-chip soft-chip-muted no-underline">
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {adminArea && !canWrite(club.billing_status) ? (
        <div className="mx-auto mt-3 flex w-full max-w-[1100px] flex-wrap items-center justify-between gap-3 rounded-[var(--soft-r)] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))] px-5 py-4 text-[14px] text-accent-800 sm:mx-auto">
          <span>This club isn&apos;t active yet. Adding members and uploading unlock after payment.</span>
          <Link href={`/admin/${club.handle}/billing`} className="btn btn-primary">
            Activate club
          </Link>
        </div>
      ) : null}

      {membership?.status === "grace" && membership.grace_ends_at ? (
        <div className="mx-auto mt-3 flex w-full max-w-[1100px] flex-wrap items-center justify-between gap-3 rounded-[var(--soft-r)] bg-[color-mix(in_srgb,var(--color-accent-2)_16%,var(--color-surface))] px-5 py-4 text-[14px] text-accent-2-800">
          <span>
            <strong>Your access to {club.name} ends on {formatLongDate(membership.grace_ends_at)}.</strong> You can still
            open and download everything shared before you left the member list.
          </span>
        </div>
      ) : null}
    </>
  );
}
