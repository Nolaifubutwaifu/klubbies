# Decisions

Choices made during the v1 build that `klubbies_masterfile.md` did not settle. Newest at the bottom.

## 2026-09-15 · v1 build

1. **Sign-in codes are minted by Supabase Auth and delivered by Resend.** `request_code` checks the roster with the service role and calls `auth.admin.generateLink` to get the six digit OTP. We email it with a React Email template and do not use Supabase's mailer, so there are no Supabase email rate limits and branding stays consistent. Supabase handles hashing, single use and expiry. We additionally enforce a 10 minute window and 5 attempts in `pending_sign_ins`.
2. **The roster lookup runs after the response (`after()`).** Every `request_code` call returns the same body and status in the same time, whether or not the email is on a roster.
3. **"Start a club" is open to any verified email** (confirmed with Max). The `/start` flow sends a code without a roster check. The creator becomes `club_admin` through the `create_club` RPC.
4. **RLS helpers live in a `private` schema** (`private.is_club_member`, `private.is_club_admin`, `private.can_view_club_item`) so they cannot be called over the REST API. The Supabase security advisor flagged the public versions.
5. **Storage read access mirrors media visibility.** The `storage.objects` select policy joins `public.media`, so signing a URL through the user's own client is itself an authorisation check. The service role never signs member-facing URLs.
6. **Upload derivatives are made in the browser.** `thumb.webp` (400 px), `display.webp` (2000 px) and the video `poster.jpg` are generated client-side, and `/api/media/[id]/finalize` verifies the objects exist before marking the item `ready`. There is no Edge Function worker in v1. If a browser can't decode a file (for example HEVC `.mov` in Chrome), the original still uploads and the grid shows a placeholder. A backfill worker is future work.
7. **Albums are created as `draft`** and published explicitly once uploads finish. This matches the mockup's "album not yet published" state. The masterfile default was `published`.
8. **Added schema beyond §7:**
   - `media.display_path`
   - `media.sort_at` (generated, for keyset navigation)
   - `memberships.name_mismatch` and `grace_notices_sent`
   - `albums.published_at` and `created_by`
   - `clubs.roster_mapping`
   - `roster_imports.status` and `mapping`
   - `club_handle_redirects`
   - `auth_rate_events`
   - `pending_sign_ins`
   - views `album_media_counts` and `club_storage_usage`
9. **Removing a member who never signed in revokes immediately.** They had nothing to keep. Members who have signed in enter the 30 day grace window and get the day 1 email at removal. The daily Vercel Cron job sends day 7 and day 29 and revokes at the end.
10. **Club admins can read `access_events` for their club.** The masterfile says "no client reads", but the admin activity page needs it. Members can never read it, and inserts are server-only.
11. **Roster imports run in three steps.** Preview parses and stores the rows, a dry-run commit shows the counts and problem rows, and the final commit applies. People in grace or revoked who reappear in an import are restored.
12. **Mockup elements not built in v1:**
    - "Chosen members" visibility (decision 3 in the masterfile)
    - "Invite co-admin" (v2)
    - "Find yourself in this album" (v3)
    - the editable slug field (handles are generated, §7.1)
    - greyscale photo treatment (confirmed: real photos in colour)
13. **The unauthenticated `/signin?club=` panel shows only the club name and university.** It doesn't show the mockup's event or photo counts, so a shared link reveals nothing about activity.
14. **Screens not in the mockup were built from the design tokens:**
    - code entry
    - start a club
    - club switcher
    - admin overview
    - albums list
    - album editor (reuses the Upload screen)
    - settings
    - activity log
    - roster mapping dialog
    - privacy page
    - 404
15. **Zip download is deferred to v1.1**, as listed in §14. The grace banner asks members to save what they want via single downloads.
16. **Supabase free plan limit.** Uploads over 50 MB per file are rejected by Storage on the free plan. Clubs uploading video need the Pro plan (the file size limit is configurable up to 500 GB).
17. **Sessions:** the cookie `maxAge` is 30 days and is refreshed by `proxy.ts` on every navigation (rolling). "Sign out of all devices" uses `signOut({ scope: "global" })`.

