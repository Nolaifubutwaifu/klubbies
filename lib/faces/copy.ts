// The three pieces of face recognition copy, versioned together with
// CONSENT_VERSION and CLUB_NOTICE_VERSION in constants.ts. If the wording
// shifts materially, bump the version and re-prompt rather than quietly
// treating an old consent as covering new text.
//
// Drafts, written to be checked by someone qualified. Not legal advice.

export const MEMBER_CONSENT = {
  title: "Find yourself in club photos",
  lead: "Klubbies can look for your face in this club's photos and show you the ones you appear in.",
  what: "To do that we create a mathematical description of your face, called a faceprint, from the selfie you give us, and compare it against faces in photos this club has uploaded. That faceprint is biometric information.",
  points: [
    "Only you see your matches. Nobody else can search the photos for you, including the committee.",
    "It will not always be right. Dim lighting, crowds and motion blur cause both misses and occasional wrong matches. Tap “Not me” on anything wrong.",
    "You can turn it off whenever you like. That deletes your selfie, your faceprint and every match within 24 hours.",
  ],
  tickbox: "I consent to Klubbies creating and storing a faceprint from my selfie for this purpose.",
} as const;

export const CLUB_NOTICE = {
  title: (club: string) => `Turning on face recognition for ${club}`,
  lead: "This analyses faces in every photo your club has already uploaded, and every photo uploaded from now on.",
  points: [
    "It applies to everyone in your photos, not only members who opt in. That includes guests, plus-ones and members who never enrol.",
    "A faceprint is created for each face and stored with Amazon Web Services in Sydney until the photo is deleted.",
    "Only members who enrol with their own selfie can be identified, and each of them sees only their own photos. You cannot search for a member by face. Neither can we.",
    "You are responsible for telling your members this is on. We show them a notice, but the relationship is yours.",
    "Turning it off deletes every faceprint for this club.",
  ],
  tickbox: (club: string) => `I have read this and I have authority to turn it on for ${club}.`,
} as const;
