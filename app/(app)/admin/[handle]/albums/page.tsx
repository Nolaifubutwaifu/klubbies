import type { Metadata } from "next";
import { BillingGate } from "@/components/BillingGate";
import { EventsBrowser } from "@/components/EventsBrowser";
import { PageTitle } from "@/components/ui";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { canWrite } from "@/lib/billing/status";
import { listStackedAlbums } from "@/lib/media/album-list";
import { createClient } from "@/lib/supabase/server";
import { NewAlbumForm } from "./NewAlbumForm";

export const metadata: Metadata = { title: "Albums" };

export default async function AdminAlbumsPage(props: PageProps<"/admin/[handle]/albums">) {
  const { handle } = await props.params;
  const ctx = await requireAdminContext(handle);
  const supabase = await createClient();
  const albums = await listStackedAlbums(supabase, ctx.club.id, { includeDrafts: true });

  return (
    <main className="flex flex-col">
      <div className="flex flex-col gap-6 px-6 pb-2 pt-8">
        <PageTitle kicker={ctx.club.name} title="Albums" />
        <div className="hr" />
        {canWrite(ctx.club.billing_status) ? (
          <NewAlbumForm clubId={ctx.club.id} />
        ) : (
          <BillingGate handle={handle} action="create albums" />
        )}
      </div>
      <EventsBrowser albums={albums} hrefBase={`/c/${handle}/a`} canManage />
    </main>
  );
}
