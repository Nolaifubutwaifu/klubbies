# QA report: iPhone app, sign-ins and speed

27 September 2026. Covers the new iPhone app (`ios/`), every way to sign in, and page speed.

**Result: everything tested works.** One stale test and one slow page were fixed along the way. Nothing blocks TestFlight. Four items block a public App Store release (see the end).

## How it was tested

| Where | What |
|---|---|
| Local production build (`pnpm build && pnpm start`, emails switched off) | Every sign-in route in a browser, page timings |
| Local dev server (port 3200) | The iPhone app in the iOS Simulator (iPhone 17, iOS 26.5) |
| https://www.klubbies.app | Public page timings, the hourly cron, production error logs |
| Automated | Typecheck, lint, 75 unit tests, 4 end-to-end tests |

Test accounts were throwaway addresses on `e2e.klubbies.test`, plus a throwaway club. All of them were deleted afterwards.

## Sign-ins

| Route | Result | Time |
|---|---|---|
| Email code, member on a club list | Pass. Lands on the club | Code request 0.12s, verify to club page 1.6s |
| Wrong code | Pass. "That code didn't match" | |
| Email not on any list | Pass. Same screen as a real member, and no email sent (nobody can probe who is on a list) | 0.05s |
| Club link (`/c/<club>`) while signed out | Pass. Club-branded login, no photos shown, back to the club after | 0.8s |
| Set a password (account page) | Pass | |
| Password sign-in | Pass | 0.5s |
| Wrong password | Pass. Generic "don't match" message | |
| Sign out | Pass. Account pages locked afterwards | |
| Start your club (new committee) | Pass. Code, then Name your club, then billing | 1.5s per step |
| Guest photographer link | Pass. Opens the upload page, and a broken link gets a clear message | 0.13s |
| Password sign-in inside the iPhone app | Pass | 0.35s |

## iPhone app

| Check | Result |
|---|---|
| Builds on Xcode 27 (debug and release), no warnings | Pass |
| Opens the site, keeps you signed in | Pass |
| Pull to refresh | Pass |
| Swipe from the left edge to go back | Pass |
| "Save to Photos" button shows in the app | Pass |
| Photos permission prompt, with our wording | Pass |
| Save to Photos writes straight into Photos | Pass. 3 of 3 photos in 2.4s |
| Album zip download opens the share sheet with Save to Files | Pass |
| Native confirm dialog (for example "Delete this album?") | Pass. OK returns true |
| Outside links open in an in-app Safari sheet | Pass |
| Offline screen, and Try again recovers | Pass |
| Billing page in the app: no payment buttons | Pass |
| Card page in the app: sends you back to billing | Pass |
| Admin banner and locked-feature cards in the app: no "Activate club" | Pass |
| Same pages in a phone browser: payment buttons still there | Pass |

## Speed

**Live site** (from Brisbane, three requests each):

| Page | Warm | First hit |
|---|---|---|
| Home | 0.14s | 0.23s |
| Sign in, Start | 0.12 to 0.15s | |
| Privacy, How it works | 0.10s | 0.40s |
| Guest link | 0.15s | 1.16s |

The "first hit" numbers are Vercel waking a function up. They only happen after a quiet spell.

**Signed-in pages** (local production build, server time):

| Page | Time |
|---|---|
| Your clubs | 0.10s |
| Account | 0.10s |
| Saved | 0.19s |
| Photos of you | 0.25s |
| Club feed | 0.38s |
| Club home | 0.40s |
| Album (169 photos) | 0.57s, was 0.73s |

## Fixed during testing

1. **Album page was the slowest page.** It waited for eight database lookups one after another. The independent ones now run together: 0.73s down to 0.57s.
2. **One end-to-end test was out of date.** It looked for an "Events" heading that the redesign removed. It now checks the club's name. All 4 pass.
3. **Payment prompts inside the app.** Beyond the billing page, the admin banner and the "Activate your club" cards also offered an "Activate club" button. In the app they now just say the club isn't active yet.

## Production checks

- The hourly cron ran on the live site at 16:00 UTC (2am Brisbane), exactly on the hour, status 200.
- No errors or crashes in production logs for the last 24 hours.

## Notes

- **Local testing only:** WebKit (Safari and the app) ignores `Secure` cookies on plain `http://localhost`, where Chrome allows them. The local production build marks the sign-in cookie `Secure`, so the app can't stay signed in against it. Use the dev server for local app testing. This can't happen on https://www.klubbies.app.
- **Password sign-in lands on "Your clubs"** even for someone in one club, while the code sign-in goes straight to the club. It's harmless, but the two routes are inconsistent.
- **The guest upload page uses an em dash** in its file types line (after "MP4, MOV"), which your writing rules avoid.

## Before a public App Store release

TestFlight doesn't need these. The App Store does.

1. **Account deletion inside the app.** Apple requires it for any app with sign-in. The account page currently says to ask a club admin.
2. **"Mostly a website" risk (guideline 4.2).** Save to Photos, downloads and the offline screen help. Push notifications for new albums would make the strongest case.
3. **App Privacy answers** in App Store Connect: email, name, photos and videos, and biometric data (faceprints).
4. **Store listing:** 6.9 inch screenshots, description, support URL, privacy policy URL.
