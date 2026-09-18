import "server-only";
import { SIGNED_URL_TTL, signPaths } from "@/lib/storage";
import type { UserClient } from "@/lib/supabase/server";

const TILES_PER_CLUB = 4;

export type ClubCard = {
  tiles: string[];
  albumCount: number;
  itemCount: number;
  /** Albums published since this member last opened the club. */
  newCount: number;
  latestTitle: string | null;
  latestDate: string | null;
};

/**
 * The photo side of a club, for the club picker: a few recent thumbnails and
 * what has landed since the member last looked. Kept out of listMyClubs so the
 * app header doesn't pay for it on every page.
 */
export async function listClubCards(
  supabase: UserClient,
  clubIds: string[],
  userId: string,
): Promise<Map<string, ClubCard>> {
  const cards = new Map<string, ClubCard>();
  if (!clubIds.length) return cards;

  const [{ data: visits }, { data: albums }, { data: media }] = await Promise.all([
    supabase.from("memberships").select("club_id, last_seen_at").eq("user_id", userId).in("club_id", clubIds),
    supabase
      .from("albums")
      .select("id, club_id, title, event_date, published_at")
      .in("club_id", clubIds)
      .eq("status", "published")
      .order("event_date", { ascending: false, nullsFirst: false }),
    supabase
      .from("media")
      .select("club_id, thumb_path, poster_path, sort_at")
      .in("club_id", clubIds)
      .eq("status", "ready")
      .order("sort_at", { ascending: false })
      .limit(clubIds.length * TILES_PER_CLUB * 3),
  ]);

  const albumIds = (albums ?? []).map((a) => a.id);
  const { data: counts } = albumIds.length
    ? await supabase.from("album_media_counts").select("album_id, photo_count, video_count").in("album_id", albumIds)
    : { data: [] };
  const countByAlbum = new Map((counts ?? []).map((c) => [c.album_id, (c.photo_count ?? 0) + (c.video_count ?? 0)]));

  const seenAt = new Map((visits ?? []).map((v) => [v.club_id, v.last_seen_at]));

  // Up to four thumbnails per club, newest first.
  const pathsByClub = new Map<string, string[]>();
  for (const row of media ?? []) {
    const path = row.thumb_path ?? row.poster_path;
    if (!path) continue;
    const list = pathsByClub.get(row.club_id) ?? [];
    if (list.length < TILES_PER_CLUB) list.push(path);
    pathsByClub.set(row.club_id, list);
  }
  const urls = await signPaths(supabase, [...pathsByClub.values()].flat(), SIGNED_URL_TTL.thumb);

  for (const clubId of clubIds) {
    const own = (albums ?? []).filter((a) => a.club_id === clubId);
    const since = seenAt.get(clubId);
    const cutoff = since ? new Date(since).getTime() : null;

    cards.set(clubId, {
      tiles: (pathsByClub.get(clubId) ?? []).map((p) => urls.get(p)).filter((u): u is string => Boolean(u)),
      albumCount: own.length,
      itemCount: own.reduce((sum, a) => sum + (countByAlbum.get(a.id) ?? 0), 0),
      newCount:
        cutoff === null
          ? 0
          : own.filter((a) => a.published_at !== null && new Date(a.published_at).getTime() > cutoff).length,
      latestTitle: own[0]?.title ?? null,
      latestDate: own[0]?.event_date ?? null,
    });
  }

  return cards;
}
