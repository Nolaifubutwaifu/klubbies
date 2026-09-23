"use client";

import { useState, useTransition } from "react";
import { acknowledgeFaceNoticeAction } from "@/app/(app)/face-actions";
import { MEMBER_NOTICE } from "@/lib/faces/copy";

/**
 * Shown to every member of a club that has face recognition on, until they
 * acknowledge it once. Not a modal and not a blocker — they can read the club
 * around it — but it does not go away on its own, because "we told them" has
 * to mean something more than a banner they scrolled past.
 *
 * This is disclosure, not consent. Consent is enrolment, and enrolment stays
 * optional: a member can acknowledge this and never enrol, and most will.
 */
export function FaceNotice({ clubId, meHref }: { clubId: string; meHref: string }) {
  const [acked, setAcked] = useState(false);
  const [pending, startTransition] = useTransition();
  if (acked) return null;

  return (
    <section
      aria-label="Face recognition notice"
      className="mx-4 mb-4 flex flex-col gap-2.5 rounded-[var(--soft-r)] border-2 border-accent bg-[color:var(--color-surface)] p-4 sm:mx-6"
    >
      <span className="text-[15px] font-bold">{MEMBER_NOTICE.title}</span>
      <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-[13px] leading-normal text-[color:var(--ink-70)]">
        {MEMBER_NOTICE.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="soft-btn soft-btn-primary !min-h-[38px] !px-4 !text-[13px]"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await acknowledgeFaceNoticeAction(clubId);
              if (!res.error) setAcked(true);
            })
          }
        >
          {pending ? "Saving…" : MEMBER_NOTICE.tickbox}
        </button>
        <a href={meHref} className="text-[13px] font-bold text-accent-700 no-underline">
          What it would show me
        </a>
      </div>
    </section>
  );
}
