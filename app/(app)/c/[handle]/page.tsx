import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkVisited } from "@/components/MarkVisited";
import { SoftEvents } from "@/components/soft/SoftEvents";
import { getClubContext, getProfile } from "@/lib/auth/session";
import { displayNameFor } from "@/lib/auth/display-name";
import { listStackedAlbums } from "@/lib/media/album-list";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(props: PageProps<"/c/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const ctx = await getClubContext(handle);
  return { title: ctx?.club.name ?? "Club" };
}

export default async function ClubFeedPage(props: PageProps<"/c/[handle]">) {
  const { handle } = await props.params;
  const ctx = await getClubContext(handle);
  if (!ctx) notFound();

  const supabase = await createClient();
  const [albums, displayName, profile] = await Promise.all([
    listStackedAlbums(supabase, ctx.club.id, {
      includeDrafts: ctx.perms.manage_albums,
      since: ctx.membership?.last_seen_at ?? null,
    }),
    displayNameFor(ctx),
    getProfile(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <SoftEvents
        albums={albums}
        hrefBase={`/c/${handle}/a`}
        canManage={ctx.perms.manage_albums}
        clubName={ctx.club.name}
        newAlbumHref={`/admin/${handle}/upload`}
        savedHref={`/c/${handle}/saved`}
        firstName={displayName.trim().split(/\s+/)[0] ?? ""}
        notifiesOnNewAlbums={profile?.notify_new_album ?? false}
      />
      {/* Stamps the visit after render, so this page still shows what was new. */}
      <MarkVisited clubId={ctx.club.id} />
    </main>
  );
}
