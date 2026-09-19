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

## 2026-09-18 · Feedback update

37. **One login button.** The landing page has Start a club and Log in; admins sign in through the same form. The `?admin=1` variant is gone.
38. **Sign up from the login screen.** "First time here? Sign up" uses a new `signup` flow that sends a code to any address and lands on the club list, where invitations wait. A member who isn't on any list is told to ask their committee.
39. **Feed keeps posts and reactions, drops comments** (Max: leave comments out, keep a news feed). The `post_comments` table stays in the schema, unused, in case that changes.
40. **Notification emails.** Publishing an album and posting to the feed email the members who opted in, sent after the response with Resend batches. Every email carries a signed unsubscribe link plus `List-Unsubscribe` headers, and `/unsubscribe` needs one click to confirm so scanners can't switch it off by accident.
41. **Album download.** `/api/albums/[id]/zip` streams the originals as a zip, in parts of 150 files so one request stays inside the function limit. On phones, "Save to Photos" hands batches of eight files to the share sheet, which writes them straight into the Photos app; that only appears where the browser supports sharing files.
42. **Card details on our own page.** `/admin/[handle]/billing/card` uses Stripe Elements with a SetupIntent restricted to cards, then makes the new card the subscription default. Invoices and cancellation still go through Stripe's portal.
43. **Accent colour now reaches Tailwind utilities.** `bg-accent`, `text-accent-700` and friends resolve to the CSS variables, so a club's colour also covers boxes and links, not just the component classes.
44. **The nudge button is gone.**
45. **Visual pass.** Photo tiles zoom slightly on hover, stat cards carry an accent bar, the events page leads with a full-width hero (only when the newest album has a photo), rows alternate with the surface colour, dates sit in accent chips, and empty placeholders are accent-tinted rather than grey.

## 2026-09-18 · Soft theme rollout

46. **The soft theme replaced the modernist one across the product.** `/` is the
    new marketing home, the sign-in flow runs through the restyled `AuthSplit`,
    and everything under `(app)` is wrapped in `.theme-soft`. The old landing is
    kept at `/classic`, and the pre-redesign UI is tagged `design-v1-modernist`.
47. **Pages join the theme by being wrapped, not rewritten.** Two adoption
    layers in `globals.css` re-skin the existing classes inside `.theme-soft`:
    the component classes (`.btn`, `.input`, `.panel`, `.stat`, `.tag`,
    `.table`, `.dialog`, `.dropzone`, `.tile`) and the modernist border
    utilities (`border-2 border-divider` boxes become soft cards, 2px rules
    become hairlines). That is why the admin pages converted without touching
    their markup.
48. **No ghost or outline-only buttons.** `.btn-secondary` and `.btn-ghost` are
    filled tonal buttons in this theme.
49. **Type is Fredoka over DM Sans.** Fredoka carries the wordmark, headings and
    one accent word per heading; DM Sans does body and UI. Archivo stays for
    `/classic` only.
50. **Colour follows 60/30/10:** cream ground, lilac supporting surfaces,
    accent reserved for action. The per-club accent still overrides the ramp,
    so a club's pages take its colour.
51. **`EventsBrowser` and the `/preview` routes are gone.** `SoftEvents` is the
    events page for both members and admins.

## 2026-09-19 · Design artifact build-out (Klubbies Design canvas)

52. **The committee app has a rail, the member app has one too.** `AdminNav` is
    a sticky 248px sidebar on desktop (club badge, seven links with live counts,
    plan chip, who you are) and a scrolling row of the same links on a phone.
    `MemberSidebar` is its member twin: every club you're in, Saved, Club feed,
    profile. Below `lg` the member app falls back to `AppHeader` plus
    `MemberTabBar`, a four-tab bottom bar. The app shell widened from 1100px to
    1320px so a rail plus a three-column album grid still fits.
53. **Albums carry an event type.** `albums.event_type` is one of formal, sport,
    social, camp, night_out, other. It is a label, not a filter: it appears as a
    chip on every album card, the album header and the committee's album rows.
