import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <LegalPage
      doc="terms"
      title="Terms of service"
      updated="27 September 2026"
      minutes={4}
      sections={[
        {
          title: "Who we are",
          body: (
            <p>
              Klubbies is a private photo and video sharing service for clubs, operated from Queensland, Australia, on the
              web and as an iPhone app. By creating a club, signing in, or paying for Klubbies you agree to these terms. To
              contact us, <ContactLine />.
            </p>
          ),
        },
        {
          title: "Clubs, admins and members",
          body: (
            <>
              <p>
                A club admin creates a club, manages its member list and uploads media. Admins are responsible for keeping
                the member list accurate and for removing people who should no longer have access.
              </p>
              <p>
                Members sign in with the email address on their club&apos;s list and a one-time code. Don&apos;t share codes
                or let other people use your access.
              </p>
            </>
          ),
        },
        {
          title: "Your content",
          body: (
            <>
              <p>
                Clubs keep ownership of everything they upload. You give us permission to store, copy (for previews),
                and show that content to the people on your member list, only so we can run the service.
              </p>
              <p>
                By uploading, the admin confirms the club has the right to share the content with its members, and that
                people who appear in it would reasonably expect it to be shared with the club. Remove content promptly
                if someone asks you to.
              </p>
            </>
          ),
        },
        {
          title: "Acceptable use",
          body: (
            <>
              <p>
                Don&apos;t upload or post anything unlawful, sexually explicit, hateful, or intended to harass or
                embarrass someone, and don&apos;t use Klubbies to share content with people outside your club, to probe
                other clubs&apos; data, or to overload the service.
              </p>
              <p>
                There is no tolerance for objectionable content or abusive people. We may remove content, remove a person
                or suspend a club that breaks these rules, without notice.
              </p>
            </>
          ),
        },
        {
          title: "Reporting content",
          body: (
            <p>
              Anyone in a photo can open it and choose Take it down: it is hidden from everyone straight away while the
              committee decides. A committee can remove any photo or post, and anyone from its member list. For
              anything the committee won&apos;t handle, or that is serious, <ContactLine />. We act on reports of
              objectionable content within 24 hours, by removing the content and, where it is warranted, the person who
              posted it. More on the <Link href="/support">support page</Link>.
            </p>
          ),
        },
        {
          title: "Your account",
          body: (
            <p>
              You can delete your account at any time from your profile, in the app or on the website. The{" "}
              <Link href="/privacy">privacy policy</Link> explains what that deletes and what stays with your club.
            </p>
          ),
        },
        {
          title: "Access logging",
          body: (
            <p>
              We record when members view and download items, and club admins can see that log. The{" "}
              <Link href="/privacy">privacy policy</Link> explains what is stored.
            </p>
          ),
        },
        {
          title: "Payment",
          body: (
            <p>
              Clubs pay a subscription through Stripe before they can add members or upload. Prices include GST where
              applicable. Cancellation and refunds are covered in the <Link href="/refunds">refund and cancellation policy</Link>.
            </p>
          ),
        },
        {
          title: "Availability and liability",
          body: (
            <>
              <p>
                We work to keep Klubbies available and your media safe, but we can&apos;t promise the service will be
                uninterrupted or error free. Keep your own copies of anything irreplaceable.
              </p>
              <p>
                Nothing in these terms excludes rights you have under the Australian Consumer Law. To the extent the law
                allows, our total liability to a club is limited to the fees it paid us in the 12 months before the claim.
              </p>
            </>
          ),
        },
        {
          title: "Ending the service",
          body: (
            <p>
              A club can cancel at any time. If a club is cancelled or suspended, we&apos;ll give the admin at least 30
              days&apos; notice by email before deleting its media, so they can download what they want to keep.
            </p>
          ),
        },
        {
          title: "The iPhone app",
          body: (
            <p>
              If you use the Klubbies iPhone app, Apple&apos;s standard Licensed Application End User License Agreement
              applies alongside these terms. These terms are between you and us, not Apple: Apple has no responsibility
              for the app, its content, its maintenance or support, or any claim about it. The app doesn&apos;t sell
              anything.
            </p>
          ),
        },
        {
          title: "Changes and governing law",
          body: (
            <p>
              We&apos;ll email club admins before making material changes to these terms. These terms are governed by the
              laws of Queensland, Australia.
            </p>
          ),
        },
      ]}
    />
  );
}
