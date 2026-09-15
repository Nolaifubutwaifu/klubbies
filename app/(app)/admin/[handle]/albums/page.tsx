import type { Metadata } from "next";
import { AlbumCard } from "@/components/AlbumCard";
import { PageTitle } from "@/components/ui";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { listAlbums } from "@/lib/media/queries";
import { createClient } from "@/lib/supabase/server";
import { NewAlbumForm } from "./NewAlbumForm";

export const metadata: Metadata = { title: "Albums" };

export default async function AdminAlbumsPage(props: PageProps<"/admin/[handle]/albums">) {
  const { handle } = await props.params;
  const ctx = await requireAdminContext(handle);
  const supabase = await createClient();
  const { albums } = await listAlbums(supabase, ctx.club.id, { includeDrafts: true });

  return (
    <main className="flex flex-col gap-6 px-6 py-8">
      <PageTitle kicker={ctx.club.name} title="Albums" />
      <div className="hr" />
      <NewAlbumForm clubId={ctx.club.id} />
      {albums.length ? (
        <div className="tile-grid border-2 border-divider" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} href={`/admin/${handle}/albums/${album.id}`} showStatus />
          ))}
        </div>
      ) : null}
    </main>
  );
}