54. **Guest photographer links.** `album_guest_links` holds a sha-256 of a
    single-use upload token — never the token itself, so a leaked backup can't
    be replayed. `/g/<token>` is the only signed-out page in the product: one
    album, upload only, no roster and no other albums. The guest has no session,
    so `/api/guest/[token]/ticket` mints per-object signed upload URLs with the
    service role and the browser PUTs straight to storage; `media.guest_link_id`
    records which link a file came in on.
55. **Removal requests hide first and delete later.** A member's "Take it down"
    sets `media.hidden_at` at once (through a server action with the service
    role, so asking never becomes a way to edit a media row) and opens a
    `media_removal_requests` row. The committee confirms or restores within
    seven days; silence deletes it, swept by the same cron that publishes
    scheduled albums. One open request per photo — a second person asking is the
    same request.
56. **Upload is its own screen.** `/admin/[handle]/upload` is the design's New
    album: name, date, type, download and contribution switches, and a go-live
    time, then straight into the album's drop zone. `/admin/[handle]/albums` is
    now purely the list, with views, downloads and members per row from the new
    `album_engagement` view.
57. **Onboarding is a checklist you can come back to.** `/admin/[handle]/setup`
    reads the club's real state — name, handle, logo, roster, first album — and
    shows a progress bar instead of a wizard that traps you.
58. **Billing and settings are one screen**, with the two club-wide privacy
    switches (`clubs.allow_removal_requests`, `clubs.grace_period_enabled`)
    saved per toggle. Stripe's card and receipts stay on `/billing`.
59. **The lightbox is the one dark screen.** It pins itself to the window
    (`fixed inset-0`) so the page behind can't add height underneath, drops the
    rail, the tab bar and the footer, and carries its own filmstrip and four
    actions: Favourite, Original, Details, Take it down.
60. **Loading is a skeleton, never a spinner** (`.soft-skeleton`), in the shape
    the page will keep.
61. **`scripts/demo.ts` builds the design's fictional club** — UniMelb FC,
    @umfc, six albums with real photos from `design/source-photos` — so the
    screens can be checked with content in them. Safe to re-run.

## 2026-09-19 · The last artboards

62. **The sign-in screens follow the design, not the split.** `AuthShell`
    replaces `AuthSplit`: one column, and on the screens someone arrives on
    cold (`/signin`, `/start`) a band of event photos fading into the cream.
    The code step drops the band — by then the photos have done their job.
63. **Eight code boxes, because Supabase mints eight digits.** They advance as
    you type, take a pasted code in any box, and submit themselves once full.
    A wrong code clears the row and returns to the first box.
64. **No "not on the roster" screen.** The neutral reply stays (masterfile
    §5.2.3): an address that is on a list and one that isn't get the same
    answer, which is what stops someone probing a roster. The help that screen
    carried — try your uni email, then ask your committee — now sits on the
    code screen under "Nothing arrived at all?", where it reaches the same
    person without confirming anything.
65. **Members see what is still processing.** RLS only admits `status =
    'ready'` to a member, so the album page counts the unfinished files with
    the service role *after* the membership check and renders a banner plus
    placeholder tiles. A count of files in an album they can already open, and
    no more than that.
66. **Selecting several photos is everyone's.** "Select photos" is no longer
    committee-only. The bar offers Favourite and Download to any member
    (`favouriteManyAction`, and the `?only=` zip), and adds Use as cover and
    Delete for people who can manage albums.
67. **A club with no albums gets its own screen**, not a "no matches" card:
    two empty photo cards and one button that turns on the new-album email
    (`notifyOnNewAlbumsAction`) without sending anyone to their profile.

## 2026-09-20 · First production deploy

68. **The publishing cron is daily, under protest.** Vercel's Hobby plan
    allows one cron run per day, so `vercel.json` is back to `0 23 * * *`
    (9am Melbourne) rather than the hourly pass commit 87cac76 introduced.
    The consequence is real: an album scheduled for Saturday 10am goes live
    on Sunday morning, so the schedule control now offers 9am and the copy
    promises "the first morning after this time" instead of "on the hour".
    Grace expiry and the seven day removal sweep don't mind a daily pass;
    scheduling is the only part that does. Restoring it is a one line change
    in `vercel.json` plus the three strings named in the README, and there is
    a `TODO(vercel-pro)` on the cron route.

## 2026-09-20 · Design system v2

