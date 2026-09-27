# App Store Connect: everything to paste

Written 27 Sep 2026 for Klubbies 1.0 (build 1), bundle ID `app.klubbies.ios`. Work down the page in App Store Connect and copy each box. Character counts are checked against Apple's limits.

## 1. New app (Apps → + → New App)

| Field | Value |
|---|---|
| Platform | iOS |
| Name | `Klubbies` (if taken: `Klubbies: Club Photos`) |
| Primary language | English (Australia) |
| Bundle ID | `app.klubbies.ios` |
| SKU | `klubbies-ios` |
| User access | Full Access |

## 2. App Information

| Field | Value |
|---|---|
| Subtitle (30 max) | `Private photos for your club` (28) |
| Primary category | Photo & Video |
| Secondary category | Social Networking |
| Content rights | "Does your app contain, show, or access third-party content?" **Yes**. Members and committees upload their own photos and videos, and the terms require them to have the right to share it. |
| Privacy policy URL | `https://www.klubbies.app/privacy` |

## 3. Version 1.0 page

**Promotional text** (170 max, can change any time without review):

```
Your club's photos in one private place. Members sign in with the email on the club list, see every album from the year, and find the photos they're in.
```

**Description** (4000 max):

```
Klubbies is where a club keeps its photos and videos. Only people on the club's member list can sign in, so nothing is public and there is no link to forward.

FOR MEMBERS
- Every album from the year in one feed, newest first
- Save photos straight to your Photos app at full quality
- Photos of you: add one selfie and see every photo you appear in. Only you see your matches, and it's your choice to turn it on
- Get a notification when a new album goes up
- Ask for a photo of you to come down. It's hidden straight away while the committee decides

FOR COMMITTEES
- Import the member list from CSV or Excel each semester
- Upload a whole night of photos and video in one go, originals kept at full quality
- Send a hired photographer an upload link that only adds to one album
- Members who leave the list get 30 days to save their photos

HOW SIGN-IN WORKS
Members sign in with the email address their club has on its list. We email a one-time code, so there's no password to remember. Members can set a password later if they prefer.

Klubbies is for clubs that already use it. If your club isn't on Klubbies yet, a committee member can set it up at klubbies.app.

Photos, member lists and faceprints are stored in Sydney, Australia.
```

**Keywords** (100 max, commas, no spaces):

```
club,photos,uni,university,society,albums,event,private,sharing,sport,team,committee,gallery,faces
```

| Field | Value |
|---|---|
| Support URL | `https://www.klubbies.app/support` |
| Marketing URL | `https://www.klubbies.app` |
| Version | 1.0 |
| Copyright | `2026 Klubbies` |

**Screenshots:** 6.9 inch iPhone display, drag in the five files from `docs/app-store/screenshots/` in number order. Apple scales them for smaller iPhones.

## 4. App Review Information

| Field | Value |
|---|---|
| Sign-in required | Yes |
| User name | `appreview@klubbies.app` |
| Password | Open `.env.local` in the project folder and copy the value after `APP_REVIEW_PASSWORD=` |
| Contact | Your name, phone and email |

**Notes** (paste as is):

```
Klubbies is a private photo sharing app for university and sports clubs. A club's committee adds members by email on the website; only people on a club's list can sign in, so there is no public sign-up for content.

To sign in: on the Log in screen tap "Use a password instead", then enter the demo account above. It is a member of UniMelb FC, a demo club with example albums.

Things to try:
- Open an album and tap Save to Photos (saves straight to the Photos library, add-only permission).
- You tab > Notifications > iPhone notifications, to turn on notifications for new albums.
- Photos of you (face recognition) is optional: the member adds their own selfie and only they see their matches. Faceprints are made with Amazon Rekognition in Sydney.
- On any photo, "Ask for it to come down" hides it at once and notifies the committee. Terms of use include zero tolerance for objectionable content and a 24 hour response to reports.
- Account deletion: You tab > Delete my account.

Clubs subscribe on the website. The app has no purchases and no links to buy.
```

## 5. App Privacy

Privacy policy URL: `https://www.klubbies.app/privacy`

"Do you or your third-party partners collect data from this app?" **Yes**. Then tick these data types. For **every one** the answers are the same:

- Used for: **App Functionality** only
- Linked to the user's identity: **Yes**
- Used for tracking: **No**

| Category | Data type | Why we have it |
|---|---|---|
| Contact Info | Name | The name on the club list and the display name |
| Contact Info | Email Address | Sign-in and club emails |
| User Content | Photos or Videos | Albums, selfies for Photos of you, profile photo |
| User Content | Other User Content | Club feed posts, profile bio, photo removal requests |
| Sensitive Info | Sensitive Info | Faceprints (biometric data) for Photos of you |
| Identifiers | User ID | The account ID |
| Usage Data | Product Interaction | The club's access log of who viewed or downloaded what, shown to the committee |

Leave everything else unticked: no location, no health, no financial info in the app, no contacts, no browsing history, no search history, no diagnostics, no advertising data.

## 6. Age rating

Answer the questionnaire like this:

| Question | Answer |
|---|---|
| Violence (cartoon, realistic, graphic) | None |
| Sexual content, nudity | None |
| Profanity or crude humour | None |
| Alcohol, tobacco or drug use or references | None |
| Horror or fear themes | None |
| Mature or suggestive themes | None |
| Medical or treatment information | None |
| Gambling, contests | None |
| User-generated content | **Yes** |
| Messaging and chat | No |
| Advertising | No |
| Unrestricted web access | No |
| Parental controls, age assurance | No |

Apple works out the rating from these answers. Expect 13+ because of the user-generated content.

## 7. Pricing and availability

| Field | Value |
|---|---|
| Price | Free (A$0) |
| Availability | Australia to start. Add other countries when clubs there sign up. |
| In-app purchases | None |

## 8. Before you press Submit

- [ ] support@klubbies.app receives email (Forward Email setup, still open)
- [ ] APNs key added in Vercel and a test notification received (ios/README.md, section 5)
- [ ] A TestFlight build installed on your phone and signed in once
- [ ] Demo account signs in on that build with "Use a password instead"
