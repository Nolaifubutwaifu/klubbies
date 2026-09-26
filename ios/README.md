# Klubbies for iPhone

A native iPhone app that runs Klubbies from https://www.klubbies.app. Anything you change on the website shows up in the app straight away. You only need a new build when something in this `ios/` folder changes.

What the app adds on top of the website:

- **Save to Photos** saves album photos straight into the Photos app, with no share sheet step.
- **Downloads** (album zips, member exports) open the share sheet, where Save to Files lives.
- Pull down to refresh, and swipe from the left edge to go back.
- Real iOS pop-ups for confirmations such as "Delete this album?".
- An offline screen with Try again, for venues with no signal.
- **Notifications** for new albums and feed posts. Tapping one opens the album or the feed.
- **Delete my account** on the profile, as Apple requires.
- Links to other websites open in an in-app Safari sheet.
- Sign-in is remembered between launches.
- Inside the app, the billing page shows the club's status but no payment buttons. Apple rejects apps that sell subscriptions outside in-app purchase, so clubs pay on the website.

| Setting | Value |
|---|---|
| Bundle ID | `app.klubbies.ios` |
| Version | 1.0 (build 1) |
| Minimum iOS | 17.0 |
| Devices | iPhone only, portrait |

## 1. Open the project

Double-click `ios/Klubbies.xcodeproj`. Xcode opens it.

## 2. Sign in to your developer account (once)

1. Xcode menu → **Settings** → **Accounts**.
2. Click **+** → **Apple Account**, and sign in with your paid Apple Developer account.

## 3. Choose your team (once)

1. In the left sidebar click the blue **Klubbies** project icon, then the **Klubbies** target.
2. Open the **Signing & Capabilities** tab.
3. Leave **Automatically manage signing** ticked.
4. Set **Team** to your paid team. Xcode registers the bundle ID `app.klubbies.ios` for you.

If Xcode says the bundle ID is taken, change it to something like `app.klubbies.iphone` and use the new one in step 5.

## 4. Put it on your phone

1. Plug your iPhone into the Mac and tap **Trust** on the phone.
2. On the phone: **Settings** → **Privacy & Security** → **Developer Mode** → on. The phone restarts.
3. In Xcode's top bar, pick your iPhone as the run destination.
4. Press **⌘R** (or the play button). The app installs and opens.

## 5. Turn on notifications (once)

The app and the website are ready. Apple needs a key so the website is allowed to send notifications:

1. Go to https://developer.apple.com/account → **Certificates, Identifiers & Profiles** → **Keys** → **+**.
2. Name it `Klubbies push`, tick **Apple Push Notifications service (APNs)**, then **Continue** → **Register**.
3. **Download** the `.p8` file (you can only download it once) and note the **Key ID** shown on that page.
4. Your **Team ID** is at the top right of the developer site, or under Membership details.
5. In Vercel → klubbies → Settings → Environment Variables, add for Production:
   - `APNS_KEY_ID`: the Key ID
   - `APNS_TEAM_ID`: the Team ID
   - `APNS_PRIVATE_KEY`: open the .p8 file in TextEdit and paste the whole contents, including the BEGIN and END lines
6. Redeploy (Deployments → the latest one → Redeploy).

Until those are set, everything works except that nothing is sent. Xcode adds the Push Notifications capability to the app ID by itself when you pick your team, because the project already asks for it.

## 6. TestFlight

### Create the app in App Store Connect (once)

1. Go to https://appstoreconnect.apple.com → **Apps** → **+** → **New App**.
2. Fill in:
   - Platform: **iOS**
   - Name: **Klubbies** (if it's taken, try **Klubbies: Club Photos**)
   - Primary language: **English (Australia)**
   - Bundle ID: **app.klubbies.ios**. It appears here after step 3 above. If it doesn't, register it at https://developer.apple.com/account → Identifiers.
   - SKU: **klubbies-ios**
   - User access: **Full Access**

### Upload a build

1. In Xcode's top bar, set the destination to **Any iOS Device (arm64)**.
2. Menu → **Product** → **Archive**. It takes a minute or two, then the Organizer window opens.
3. Click **Distribute App** → **App Store Connect** → **Distribute**. Keep the defaults, including automatic build number handling.
4. Apple processes the build, which usually takes 10 to 30 minutes. You get an email when it's ready.

### Test it

- **Just you and your team (no review):** App Store Connect → your app → **TestFlight** → **Internal Testing** → **+** → add yourself. Install the **TestFlight** app on your phone from the App Store and accept the invite.
- **Other people by email or public link:** add an **External Testing** group. The first build goes through Beta App Review, usually within a day. Under **Test Information**, give reviewers a sign-in: an email and password for a demo account (they use **Use a password instead**), plus one line on what Klubbies is.

### Every later upload

Each upload needs a higher build number. The automatic option in step 3 handles that. For a new public version, change **Version** under the target's **General** tab (1.0 → 1.1).

## Before the App Store (not needed for TestFlight)

Done in the app and on the site:

- Account deletion inside the app (profile → Delete my account).
- Notifications, plus Save to Photos, downloads and the offline screen: native features beyond the website, which is what guideline 4.2 asks for.
- Privacy policy, terms (with the content rules Apple asks apps with uploads to include), and a support page at https://www.klubbies.app/support.
- No payment buttons inside the app.

Still for you, in App Store Connect:

1. **App Privacy.** Data linked to the user, used for app functionality, not for tracking: Contact Info (email address, name), User Content (photos or videos), Sensitive Info (biometric data: the face recognition faceprints), Identifiers (user ID). No tracking, no third-party advertising.
2. **Age rating.** Answer the questionnaire; say yes to user-generated content. Expect 13+ or similar.
3. **URLs.** Support URL `https://www.klubbies.app/support`, privacy policy URL `https://www.klubbies.app/privacy`.
4. **App Review notes.** Give a demo account that signs in with **Use a password instead**, in a club that has photos. Explain that Klubbies is for private clubs, that members are added by their committee, and that clubs subscribe outside the app.
5. **Screenshots** for the 6.9 inch iPhone (1320 × 2868) and a description.
6. **support@klubbies.app has to receive email**, since it's on every legal page. See the steps in the chat, or ask Claude again.

One risk to know about: Apple sometimes also expects a way to **block** another user in apps with user content. Klubbies has reporting (Take it down), committee removal and a 24 hour promise, which suits a private club app, but a reviewer could still ask for blocking. If they do, it's a contained addition.

## What's in here

| File | What it does |
|---|---|
| `Klubbies/AppConfig.swift` | Start URL, which domains stay in the app, the colours |
| `Klubbies/WebViewController.swift` | The web view, links, downloads, pop-ups, pull to refresh |
| `Klubbies/PhotoSaver.swift` | Save to Photos (the site calls it through `lib/native-app.ts`) |
| `Klubbies/PushManager.swift` | Notifications: permission, device token, opening the right page on a tap |
| `Klubbies.entitlements` | Lets the app receive notifications |
| `Klubbies/OfflineView.swift` | The "Can't reach Klubbies" screen |
| `Klubbies/Assets.xcassets` | App icon and colours |
| `Klubbies/PrivacyInfo.xcprivacy` | Apple's privacy manifest |
| `Info.plist` | App name and the text iOS shows when it asks for camera and Photos access |

The app adds `KlubbiesApp/<version>` to its user agent. The website uses that to know it is inside the app (`lib/native-app.ts`). Keep the two in step if either changes.
