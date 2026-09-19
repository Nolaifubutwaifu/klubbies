import Link from "next/link";
import type { ReactNode } from "react";
import { SoftBackdrop } from "@/components/soft/SoftBackdrop";
import { bandTiles } from "@/components/soft/photos";

/**
 * The sign-in screens, as the design draws them: one column, and a band of
 * other people's nights fading into the cream so the first thing you see is
 * what you're signing in for.
 *
 * `band` is for the screens someone arrives on cold. The steps after that
 * (a code, a decision) drop it — by then the photos have done their job and
 * the screen is about the thing in front of you.
 */
export function AuthShell({
  children,
  band = false,
  footer,
}: {
  children: ReactNode;
  band?: boolean;
  footer?: ReactNode;
}) {
  const tiles = bandTiles(6);

  return (
    <div className="theme-soft relative flex min-h-dvh flex-1 flex-col">
      <SoftBackdrop />
      <main className="relative z-10 mx-auto flex w-full max-w-[460px] flex-1 flex-col">
        {band ? (
          <div className="relative h-[244px] flex-none overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-[2px]">
              {tiles.map((tile, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- static marketing asset
                <img
                  key={`${tile.src}-${i}`}
                  src={tile.src}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: tile.pos }}
                />
              ))}
            </div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(43,34,40,0.42) 0%, color-mix(in srgb, var(--color-bg) 55%, transparent) 58%, var(--color-bg) 84%)",
              }}
            />
            <Link href="/" className="soft-wordmark absolute left-5 top-[22px] text-[22px] text-white no-underline">
              klubbies
            </Link>
          </div>
        ) : (
          <div className="px-5 pt-6">
            <Link href="/" className="soft-wordmark text-[20px] text-ink no-underline">
              klubbies
            </Link>
          </div>
        )}

        <div className={`relative flex flex-1 flex-col px-5 pb-6 ${band ? "-mt-[18px]" : "pt-2"}`}>{children}</div>

        {footer ? <div className="px-5 pb-6 text-center text-[12px] text-[color:var(--ink-55)]">{footer}</div> : null}
      </main>
    </div>
  );
}

/** One accent word in a heading, the way the soft theme marks its headlines. */
export function AuthHeadline({ children }: { children: ReactNode }) {
  return <h1 className="max-w-[13ch] text-[clamp(28px,8vw,32px)]">{children}</h1>;
}

/** The lilac aside that explains what's about to happen. */
export function AuthNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 flex gap-3 rounded-[18px] bg-[color:var(--tone-support)] px-4 py-3.5 text-[color:var(--tone-support-ink)]">
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        className="mt-0.5 flex-none"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 7.6v.1" />
      </svg>
      <p className="m-0 text-[13px]">{children}</p>
    </div>
  );
}
