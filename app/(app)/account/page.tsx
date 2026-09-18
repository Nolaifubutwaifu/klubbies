import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/ui";
import { InviteCard } from "@/components/InviteCard";
import { getProfile, getSessionUser, listMyClubs, requireUser } from "@/lib/auth/session";
import { formatLongDate } from "@/lib/format";
import { SIGNED_URL_TTL, signPaths } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { AvatarUploader, NotificationToggles, PasswordForm, ProfileForm } from "./AccountForms";

export const metadata: Metadata = { title: "Your profile" };

export default async function AccountPage() {
  await requireUser("/account");
  const [profile, user, { clubs, invites }] = await Promise.all([getProfile(), getSessionUser(), listMyClubs()]);
  if (!profile || !user) return null;

  const supabase = await createClient();
  const avatarUrl = profile.avatar_url
    ? ((await signPaths(supabase, [profile.avatar_url], SIGNED_URL_TTL.display)).get(profile.avatar_url) ?? null)
    : null;
  // Set when the member saves a password from this page.
  const hasPassword = user.user_metadata?.has_password === true;

  return (
    <main className="flex flex-1 flex-col">
      <header className="soft-card mx-4 mt-5 flex flex-wrap items-center justify-between gap-4 !rounded-[28px] px-5 py-2.5 sm:mx-6">
        <Brand href="/clubs" />
        <div className="flex items-center gap-3">
          <Link href="/clubs" className="btn btn-ghost !min-h-[38px] !px-4 text-[13px]">
            Your clubs
          </Link>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost !min-h-[38px] !px-4 text-[13px]">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="grid gap-5 p-4 sm:p-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <section className="soft-card flex flex-col gap-6 p-6 sm:p-7">
          <div>
            <span className="kicker">Your profile</span>
            <h1 className="display mt-2" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
              {profile.display_name ?? profile.email}
            </h1>
            <p className="mt-1 text-[14px] text-neutral-700">
              {profile.email} · on Klubbies since {formatLongDate(profile.created_at)}
            </p>
          </div>
          <AvatarUploader userId={user.id} avatarUrl={avatarUrl} />
          <ProfileForm displayName={profile.display_name ?? ""} email={profile.email} bio={profile.bio} />
        </section>

        <section className="soft-card flex flex-col gap-6 p-6 sm:p-7">
          <div>
            <span className="label-caps">Your clubs</span>
            {clubs.length ? (
              <table className="table mt-3">
                <thead>
                  <tr>
                    <th>Club</th>
                    <th>Role</th>
                    <th>Member since</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((club) => (
                    <tr key={club.membershipId}>
                      <td className="font-semibold">{club.name}</td>
                      <td>
                        <span className={club.isAdmin ? "tag tag-accent" : "tag tag-outline"}>{club.roleName}</span>
                      </td>
                      <td className="text-neutral-700">{formatLongDate(club.since)}</td>
                      <td className="text-right">
                        <Link href={`/c/${club.handle}`} className="btn btn-ghost text-[12px]">
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-3 text-[14px] text-neutral-700">
                You&apos;re not in a club yet. Ask a committee to add {profile.email} to their member list.
              </p>
            )}
            {invites.map((invite) => (
              <InviteCard key={invite.membershipId} invite={invite} />
            ))}
          </div>

          <div className="border-t-2 border-divider pt-6">
            <span className="label-caps">Signing in</span>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-divider p-3">
                <span className="text-[14px]">
                  <strong>Email code</strong>
                  <br />
                  <span className="text-[13px] text-neutral-700">We email a code each time. Always available.</span>
                </span>
                <span className="tag tag-accent text-[11px]">On</span>
              </div>
              <PasswordForm hasPassword={hasPassword} />
            </div>
          </div>

          <div className="border-t-2 border-divider pt-6">
            <span className="label-caps">Email me when</span>
            <NotificationToggles
              initial={{
                notify_new_album: profile.notify_new_album,
                notify_feed_post: profile.notify_feed_post,
                notify_access_ending: profile.notify_access_ending,
              }}
            />
          </div>

          <div className="border-t-2 border-divider pt-6 text-[13px] leading-normal text-neutral-700">
            To delete your account or get a copy of everything shared with you, ask your club admin or contact us. We
            reply within a few days.
          </div>
        </section>
      </div>
    </main>
  );
}
