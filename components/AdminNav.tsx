"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ handle }: { handle: string }) {
  const pathname = usePathname();
  const base = `/admin/${handle}`;
  const links = [
    { href: base, label: "Overview", exact: true },
    { href: `${base}/members`, label: "Members" },
    { href: `${base}/albums`, label: "Albums" },
    { href: `${base}/roles`, label: "Roles" },
    { href: `${base}/activity`, label: "Activity" },
    { href: `${base}/settings`, label: "Settings" },
    { href: `${base}/billing`, label: "Billing" },
  ];
  return (
    <nav className="flex flex-wrap gap-1 border-b-2 border-divider bg-neutral-900 px-6 py-2">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className="px-[10px] py-[7px] text-[12px] font-semibold tracking-[0.04em] no-underline"
            style={{
              background: active ? "var(--color-accent)" : "transparent",
              color: active ? "#ffffff" : "var(--color-neutral-300)",
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
