import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { canWrite } from "@/lib/billing/status";
import { BillingGate } from "@/components/BillingGate";
import { listAlbumMedia } from "@/lib/media/queries";
import { createClient } from "@/lib/supabase/server";
import { AdminMediaGrid } from "./AdminMediaGrid";
import { AlbumSettingsForm } from "./AlbumSettingsForm";
import { DeleteAlbum } from "./DeleteAlbum";
import { PublishToggle } from "./PublishToggle";
import { Uploader } from "./Uploader";

export const metadata: Metadata = { title: "Album" };

export default async function AdminAlbumPage(props: PageProps<"/admin/[handle]/albums/[albumId]">) {
  const { handle, albumId } = await props.params;
  if (!z.uuid().safeParse(albumId).success) notFound();
  const ctx = await requireAdminContext(handle);
  const supabase = await createClient();

  const { data: album } = await supabase.from("albums").select("*").eq("id", albumId).eq("club_id", ctx.club.id).maybeSingle();
  if (!album) notFound();

  const [{ items, hasMore }, total, ready] = await Promise.all([
    listAlbumMedia(supabase, album.id, 0, { includeProcessing: true }),
    supabase.from("media").select("id", { count: "exact", head: true }).eq("album_id", album.id),
    supabase.from("media").select("id", { count: "exact", head: true }).eq("album_id", album.id).eq("status", "ready"),
  ]);
  const published = album.status === "published";

  return (
    <main className="flex max-w-[1040px] flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href={`/admin/${handle}/albums`} className="btn btn-ghost pl-0 text-[13px]">
            ← Albums
          </Link>
          <div className="kicker mt-2 block">
            {ctx.club.name} · {published ? "Published" : "Draft"}
          </div>
          <h1 className="display mt-2" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>
            {album.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {published ? (
            <Link href={`/c/${handle}/a/${album.id}`} className="btn btn-secondary">
              View as member
            </Link>
          ) : null}
          <PublishToggle albumId={album.id} published={published} readyCount={ready.count ?? 0} />
        </div>
      </div>
      <div className="hr" />

      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <AlbumSettingsForm
          albumId={album.id}
          title={album.title}
          eventDate={album.event_date}
          description={album.description}
          allowDownload={album.allow_download}
        />
        {canWrite(ctx.club.billing_status) ? <Uploader albumId={album.id} /> : <BillingGate handle={handle} action="upload" />}
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-[20px] font-extrabold">In this album</h2>
          <span className="text-[13px] text-neutral-700">
            {(ready.count ?? 0).toLocaleString("en-AU")} ready
            {(total.count ?? 0) > (ready.count ?? 0) ? ` · ${(total.count ?? 0) - (ready.count ?? 0)} not finished` : ""}
          </span>
        </div>
        <AdminMediaGrid
          key={`${total.count}-${ready.count}-${album.cover_media_id}`}
          albumId={album.id}
          coverMediaId={album.cover_media_id}
          initialItems={items}
          initialHasMore={hasMore}
        />
      </section>

      <DeleteAlbum albumId={album.id} title={album.title} />
    </main>
  );
}
