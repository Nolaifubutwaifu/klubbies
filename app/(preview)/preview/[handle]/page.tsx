import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoftBackdrop } from "@/components/soft/SoftBackdrop";
import { SoftEvents } from "@/components/soft/SoftEvents";
import { SoftHeader } from "@/components/soft/SoftHeader";
import { getClubContext } from "@/lib/auth/session";
import { listStackedAlbums } from "@/lib/media/album-list";
import { createClient } from "@/lib/supabase/server";
import { accentStyle } from "@/lib/theme";

export const metadata: Metadata = { title: "Design preview" };

/**
 * Prototype of the events page in the soft theme, so the two directions can be
 * compared with real club data. Not linked from the app.
 */
export default async function SoftPreviewPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const ctx = await getClubContext(handle);
  if (!ctx) notFound();

  const supabase = await createClient();
  const albums = await listStackedAlbums(supabase, ctx.club.id, { includeDrafts: ctx.perms.manage_albums });

  return (
    <div className="theme-soft relative flex flex-1 flex-col" style={accentStyle(ctx.club.accent_colour)}>
      <SoftBackdrop />
      <div className="relative z-10">
        <SoftHeader ctx={ctx} />
      </div>
      <main className="relative z-10 flex flex-1 flex-col">
        <SoftEvents
          albums={albums}
          hrefBase={`/c/${handle}/a`}
          canManage={ctx.perms.manage_albums}
          clubName={ctx.club.name}
          newAlbumHref={`/admin/${handle}/albums`}
        />
      </main>
    </div>
  );
}
