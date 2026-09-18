"use client";

import { useState, useTransition } from "react";
import { toggleFavouriteAction } from "@/app/(app)/c/[handle]/actions";

/**
 * Heart toggle for one photo. Settles optimistically and rolls back if the
 * write is refused, so a tap always feels immediate.
 */
export function FavouriteButton({
  mediaId,
  initial,
  tone = "light",
}: {
  mediaId: string;
  initial: boolean;
  /** "dark" for the lightbox, where the button sits on the photo. */
  tone?: "light" | "dark";
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const res = await toggleFavouriteAction(mediaId);
      setOn(res.favourited);
    });
  };

  const dark = tone === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={on}
      aria-label={on ? "Remove from Saved" : "Save to your favourites"}
      className={`soft-btn ${
        dark ? "!bg-white/16 !text-white" : on ? "soft-btn-primary" : "soft-btn-tonal"
      } !min-h-[44px] !px-4 !text-[14px]`}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={on ? 1.6 : 2.2}
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 20s-7-4.6-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />
      </svg>
      {on ? "Saved" : "Save"}
    </button>
  );
}
