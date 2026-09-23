"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { decideFaceMatchAction } from "@/app/(app)/face-actions";
import type { Suggestion } from "@/lib/faces/queries";

/**
 * The crop is done here, from the already-signed display image, using the
 * stored bounding box. We deliberately do not generate and store face crops:
 * that is a second pile of biometric-adjacent files to secure and delete.
 */
function FaceCrop({ suggestion }: { suggestion: Suggestion }) {
  const box = suggestion.box;
  if (!suggestion.displayUrl || !box) {
    return <span className="block h-[104px] w-[104px] rounded-[16px] bg-[color:var(--color-neutral-300)]" />;
  }
  // Widen the box a little: Rekognition's is tight to the face, and a crop
  // with no hair or chin in it is oddly hard to recognise yourself in.
  const pad = 0.6;
  const width = Math.min(1, box.Width * (1 + pad));
  const height = Math.min(1, box.Height * (1 + pad));
  const scale = 1 / Math.max(width, height);

  return (
    <span className="relative block h-[104px] w-[104px] overflow-hidden rounded-[16px] bg-[color:var(--color-neutral-200)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
      <img
        src={suggestion.displayUrl}
        alt=""
        className="absolute max-w-none origin-top-left"
        style={{
          width: `${scale * 100}%`,
          left: `${-(box.Left - (width - box.Width) / 2) * scale * 100}%`,
          top: `${-(box.Top - (height - box.Height) / 2) * scale * 100}%`,
        }}
      />
    </span>
  );
}

export function Suggestions({
  handle,
  suggestions,
  total,
}: {
  handle: string;
  suggestions: Suggestion[];
  /** Every suggestion waiting, not just the ones on screen. */
  total: number;
}) {
  const [decided, decide] = useOptimistic<string[], string>([], (state, id) => [...state, id]);
  const [, startTransition] = useTransition();
  const remaining = suggestions.filter((s) => !decided.includes(s.matchId));

  if (remaining.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="soft-display text-[19px]">Is this you?</h2>
        <p className="m-0 text-[13px] text-[color:var(--ink-70)]">
          Saying yes helps us recognise you next time. Saying no means we never suggest that photo again.
          {total > suggestions.length
            ? ` ${total.toLocaleString("en-AU")} waiting — answer these and the next ones appear.`
            : ""}
        </p>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
        {remaining.map((suggestion) => (
          <div key={suggestion.matchId} className="soft-card flex w-[168px] flex-none flex-col gap-2 p-3">
            {suggestion.albumId ? (
              <Link href={`/c/${handle}/a/${suggestion.albumId}/${suggestion.mediaId}`} className="self-center">
                <FaceCrop suggestion={suggestion} />
              </Link>
            ) : (
              <span className="self-center">
                <FaceCrop suggestion={suggestion} />
              </span>
            )}
            <span className="truncate text-[12px] text-[color:var(--ink-55)]">{suggestion.albumTitle}</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                className="soft-btn soft-btn-primary flex-1 !min-h-[34px] !px-2 !text-[12px]"
                onClick={() =>
                  startTransition(async () => {
                    decide(suggestion.matchId);
                    await decideFaceMatchAction(suggestion.matchId, "confirm");
                  })
                }
              >
                Yes
              </button>
              <button
                type="button"
                className="soft-btn soft-btn-tonal flex-1 !min-h-[34px] !px-2 !text-[12px]"
                onClick={() =>
                  startTransition(async () => {
                    decide(suggestion.matchId);
                    await decideFaceMatchAction(suggestion.matchId, "reject");
                  })
                }
              >
                Not me
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
