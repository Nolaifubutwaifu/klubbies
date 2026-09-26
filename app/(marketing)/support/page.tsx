import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Support" };

// Also the App Store listing's support URL, so it has to answer the things
// Apple's reviewers look for: how to get help, how to report content, how to
// delete an account.
export default function SupportPage() {
  return (
    <LegalPage
      doc="support"
      title="Support"
      updated="27 September 2026"
      minutes={2}
      sections={[
        {
          title: "Get help",
          body: (
            <p>
              For anything about Klubbies, on the website or in the iPhone app, <ContactLine />. Tell us your club&apos;s
              name and what you were trying to do. We reply within two working days, and within 24 hours to a report of
              objectionable content.
            </p>
          ),
        },
        {
          title: "Can't sign in",
          body: (
            <p>
              Use the email address your club has on its member list; the code only goes to addresses on a list. Codes
              work for ten minutes, so ask for a new one if it has expired. Still nothing? Ask your committee to check
              your email on the list, then look in your spam folder.
            </p>
          ),
        },
        {
          title: "Report a photo or a person",
          body: (
            <>
              <p>
                If you&apos;re in a photo you want gone, open it and choose Take it down. It is hidden from everyone
                straight away while the committee decides, and removed if they haven&apos;t answered within 7 days.
              </p>
              <p>
                For anything else, such as a photo that shouldn&apos;t be there or someone behaving badly, tell your
                committee: they can remove any photo or post and take anyone off the member list. If it&apos;s serious or
                the committee won&apos;t act, <ContactLine />. We remove objectionable content, and the person who posted
                it where warranted, within 24 hours.
              </p>
            </>
          ),
        },
        {
          title: "Delete your account",
          body: (
            <p>
              Open your profile and choose Delete my account, in the app or on the website. The{" "}
              <Link href="/privacy">privacy policy</Link> explains what that deletes and what stays with your club.
            </p>
          ),
        },
        {
          title: "Notifications",
          body: (
            <p>
              In the iPhone app, turn notifications on from your profile. You get one for each kind of email ticked
              there, so unticking New albums stops both. To stop them entirely, turn them off for Klubbies in iPhone
              Settings.
            </p>
          ),
        },
        {
          title: "Billing",
          body: (
            <p>
              The app doesn&apos;t sell anything. For a club&apos;s subscription, cancelling and refunds are covered in the{" "}
              <Link href="/refunds">refund and cancellation policy</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