69. **Fredoka stops at 700, so headings must too.** `globals.css` asked for
    `font-weight: 900` on every heading, `.soft-sticker` and `.soft-btn`, and
    `next/font` only loads Fredoka 400–700. Every heading in the app was a
    browser-synthesised faux bold — thickened strokes with the rounded
    terminals smeared off, which is the one thing you should never do to a
    rounded face. All 900s are now 700, and the `font-extrabold`/`font-black`
    utilities sitting on `font-heading` came down with them.
70. **Archivo is gone, and it was not unused.** `--font-heading` pointed at
    Archivo, so the seven `font-heading` utilities in ClubSwitcher, BillingGate,
    LegalPage, the feed and AlbumEditPanel were rendering a third typeface
    nobody intended, inside pages set in Fredoka. `--font-heading` now points
    at Fredoka and `--font-body` at DM Sans, so the Tailwind aliases mean what
    they say.
71. **One warm ink at four depths, replacing two neutral systems.** The
    Tailwind `neutral` scale was hardcoded hex from the deleted Modernist
    theme, so `text-neutral-700` emitted a cold `#605d5d` and ignored
    `.theme-soft`'s warm override — three different inks were rendering on the
    club home at once. The scale now points at the CSS variables, `ink` is
    theme-aware, and `text-ink / ink-70 / ink-55 / ink-35` replaced every
    `text-neutral-*` across 21 files.
72. **60 / 30 / 10, with a brand colour that is not the accent.** Cream is the
    60 and the club's own accent keeps the 30 — it still drives headline
    emphasis, chips, eyebrows and section bands. The 10 is a new global violet
    `--brand: #5b2bd6`, used for primary buttons, checked controls and focus
    rings and nothing else. It is the lilac's own ink `#43335c` at full
    saturation, so it already belonged to the family. It also fixes a real
    failure: the old primary gradient started at `#ff563c`, which is 3.16:1
    with white text and below AA. The violet runs 7.6:1.
    *Consequence:* the club colour no longer drives primary buttons, so the
    Settings copy that promises "buttons, tags and highlights" needs a pass.
73. **Three button tiers, all solid fills.** No outlines and no transparent
    buttons — they separate on colour, size and weight, so the ladder survives
    greyscale. Tier 1 is brand violet at 48px, tier 2 the club accent mixed to
    55% with white (accent-800 ink on it clears 4.5:1) at 44px, tier 3 the
    lilac deepened to `#ded0f4` at 40px, 44px on a coarse pointer. The honest
    limit: on a cream ground no pale fill can clear WCAG's 3:1 for a control
    edge — tier 3 reaches 1.45:1, up from the old `#f1e9fb`'s 1.12:1. So the
    rule is **a tier-3 button is never the only button in a group**; a lone
    action is tier 2 or higher.
74. **Native controls are styled on the element, not per component.** One block
    inside `.theme-soft` restyles every `select`, `checkbox`, `radio` and date
    input in the app, which is why the inline `accentColor`/`width`/`height`
    styles came out of thirteen components. The native element is kept in all
    cases, so mobile still gets the OS picker wheel and date sheet.
75. **The club home opens on content, not chrome.** On a 375px screen the first
    album used to start at 470px of 812, behind a greeting, a search field, two
    buttons and a date filter on three separate rows. The club name now takes
    the H1 (the greeting folds into the meta line, since a member in four clubs
    needs to know which one this is), the date filter shares the search row,
    *Saved* leaves the header because it is already in the sidebar and the tab
    bar, and *New album* becomes a floating button on phones. The grid is 2-up
    at 4:5 on mobile. First album now lands at ~250px.
76. **TODO — the second display voice is still unresolved.** The audit found
    that the emphasised word in every headline is marked by colour alone, which
    disappears in greyscale and competes with the category chips using the same
    red. The fix is a second display face applied to that word via a
    `--font-accent` token and the existing `.soft-word` class. Fraunces,
    Syne, Big Shoulders Display, Unbounded, Archivo Black, Familjen Grotesk and
    Instrument Serif were all rejected on looks. **Nothing has been implemented
    — `.soft-word` is still colour-only.** Pick a face, add it to
    `app/layout.tsx`, and give `.soft-word` a `font-family`. Until then the
    headline emphasis carries one signal where it should carry two.
