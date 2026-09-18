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
    <nav className="flex flex-wrap gap-2 px-4 pb-2 pt-3 sm:px-6">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`soft-chip no-underline ${active ? "" : "soft-chip-muted"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
