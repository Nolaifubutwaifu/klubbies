import Link from "next/link";

/** Closes off the page so content doesn't fade into empty background. */
export function AppFooter() {
  return (
    <footer className="mt-auto border-t-2 border-divider bg-surface">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-5 text-[13px] text-neutral-700">
        <span className="font-heading font-extrabold tracking-[-0.02em] text-ink">klubbies</span>
        <span>Your club&rsquo;s photos, for your club only.</span>
        <span className="flex flex-wrap gap-x-4 gap-y-2 sm:ml-auto">
          <Link href="/how-it-works" className="text-neutral-700 no-underline hover:text-accent">
            How it works
          </Link>
          <Link href="/privacy" className="text-neutral-700 no-underline hover:text-accent">
            Privacy
          </Link>
          <Link href="/terms" className="text-neutral-700 no-underline hover:text-accent">
            Terms
          </Link>
          <Link href="/refunds" className="text-neutral-700 no-underline hover:text-accent">
            Refunds
          </Link>
        </span>
      </div>
    </footer>
  );
}
