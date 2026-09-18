import type { Metadata } from "next";
import { BillingGate } from "@/components/BillingGate";
import { SoftEvents } from "@/components/soft/SoftEvents";
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
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 pb-2 pt-8 sm:px-6">
        <PageTitle kicker={ctx.club.name} title="Albums" />
        <div className="hr" />
        {canWrite(ctx.club.billing_status) ? (
          <NewAlbumForm clubId={ctx.club.id} />
        ) : (
          <BillingGate handle={handle} action="create albums" />
        )}
      </div>
      <SoftEvents
        albums={albums}
        hrefBase={`/c/${handle}/a`}
        canManage
        clubName={ctx.club.name}
        newAlbumHref={`/admin/${handle}/albums`}
      />
    </main>
  );
}
