import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoftEvents } from "@/components/soft/SoftEvents";
import { getClubContext } from "@/lib/auth/session";
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
  const albums = await listStackedAlbums(supabase, ctx.club.id, { includeDrafts: ctx.perms.manage_albums });

  return (
    <main className="flex flex-1 flex-col">
      <SoftEvents
        albums={albums}
        hrefBase={`/c/${handle}/a`}
        canManage={ctx.perms.manage_albums}
        clubName={ctx.club.name}
        newAlbumHref={`/admin/${handle}/albums`}
      />
    </main>
  );
}
