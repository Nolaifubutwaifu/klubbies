"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Most members open Klubbies on a phone at 11pm. Four destinations, thumb
 * height, always there — the design's tab bar, hidden once there's room for
 * the header nav instead.
 */
export function MemberTabBar({ handle }: { handle: string }) {
  const pathname = usePathname();
  const base = `/c/${handle}`;
  // The lightbox is full-bleed and carries its own actions; a tab bar over the
  // photo would be two rows of buttons arguing with each other.
  const inLightbox = new RegExp(`^/c/[^/]+/a/[^/]+/[^/]+`).test(pathname);

  const tabs: { href: string; label: string; icon: ReactNode; filled?: boolean; match: (p: string) => boolean }[] = [
    {
      href: base,
      label: "Home",
      match: (p) => p === base,
      icon: <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
    },
    {
      href: `${base}/feed`,
      label: "Club feed",
      match: (p) => p.startsWith(`${base}/feed`),
      icon: (
        <>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
          <path d="M7 9h10M7 13h6" />
        </>
      ),
    },
    {
      href: `${base}/saved`,
      label: "Saved",
      match: (p) => p.startsWith(`${base}/saved`),
      filled: true,
      icon: <path d="M12 20s-7-4.6-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />,
    },
    {
      href: "/account",
      label: "You",
      match: (p) => p.startsWith("/account"),
      icon: (
        <>
          <circle cx="12" cy="8.5" r="3.6" />
          <path d="M5 20c0-3.7 3.1-6 7-6s7 2.3 7 6" />
        </>
      ),
    },
  ];

  if (inLightbox) return null;

  return (
    <>
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color:var(--color-surface)] px-2.5 pb-[max(16px,env(safe-area-inset-bottom))] pt-2 sm:hidden"
      >
        {tabs.map((tab) => {
          const here = tab.match(pathname);
          const colour = here ? "var(--color-accent-700)" : "var(--color-neutral-700)";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={here ? "page" : undefined}
              className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-[3px] text-[14px] font-bold no-underline"
              style={{ color: colour }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={here && tab.filled ? colour : "none"}
                stroke={colour}
                strokeWidth={here && tab.filled ? 1.6 : 2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {tab.icon}
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {/* Keeps the last row of a page clear of the bar. */}
      <div aria-hidden className="h-[84px] sm:hidden" />
    </>
  );
}
