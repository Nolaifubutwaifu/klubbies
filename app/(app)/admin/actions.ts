"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { getClubContextById, requireUser } from "@/lib/auth/session";
import { ACTIVATE_MESSAGE, canWrite } from "@/lib/billing/status";
import { graceWindow, sendDueGraceNotice } from "@/lib/membership/grace";
import { isValidEmail, normaliseEmail } from "@/lib/roster/email";
import { generateHandleBase } from "@/lib/roster/handle";
import { removeObjects } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; ok?: boolean; message?: string };

async function adminContext(clubId: string) {
  const ctx = await getClubContextById(clubId);
  if (!ctx?.isAdmin) throw new Error("Not authorised");
  return ctx;
}

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// ---------------------------------------------------------------------------
// Clubs
// ---------------------------------------------------------------------------

const clubSchema = z.object({
  name: z.string().trim().min(2, "Give the club a name").max(120),
  organisation: z.string().trim().max(160),
  description: z.string().trim().max(1000),
});

export async function createClubAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireUser("/admin/new");
  const parsed = clubSchema.safeParse({
    name: text(form, "name"),
    organisation: text(form, "organisation"),
    description: text(form, "description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_club", {
    p_name: parsed.data.name,
    p_handle_base: generateHandleBase(parsed.data.name),
    p_organisation: parsed.data.organisation,
    p_description: parsed.data.description,
  });
  if (error || !data) return { error: "Could not create the club. Try again." };

  redirect(`/admin/${data.handle}/billing?step=2`);
}

const clubSettingsSchema = clubSchema.extend({
  accentColour: z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colour must look like #ec3013")]),
});

export async function updateClubAction(clubId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await adminContext(clubId);
  const parsed = clubSettingsSchema.safeParse({
    name: text(form, "name"),
    organisation: text(form, "organisation"),
    description: text(form, "description"),
    accentColour: text(form, "accentColour"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clubs")
    .update({
      name: parsed.data.name,
      organisation: parsed.data.organisation || null,
      description: parsed.data.description || null,
      accent_colour: parsed.data.accentColour || null,
    })
    .eq("id", clubId);
  if (error) return { error: "Could not save the settings" };
  revalidatePath(`/admin/${ctx.club.handle}`, "layout");
  revalidatePath(`/c/${ctx.club.handle}`, "layout");
  return { ok: true, message: "Saved" };
}

export async function setClubLogoAction(clubId: string, path: string | null): Promise<ActionState> {
  const ctx = await adminContext(clubId);
  if (path !== null && !path.startsWith(`clubs/${clubId}/logo/`)) return { error: "Invalid logo path" };
  const supabase = await createClient();
  const { error } = await supabase.from("clubs").update({ logo_path: path }).eq("id", clubId);
  if (error) return { error: "Could not save the logo" };
  revalidatePath(`/admin/${ctx.club.handle}`, "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

const memberSchema = z.object({
  name: z.string().trim().min(1, "Enter the member's full name").max(200),
  email: z.string().transform(normaliseEmail).refine(isValidEmail, "Enter a valid email address"),
});

export async function addMemberAction(clubId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await adminContext(clubId);
  if (!canWrite(ctx.club.billing_status)) return { error: ACTIVATE_MESSAGE };
  const parsed = memberSchema.safeParse({ name: text(form, "name"), email: text(form, "email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("memberships")
    .select("id, status, user_id")
    .eq("club_id", clubId)
    .eq("roster_email", parsed.data.email)
    .maybeSingle();

  if (existing && (existing.status === "active" || existing.status === "pending")) {
    return { error: `${parsed.data.email} is already on the list` };
  }

  const now = new Date().toISOString();
  const { error } = existing
    ? await supabase
        .from("memberships")
        .update({
          status: existing.user_id ? "active" : "pending",
          grace_started_at: null,
          grace_ends_at: null,
          grace_notices_sent: 0,
          invited_at: now,
        })
        .eq("id", existing.id)
    : await supabase.from("memberships").insert({
        club_id: clubId,
        roster_email: parsed.data.email,
        roster_name: parsed.data.name,
        status: "pending",
        role: "club_member",
        invited_at: now,
      });
  if (error) return { error: "Could not add that member" };

  revalidatePath(`/admin/${ctx.club.handle}/members`);
  return { ok: true, message: existing ? `${parsed.data.name} is back on the list` : `${parsed.data.name} added` };
}

export async function removeMembersAction(clubId: string, membershipIds: string[]): Promise<ActionState> {
  const ctx = await adminContext(clubId);
  const ids = z.array(z.uuid()).min(1).max(1000).safeParse(membershipIds);
  if (!ids.success) return { error: "Select at least one member" };

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("memberships")
    .select("id, user_id, role, status")
    .eq("club_id", clubId)
    .in("id", ids.data)
    .in("status", ["pending", "active"]);
  const targets = rows ?? [];
  if (targets.some((m) => m.user_id === ctx.userId)) return { error: "You can't remove yourself" };

  if (targets.some((m) => m.role === "club_admin")) {
    const { count } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("club_id", clubId)
      .eq("role", "club_admin")
      .eq("status", "active");
    const removingAdmins = targets.filter((m) => m.role === "club_admin" && m.status === "active").length;
    if ((count ?? 0) - removingAdmins < 1) return { error: "A club needs at least one admin" };
  }

  // People who never signed in have nothing to keep, so they are revoked
  // straight away. Everyone else enters the 30 day grace window.
  const neverJoined = targets.filter((m) => m.user_id === null).map((m) => m.id);
  const joined = targets.filter((m) => m.user_id !== null).map((m) => m.id);
  const { startedAt, endsAt } = graceWindow();

  if (neverJoined.length) {
    await supabase.from("memberships").update({ status: "revoked" }).in("id", neverJoined);
  }
  if (joined.length) {
    await supabase
      .from("memberships")
      .update({ status: "grace", role: "club_member", grace_started_at: startedAt, grace_ends_at: endsAt, grace_notices_sent: 0 })
      .in("id", joined);

    after(async () => {
      const { data } = await createAdminClient()
        .from("memberships")
        .select("id, roster_email, roster_name, claimed_name, grace_started_at, grace_ends_at, grace_notices_sent, clubs!inner(name, handle)")
        .in("id", joined);
      for (const row of data ?? []) {
        await sendDueGraceNotice(row).catch((err) => console.error("grace notice failed", row.id, err));
      }
    });
  }

  revalidatePath(`/admin/${ctx.club.handle}/members`);
  return {
    ok: true,
    message: `${targets.length} removed. ${joined.length ? `${joined.length} keep access to earlier albums for 30 days.` : ""}`.trim(),
  };
}

export async function endGraceAction(clubId: string, membershipId: string, typedName: string): Promise<ActionState> {
  const ctx = await adminContext(clubId);
  const supabase = await createClient();
  const { data: member } = await supabase
    .from("memberships")
    .select("id, roster_name, status")
    .eq("club_id", clubId)
    .eq("id", membershipId)
    .maybeSingle();
  if (!member || member.status !== "grace") return { error: "That member isn't in a grace period" };

  const clean = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  if (clean(typedName) !== clean(member.roster_name)) return { error: `Type ${member.roster_name} exactly to confirm` };

  const { error } = await supabase
    .from("memberships")
    .update({ status: "revoked", grace_ends_at: new Date().toISOString() })
    .eq("id", member.id);
  if (error) return { error: "Could not end access" };
  revalidatePath(`/admin/${ctx.club.handle}/members`);
  return { ok: true, message: `${member.roster_name} no longer has access` };
}

export async function restoreMemberAction(clubId: string, membershipId: string): Promise<ActionState> {
  const ctx = await adminContext(clubId);
  const supabase = await createClient();
  const { data: member } = await supabase
    .from("memberships")
    .select("id, user_id")
    .eq("club_id", clubId)
    .eq("id", membershipId)
    .maybeSingle();
  if (!member) return { error: "Member not found" };
  await supabase
    .from("memberships")
    .update({ status: member.user_id ? "active" : "pending", grace_started_at: null, grace_ends_at: null, grace_notices_sent: 0 })
    .eq("id", member.id);
  revalidatePath(`/admin/${ctx.club.handle}/members`);
  return { ok: true, message: "Access restored" };
}

// ---------------------------------------------------------------------------
// Albums and media
// ---------------------------------------------------------------------------

const albumSchema = z.object({
  title: z.string().trim().min(1, "Give the album a name").max(160),
  eventDate: z.union([z.literal(""), z.iso.date()]),
  description: z.string().trim().max(2000),
  allowDownload: z.boolean(),
});

function albumInput(form: FormData) {
  return albumSchema.safeParse({
    title: text(form, "title"),
    eventDate: text(form, "eventDate"),
    description: text(form, "description"),
    allowDownload: form.get("allowDownload") === "on",
  });
}

export async function createAlbumAction(clubId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await adminContext(clubId);
  if (!canWrite(ctx.club.billing_status)) return { error: ACTIVATE_MESSAGE };
  const parsed = albumInput(form);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("albums")
    .insert({
      club_id: clubId,
      title: parsed.data.title,
      event_date: parsed.data.eventDate || null,
      description: parsed.data.description || null,
      allow_download: parsed.data.allowDownload,
      status: "draft",
      visibility: "members",
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "Could not create the album" };
  redirect(`/admin/${ctx.club.handle}/albums/${data.id}`);
}

export async function updateAlbumAction(albumId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: album } = await supabase.from("albums").select("id, club_id").eq("id", albumId).maybeSingle();
  if (!album) return { error: "Album not found" };
  const ctx = await adminContext(album.club_id);
  const parsed = albumInput(form);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await supabase
    .from("albums")
    .update({
      title: parsed.data.title,
      event_date: parsed.data.eventDate || null,
      description: parsed.data.description || null,
      allow_download: parsed.data.allowDownload,
    })
    .eq("id", albumId);
  if (error) return { error: "Could not save the album" };
  revalidatePath(`/admin/${ctx.club.handle}/albums/${albumId}`);
  revalidatePath(`/c/${ctx.club.handle}`, "layout");
  return { ok: true, message: "Saved" };
}

export async function setAlbumPublishedAction(albumId: string, published: boolean): Promise<ActionState> {
  const supabase = await createClient();
  const { data: album } = await supabase.from("albums").select("id, club_id, published_at").eq("id", albumId).maybeSingle();
  if (!album) return { error: "Album not found" };
  const ctx = await adminContext(album.club_id);

  if (published) {
    const { count } = await supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("album_id", albumId)
      .eq("status", "ready");
    if (!count) return { error: "Add at least one photo or video before publishing" };
  }

  const { error } = await supabase
    .from("albums")
    .update({
      status: published ? "published" : "draft",
      published_at: published ? (album.published_at ?? new Date().toISOString()) : album.published_at,
    })
    .eq("id", albumId);
  if (error) return { error: "Could not update the album" };
  revalidatePath(`/admin/${ctx.club.handle}`, "layout");
  revalidatePath(`/c/${ctx.club.handle}`, "layout");
  return { ok: true, message: published ? "Album published. Members can see it now." : "Album moved back to draft" };
}

export async function setAlbumCoverAction(albumId: string, mediaId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data: album } = await supabase.from("albums").select("id, club_id").eq("id", albumId).maybeSingle();
  if (!album) return { error: "Album not found" };
  const ctx = await adminContext(album.club_id);
  const { error } = await supabase.from("albums").update({ cover_media_id: mediaId }).eq("id", albumId);
  if (error) return { error: "Could not set the cover" };
  revalidatePath(`/admin/${ctx.club.handle}/albums/${albumId}`);
  revalidatePath(`/c/${ctx.club.handle}`, "layout");
  return { ok: true, message: "Cover updated" };
}

export async function deleteMediaAction(mediaIds: string[]): Promise<ActionState> {
  const ids = z.array(z.uuid()).min(1).max(500).safeParse(mediaIds);
  if (!ids.success) return { error: "Nothing selected" };
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("media")
    .select("id, club_id, album_id, storage_path, thumb_path, display_path, poster_path")
    .in("id", ids.data);
  const items = rows ?? [];
  if (items.length === 0) return { error: "Nothing to delete" };

  const clubIds = [...new Set(items.map((m) => m.club_id))];
  const contexts = await Promise.all(clubIds.map(adminContext));

  await removeObjects(items.flatMap((m) => [m.storage_path, m.thumb_path ?? "", m.display_path ?? "", m.poster_path ?? ""]));
  const { error } = await supabase.from("media").delete().in("id", items.map((m) => m.id));
  if (error) return { error: "Could not delete" };

  for (const ctx of contexts) {
    revalidatePath(`/admin/${ctx.club.handle}`, "layout");
    revalidatePath(`/c/${ctx.club.handle}`, "layout");
  }
  return { ok: true, message: `${items.length} deleted` };
}

export async function deleteAlbumAction(albumId: string, typedTitle: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data: album } = await supabase.from("albums").select("id, club_id, title").eq("id", albumId).maybeSingle();
  if (!album) return { error: "Album not found" };
  const ctx = await adminContext(album.club_id);
  if (typedTitle.trim().toLowerCase() !== album.title.trim().toLowerCase()) {
    return { error: `Type ${album.title} to confirm` };
  }

  for (;;) {
    const { data: batch } = await supabase
      .from("media")
      .select("id, storage_path, thumb_path, display_path, poster_path")
      .eq("album_id", albumId)
      .limit(500);
    if (!batch || batch.length === 0) break;
    await removeObjects(batch.flatMap((m) => [m.storage_path, m.thumb_path ?? "", m.display_path ?? "", m.poster_path ?? ""]));
    await supabase.from("media").delete().in("id", batch.map((m) => m.id));
  }
  await supabase.from("albums").delete().eq("id", albumId);

  revalidatePath(`/c/${ctx.club.handle}`, "layout");
  redirect(`/admin/${ctx.club.handle}/albums`);
}
