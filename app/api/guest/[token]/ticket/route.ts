import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveGuestLink } from "@/lib/guest/links";
import { ACCEPTED_TYPES, resolveMimeType } from "@/lib/media/constants";
import { BUCKET, derivativePaths, mediaFolder } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  filename: z.string().trim().min(1).max(255),
  mimeType: z.string().max(100).default(""),
  byteSize: z.number().int().positive(),
});

/**
 * A guest has no session, so we hand back short-lived signed upload URLs
 * instead: the browser PUTs straight to storage, and the only thing that
 * authorised it was the link.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/guest/[token]/ticket">) {
  const { token } = await ctx.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });

  const { state, session } = await resolveGuestLink(token);
  if (!session) {
    return NextResponse.json(
      { error: state === "expired" ? "This link has expired." : "This link isn't valid any more." },
      { status: 403 },
    );
  }

  const mimeType = resolveMimeType(parsed.data.filename, parsed.data.mimeType);
  if (!mimeType) {
    return NextResponse.json({ error: "Only JPG, PNG, HEIC, WebP, MP4 and MOV files can be uploaded" }, { status: 415 });
  }

  const admin = createAdminClient();
  const id = crypto.randomUUID();
  const folder = mediaFolder(session.clubId, session.albumId, id);
  const { kind, ext } = ACCEPTED_TYPES[mimeType];
  const storagePath = `${folder}/original.${ext}`;
  const derivatives = derivativePaths(folder);

  const { error } = await admin.from("media").insert({
    id,
    club_id: session.clubId,
    album_id: session.albumId,
    kind,
    storage_path: storagePath,
    byte_size: parsed.data.byteSize,
    mime_type: mimeType,
    original_filename: parsed.data.filename,
    uploaded_by: null,
    guest_link_id: session.linkId,
    status: "processing",
  });
  if (error) return NextResponse.json({ error: "Could not start the upload" }, { status: 500 });

  // One signed URL per object we are about to write. Each is good for a single
  // upload to that exact path and nothing else.
  const paths = [storagePath, derivatives.thumb, derivatives.display, derivatives.poster];
  const signed: Record<string, { path: string; token: string }> = {};
  for (const path of paths) {
    const { data, error: signError } = await admin.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: true });
    if (signError || !data) return NextResponse.json({ error: "Could not start the upload" }, { status: 500 });
    signed[path] = { path: data.path, token: data.token };
  }

  return NextResponse.json({ mediaId: id, kind, bucket: BUCKET, mimeType, storagePath, derivatives, signed });
}
