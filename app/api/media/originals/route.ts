import { NextResponse } from "next/server";
import { z } from "zod";
import { getClubContextById, getSessionUser } from "@/lib/auth/session";
import { logAccess } from "@/lib/media/access";
import { SIGNED_URL_TTL, signPaths } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

// Save to Photos inside the iPhone app. The app downloads each file itself,
// so it needs signed links to the originals: the file the photographer made,
// and the video itself rather than its poster frame. Same rules as a single
// download (/api/media/[id]/download): RLS decides what is visible, albums
// with downloads off are skipped for members, and every file is logged.

const schema = z.object({ mediaIds: z.array(z.uuid()).min(1).max(50) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (!(await getSessionUser())) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .select("id, club_id, storage_path, status, albums!media_album_id_fkey(allow_download)")
    .in("id", parsed.data.mediaIds)
    .eq("status", "ready");
  if (error) {
    console.error("originals lookup failed", error);
    return NextResponse.json({ error: "Could not load media" }, { status: 500 });
  }

  const rows = data ?? [];
  const clubs = new Map<string, Awaited<ReturnType<typeof getClubContextById>>>();
  for (const clubId of new Set(rows.map((m) => m.club_id))) clubs.set(clubId, await getClubContextById(clubId));

  const allowed = rows.filter((m) => {
    const club = clubs.get(m.club_id);
    return club && (club.isAdmin || m.albums?.allow_download !== false);
  });
  const signed = await signPaths(supabase, allowed.map((m) => m.storage_path), SIGNED_URL_TTL.download);

  const urls: Record<string, string> = {};
  for (const m of allowed) {
    const url = signed.get(m.storage_path);
    if (!url) continue;
    urls[m.id] = url;
    await logAccess(clubs.get(m.club_id)!, m.id, "download");
  }
  return NextResponse.json({ urls });
}
