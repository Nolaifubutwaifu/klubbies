import Link from "next/link";
import { ArrowRightIcon } from "@/components/soft/icons";
import { displayNameFor } from "@/lib/auth/display-name";
import type { ClubContext } from "@/lib/auth/session";
import { SIGNED_URL_TTL, signPaths } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Prototype header for the soft theme: floating pill bar, round club badge. */
export async function SoftHeader({ ctx }: { ctx: ClubContext }) {
  const { club, perms } = ctx;
  const displayName = await displayNameFor(ctx);

  let logoUrl: string | null = null;
  if (club.logo_path) {
    const supabase = await createClient();
    logoUrl = (await signPaths(supabase, [club.logo_path], SIGNED_URL_TTL.display)).get(club.logo_path) ?? null;
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pt-5 sm:px-6">
      <header className="soft-card flex flex-wrap items-center gap-3 !rounded-full py-2 pl-3 pr-3 sm:pr-4">
        <Link href="/clubs" className="flex items-center gap-2.5 no-underline">
          <span
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-[14px] font-extrabold text-white"
            style={{ background: "linear-gradient(135deg, var(--color-accent-500), var(--color-accent-700))" }}
            aria-hidden
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(club.name)
            )}
          </span>
          <span className="soft-display text-[17px] text-ink">{club.name}</span>
        </Link>

        <nav className="flex items-center gap-1 sm:ml-2">
          <Link href={`/preview/${club.handle}`} className="soft-chip no-underline">
            Events
          </Link>
          <Link href={`/c/${club.handle}/feed`} className="soft-chip soft-chip-muted no-underline">
            Club feed
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href={`/c/${club.handle}`} className="soft-btn soft-btn-ghost !min-h-[38px] !px-3 !text-[13px] no-underline">
            Old design
            <ArrowRightIcon size={15} />
          </Link>
          <Link
            href="/account"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[13px] font-extrabold text-accent-700 no-underline"
            title={displayName}
          >
            {initials(displayName) || "?"}
          </Link>
          {perms.manage_club ? (
            <Link href={`/admin/${club.handle}`} className="soft-btn soft-btn-ghost !min-h-[38px] !px-3 !text-[13px] no-underline">
              Admin
            </Link>
          ) : null}
        </div>
      </header>
    </div>
  );
}
