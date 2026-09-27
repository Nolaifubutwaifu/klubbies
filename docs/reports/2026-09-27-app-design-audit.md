# Design audit: the iPhone app, screen by screen

27 September 2026. Every main screen was opened in the iPhone app (iPhone 17 Pro Max Simulator, iOS 26.5) against the local dev server and the live database: as the Apple reviewer account (a member of the demo club UniMelb FC) and as the demo club's admin.

**Result: nothing blocks TestFlight.** Eleven problems found, all fixed in commit `e32a497` except the two listed at the end.

## Found and fixed

| # | Where | Problem | Fix |
|---|---|---|---|
| 1 | Every download on the website | The photo viewer's Download answered "Not found" for everyone, since v1. A database join between photos and albums was ambiguous. Saved's "Downloaded" list was always empty for the same reason. | Join named explicitly. An end-to-end test now covers it. |
| 2 | Save to Photos in the app | Saved the 2000px preview, and for a video only its still cover frame, while every page promises full quality. | Saves the original file, videos as videos. Same download rules and access log as the website. |
| 3 | Photo viewer in the app | "Download" went through the share sheet. | Now "Save", straight into Photos, with "Saved to Photos" confirmation. Tested. |
| 4 | Photo viewer in the app | Dark viewer between a cream status bar strip and a cream bottom strip. | The app takes the page colour for its edges and hides the status bar over the viewer, like Photos. |
| 5 | Every member page in the app | Website footer (How it works, Refunds...) under every screen. Refunds is about paying, which Apple doesn't allow to be pointed at. | Gone in the app. The profile keeps Privacy, Terms and Support. |
| 6 | Home, How it works, Refunds in the app | Reachable from the sign-in logo, and they show the price and "Start your club" sales copy. | In the app they go to "Your clubs" instead. |
| 7 | Privacy, Terms, Support in the app | Full website menu with Pricing, plus a Refunds tab. | Slim header with "Back to your clubs", no Refunds tab. |
| 8 | Admin pages in the app | "A$20 / month", "Activate the club" and "Splitting it with the committee?" on Settings, the sidebar and Setup; price line on Start your club. | Hidden in the app. Settings is called "Settings" there. |
| 9 | Admin menu on phones | Only Dashboard, Albums, Upload visible; Members, Guest links, Handover, Settings were off-screen with no hint. | Fades at the edge and scrolls the current page into view. |
| 10 | New album and guest link forms on iPhone | The date field was wider than the form and poked out. | Fixed for every date and time field. |
| 11 | Club home, "Find yourself" card | Text squeezed into a thin column beside the buttons, six lines deep. | Buttons drop under the text on phones. |

Also from the handoff: password sign-in lands where code sign-in does (checked in the app: straight to UniMelb FC), and a new member sees the club's invitation before its albums, so they actually join and get notifications. The feed no longer says "0 videos".

## Not fixed yet

- **Demo club content is thin.** 4 albums, 16 photos, an empty club feed. Waiting on a folder of photos from Max to build fuller albums, then the App Store screenshots.
- **The dev server is slow on this network** (5 to 13 seconds for signed-in pages). The live site answers in under half a second, so this only affects local testing.

## Checked and fine

Sign-in screen, Your clubs, club home, album, viewer, club feed, Saved, Photos of you, profile with notifications and account deletion, privacy page, admin dashboard, member list, albums, settings, billing ("Billing can't be changed in the iPhone app"), upload. The website itself is unchanged: full menu, pricing and Refunds are still there in a browser.

Automated: 84 unit tests and 8 end-to-end tests pass, typecheck and lint clean. The throwaway test clubs and accounts are gone from the database.
