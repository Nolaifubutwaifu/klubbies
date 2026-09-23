import "server-only";
import type { Json, MemberFaceProfile } from "@/lib/db/types";
import { facesConfigured } from "@/lib/faces/client";
import { SIGNED_URL_TTL, signPaths } from "@/lib/storage";
import type { UserClient } from "@/lib/supabase/server";

export const PHOTOS_OF_YOU_PAGE_SIZE = 60;
const SUGGESTION_LIMIT = 24;

export type BoundingBox = { Left: number; Top: number; Width: number; Height: number };

function asBox(value: Json | null): BoundingBox | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const box = value as Record<string, unknown>;
  const numbers = ["Left", "Top", "Width", "Height"].map((key) => box[key]);
  if (!numbers.every((n) => typeof n === "number")) return null;
  const [Left, Top, Width, Height] = numbers as number[];
  return { Left, Top, Width, Height };
}

export type FaceState = {
  enabled: boolean;
  profile: Pick<MemberFaceProfile, "id" | "status" | "failure_reason" | "consented_at"> | null;
  backfillRunning: boolean;
};

/**
 * Where this member stands: has the club turned it on, have they enrolled,
 * and is the library still being worked through. Three separate answers
 * because the three empty states they drive are not the same.
 */
export async function faceStateFor(supabase: UserClient, clubId: string, userId: string): Promise<FaceState> {
  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabase.from("club_face_settings").select("enabled, backfill_status").eq("club_id", clubId).maybeSingle(),
    supabase
      .from("member_face_profiles")
      .select("id, status, failure_reason, consented_at")
      .eq("club_id", clubId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  return {
    // A club row can say "on" while this deployment has no AWS credentials —
    // the database is shared between local and production, and production may
    // not have the keys yet. Without them nothing can index, match or delete,
    // so the honest answer to a member is that the feature is not here. The
    // alternative is an enrolment that accepts a selfie and never finishes.
    enabled: Boolean(settings?.enabled) && facesConfigured(),
    profile: profile ?? null,
    backfillRunning: settings?.backfill_status === "queued" || settings?.backfill_status === "running",
  };
}

export type PhotoOfYou = {
  matchId: string;
  mediaId: string;
  albumId: string | null;
  albumTitle: string;
  thumbUrl: string | null;
  similarity: number;
};

export type PhotosOfYouGroup = {
  albumId: string;
  albumTitle: string;
  albumDate: string | null;
  items: PhotoOfYou[];
};

/**
 * The grid, grouped by album.
 *
 * A member's own photos are the one view in this app where the flat, purely
 * chronological order was wrong: a run of 40 thumbnails from four different
 * nights reads as a pile, not as "the ball, then the grand final". Albums are
 * how people remember events, so they are how these are stacked — the same
 * shape the Saved page uses.
 *
 * RLS already restricts face_matches to the caller's own profile, so there is
 * deliberately no user filter here. Do not "fix" that by adding one: it would
 * only hide the fact that the guarantee lives in the database.
 */
export async function listPhotosOfYou(
  supabase: UserClient,
  clubId: string,
  page = 0,
): Promise<{ groups: PhotosOfYouGroup[]; total: number; hasMore: boolean }> {
  const { data, error } = await supabase
    .from("face_matches")
    // albums has to be named by its FK: media.album_id points at albums, and
    // albums.cover_media_id points back at media, so a bare `albums` embed is
    // ambiguous and PostgREST refuses it.
    .select(
      "id, media_id, similarity, media!inner(id, album_id, sort_at, thumb_path, poster_path, albums!media_album_id_fkey(title, event_date))",
    )
    .eq("club_id", clubId)
    .eq("state", "confirmed")
    .order("sort_at", { ascending: false, referencedTable: "media" })
    .range(page * PHOTOS_OF_YOU_PAGE_SIZE, (page + 1) * PHOTOS_OF_YOU_PAGE_SIZE);
  if (error) throw error;

  const rows = data ?? [];
  const pageRows = rows.slice(0, PHOTOS_OF_YOU_PAGE_SIZE);
  // One signing call for the page, the way lib/media/queries.ts does it. One
  // request per tile is the thing this codebase has consistently avoided.
  const urls = await signPaths(
    supabase,
    pageRows.map((row) => row.media.thumb_path ?? row.media.poster_path ?? "").filter(Boolean),
    SIGNED_URL_TTL.thumb,
  );

  // Album order follows the photo order, so the most recent event is first
  // and the group's own photos stay newest-first inside it.
  const groups = new Map<string, PhotosOfYouGroup>();
  for (const row of pageRows) {
    const albumId = row.media.album_id;
    if (!albumId) continue; // loose media has no event to sit under
    const path = row.media.thumb_path ?? row.media.poster_path;
    const group = groups.get(albumId) ?? {
      albumId,
      albumTitle: row.media.albums?.title ?? "This club",
      albumDate: row.media.albums?.event_date ?? null,
      items: [],
    };
    group.items.push({
      matchId: row.id,
      mediaId: row.media_id,
      albumId,
      albumTitle: group.albumTitle,
      thumbUrl: path ? (urls.get(path) ?? null) : null,
      similarity: Number(row.similarity),
    });
    groups.set(albumId, group);
  }

  return {
    groups: [...groups.values()],
    total: pageRows.length,
    hasMore: rows.length > PHOTOS_OF_YOU_PAGE_SIZE,
  };
}

export type Suggestion = {
  matchId: string;
  mediaId: string;
  albumId: string | null;
  albumTitle: string;
  displayUrl: string | null;
  box: BoundingBox | null;
};

/**
 * "Is this you?". These use the display copy rather than the thumbnail: the
 * crop is a fraction of the frame, and a 400px thumb cropped to one face is
 * unreadable.
 */
export async function listFaceSuggestions(supabase: UserClient, clubId: string): Promise<Suggestion[]> {
  const { data, error } = await supabase
    .from("face_matches")
    .select(
      "id, media_id, bounding_box, similarity, media!inner(id, album_id, display_path, storage_path, albums!media_album_id_fkey(title))",
    )
    .eq("club_id", clubId)
    .eq("state", "suggested")
    .order("similarity", { ascending: false })
    .limit(SUGGESTION_LIMIT);
  if (error) throw error;

  const rows = data ?? [];
  const urls = await signPaths(
    supabase,
    rows.map((row) => row.media.display_path ?? row.media.storage_path).filter(Boolean),
    SIGNED_URL_TTL.display,
  );

  return rows.map((row) => {
    const path = row.media.display_path ?? row.media.storage_path;
    return {
      matchId: row.id,
      mediaId: row.media_id,
      albumId: row.media.album_id,
      albumTitle: row.media.albums?.title ?? "This club",
      displayUrl: path ? (urls.get(path) ?? null) : null,
      box: asBox(row.bounding_box),
    };
  });
}

/**
 * "12 photos of you" on an album card. One grouped count for every album on
 * screen, in the same batched style as the cover lookups in album-list.ts —
 * never one query per card.
 */
export async function countPhotosOfYouByAlbum(
  supabase: UserClient,
  clubId: string,
  albumIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (albumIds.length === 0) return counts;
  const { data } = await supabase
    .from("face_matches")
    .select("media_id, media!inner(album_id)")
    .eq("club_id", clubId)
    .eq("state", "confirmed")
    .in("media.album_id", albumIds);
  for (const row of data ?? []) {
    const albumId = row.media?.album_id;
    if (!albumId) continue;
    counts.set(albumId, (counts.get(albumId) ?? 0) + 1);
  }
  return counts;
}

/** Is this specific photo one of yours? Drives "Not me" in the viewer. */
export async function matchForMedia(
  supabase: UserClient,
  mediaId: string,
): Promise<{ matchId: string; state: string } | null> {
  const { data } = await supabase
    .from("face_matches")
    .select("id, state")
    .eq("media_id", mediaId)
    .in("state", ["confirmed", "suggested"])
    .maybeSingle();
  return data ? { matchId: data.id, state: data.state } : null;
}

export async function countPhotosOfYou(supabase: UserClient, clubId: string): Promise<number> {
  const { count } = await supabase
    .from("face_matches")
    .select("id", { count: "exact", head: true })
    .eq("club_id", clubId)
    .eq("state", "confirmed");
  return count ?? 0;
}
