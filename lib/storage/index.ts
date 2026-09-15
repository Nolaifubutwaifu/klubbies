import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

// Narrow storage interface (masterfile §8.1). Swapping Supabase Storage for S3
// or R2 should only touch this module.

export const BUCKET = "club_media";

export const SIGNED_URL_TTL = {
  thumb: 10 * 60,
  display: 10 * 60,
  video: 60 * 60,
  download: 5 * 60,
} as const;

type Client = SupabaseClient<Database>;

function ttl(seconds: number): number {
  return serverEnv().SIGNED_URL_TTL_OVERRIDE_SECONDS ?? seconds;
}

export function mediaFolder(clubId: string, albumId: string, mediaId: string): string {
  return `clubs/${clubId}/albums/${albumId}/${mediaId}`;
}

export function derivativePaths(folder: string) {
  return { thumb: `${folder}/thumb.webp`, display: `${folder}/display.webp`, poster: `${folder}/poster.jpg` };
}

export function logoPath(clubId: string, ext: string): string {
  return `clubs/${clubId}/logo/logo.${ext}`;
}

/**
 * Signs many paths in one call. Always pass the user's client: the storage
 * select policy mirrors media visibility, so a path the user may not see
 * simply comes back unsigned.
 */
export async function signPaths(client: Client, paths: string[], seconds: number): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  const result = new Map<string, string>();
  for (let i = 0; i < unique.length; i += 500) {
    const chunk = unique.slice(i, i + 500);
    const { data, error } = await client.storage.from(BUCKET).createSignedUrls(chunk, ttl(seconds));
    if (error) throw error;
    for (const item of data ?? []) {
      if (item.path && item.signedUrl && !item.error) result.set(item.path, item.signedUrl);
    }
  }
  return result;
}

export async function signDownload(client: Client, path: string, filename: string): Promise<string | null> {
  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUrl(path, ttl(SIGNED_URL_TTL.download), { download: filename });
  if (error || !data) return null;
  return data.signedUrl;
}

export async function listFolder(client: Client, folder: string): Promise<Map<string, number>> {
  const { data, error } = await client.storage.from(BUCKET).list(folder, { limit: 20 });
  if (error) throw error;
  const sizes = new Map<string, number>();
  for (const obj of data ?? []) {
    const size = typeof obj.metadata?.size === "number" ? obj.metadata.size : 0;
    sizes.set(obj.name, size);
  }
  return sizes;
}

/** Removes objects with the service role. Authorise before calling. */
export async function removeObjects(paths: string[]): Promise<void> {
  const unique = [...new Set(paths.filter(Boolean))];
  const admin = createAdminClient();
  for (let i = 0; i < unique.length; i += 1000) {
    const { error } = await admin.storage.from(BUCKET).remove(unique.slice(i, i + 1000));
    if (error) throw error;
  }
}
