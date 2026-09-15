"use server";

import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { listAlbumMedia, type GridItem } from "@/lib/media/queries";
import { createClient } from "@/lib/supabase/server";

export async function loadAlbumPageAction(
  albumId: string,
  page: number,
  includeProcessing = false,
): Promise<{ items: GridItem[]; hasMore: boolean }> {
  const id = z.uuid().parse(albumId);
  const pageNumber = z.number().int().min(0).max(10000).parse(page);
  if (!(await getSessionUser())) return { items: [], hasMore: false };
  // RLS limits results to what the caller may see; processing items only
  // come back for club admins.
  return listAlbumMedia(await createClient(), id, pageNumber, { includeProcessing });
}