## 2026-09-16 · Billing (Stripe)

18. **A club must be paid before admins can add members, create albums or upload** (Max chose "gate club creation behind payment"). The club is created first as `unpaid`, then step 2 of 4 is Stripe Checkout. Viewing is never gated, so members of a lapsed club keep seeing existing albums. Enforced in RLS by `private.club_can_write()` on album, media, membership and storage inserts, and repeated in server actions and routes for friendly errors.
19. **Checkout is created server-side from `STRIPE_PRICE_ID`**, not from the Buy Button, so every payment carries the club id in its metadata. Whether the price is one-off or recurring decides `payment` versus `subscription` mode.
20. **The club activates on the `checkout.session.completed` webhook**, and also when the admin lands back on the billing page with the session id. This means local dev works without webhook forwarding. Webhook events are stored in `stripe_events` for idempotency.
21. **Subscription status mapping:**
    - `active` and `trialing` → active
    - `past_due` → past_due (still writable while Stripe retries)
    - `unpaid`, `canceled`, `incomplete_expired` and `paused` → canceled
22. **Clubs that existed before billing were set to `comped`.** Super admins can comp a club with `update clubs set billing_status = 'comped'`.

## 2026-09-17 · v2 (design file `Klubbies v2.dc.html` + feedback doc)

23. **Roles replace the two fixed roles.** Every club gets Admin, Committee and Member, and admins can add their own (Treasurer and so on). A role carries five permissions: run the club, manage members, manage albums, add photos, post to the feed. `memberships.role` is kept in sync by a trigger so older admin checks keep working, and RLS now asks `private.club_perm(club_id, permission)`.
24. **Member statuses are described, not stored.** "Never logged in" is now shown as "Invited", and "Signed in" comes from `first_seen_at`. The status column keeps pending/active/grace/revoked.
25. **The album page is the member view for everyone.** Admins get "Edit album details" and "Add photos" buttons that open panels on the same page (`?edit=1`, `?add=1`). `/admin/[handle]/albums/[id]` redirects there. Feedback: admins should see what members see.
26. **Switching view keeps the page.** A `kb_area` cookie decides whether the admin nav is shown; the toggle sets it and returns to the same URL instead of bouncing to the overview.
27. **Albums can accept member contributions.** `albums.contributor_scope` is `managers` or `members`; the media insert policy uses `private.can_contribute_to_album()`.
28. **Covers can be uploaded.** `albums.cover_path` holds an uploaded image under `clubs/{club}/covers/`; picking a photo from the album still sets `cover_media_id`.
29. **Invitations are explicit.** A membership is an invitation until `accepted_at` is set. Members accept or decline from the club switcher, the club list or their profile.
30. **Club feed.** `posts`, `post_comments` and `post_reactions`, readable by members, postable by roles with `post_feed`. Comments are open to every member; admins can remove any. Direct messages between members are deliberately not built.
31. **Profile page at `/account`.** Display name, photo (stored under `avatars/{user}/`), bio, club list with "member since", invitations, email preferences, and an optional password.
32. **Password sign-in is optional, codes stay the default.** A member sets a password from their profile; `/api/auth/password_signin` verifies it and is rate limited like code verification.
33. **Per-club accent colour.** `clubs.accent_colour` is turned into an accent ramp at render time (`lib/theme.ts`) and applied to that club's pages only, with a reset to Klubbies red.
34. **Uploads survive navigation.** The upload queue lives in a provider above the pages with a progress tray, so an admin can keep browsing. Closing the tab still stops the transfer: true server-side ingestion is not built.
35. **Roster import can prune.** After a preview, the import lists current members who are missing from the file and offers to remove them, for clubs whose file is a full membership export.
36. **Empty grid cells no longer show as grey blocks.** Photo grids use a transparent background with gaps rather than a divider-coloured backdrop.
