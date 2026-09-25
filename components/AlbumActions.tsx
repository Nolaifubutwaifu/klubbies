"use client";

import { useState, type ReactNode } from "react";

/**
 * The album header's buttons. On a wide screen they sit in one row. On a
 * phone six of them wrapped over three rows of a sticky header about 260px
 * tall, a third of the screen, so a phone gets the primary action and a
 * "More" that opens the rest. The children render once either way.
 */
export function AlbumActions({ primary, children }: { primary?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // Nothing to fold away without a primary: the rest is short enough to show.
  if (!primary) return <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">{children}</div>;
  return (
    <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
      {primary}
      <button
        type="button"
        className="soft-btn soft-btn-tonal !min-h-[44px] !text-[14px] sm:hidden"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Less" : "More"}
      </button>
      <div className={`${open ? "flex" : "hidden"} w-full flex-wrap items-center gap-2 sm:flex sm:w-auto`}>{children}</div>
    </div>
  );
}
