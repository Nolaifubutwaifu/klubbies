"use client";

import { useState, useTransition } from "react";
import {
  disableClubFacesAction,
  enableClubFacesAction,
  runFaceJobsAction,
} from "@/app/(app)/face-actions";
import { CLUB_NOTICE } from "@/lib/faces/copy";

type Props = {
  clubId: string;
  clubName: string;
  configured: boolean;
  enabled: boolean;
  enrolledCount: number;
  backfill: { total: number; remaining: number; status: string };
};

/**
 * Not a switch. Turning this on creates a faceprint for everyone in the
 * club's photos, including people who never opted in, so the committee reads
 * what that means and ticks a box before anything happens.
 */
export function FaceRecognition({ clubId, clubName, configured, enabled, enrolledCount, backfill }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [confirmingOff, setConfirmingOff] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  if (!configured) {
    return (
      <div className="soft-card flex flex-col gap-2 p-5">
        <span className="text-[14px] font-bold">Find yourself in photos</span>
        <p className="m-0 text-[13px] text-[color:var(--ink-70)]">
          Not available on this deployment yet. It needs AWS credentials set on the server.
        </p>
      </div>
    );
  }

  if (enabled) {
    const done = Math.max(0, backfill.total - backfill.remaining);
    return (
      <div className="soft-card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[14px] font-bold">Find yourself in photos</span>
          <span className="soft-chip">On</span>
        </div>
        <p className="m-0 text-[13px] text-[color:var(--ink-70)]">
          {enrolledCount === 0
            ? "No members have enrolled yet. They see the invitation on the club page."
            : `${enrolledCount.toLocaleString("en-AU")} ${enrolledCount === 1 ? "member has" : "members have"} enrolled. Each of them sees only their own photos.`}
        </p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span>{backfill.remaining > 0 ? "Working through your library" : "Library up to date"}</span>
            <span className="text-[color:var(--ink-55)]">
              {done.toLocaleString("en-AU")} of {backfill.total.toLocaleString("en-AU")}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${backfill.total ? Math.round((done / backfill.total) * 100) : 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="soft-btn soft-btn-tonal !min-h-[38px] !px-4 !text-[13px]"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await runFaceJobsAction(clubId);
                setMessage(res.error ?? res.message ?? "");
              })
            }
          >
            {pending ? "Running…" : "Run now"}
          </button>
          {confirmingOff ? (
            <>
              <button
                type="button"
                className="soft-btn soft-btn-primary !min-h-[38px] !px-4 !text-[13px]"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await disableClubFacesAction(clubId);
                    setMessage(res.error ?? res.message ?? "");
                    setConfirmingOff(false);
                  })
                }
              >
                Yes, delete every faceprint
              </button>
              <button
                type="button"
                className="soft-btn soft-btn-tonal !min-h-[38px] !px-4 !text-[13px]"
                onClick={() => setConfirmingOff(false)}
              >
                Keep it on
              </button>
            </>
          ) : (
            <button
              type="button"
              className="soft-btn soft-btn-tonal !min-h-[38px] !px-4 !text-[13px]"
              onClick={() => setConfirmingOff(true)}
            >
              Turn it off
            </button>
          )}
        </div>
        {confirmingOff ? (
          <p className="m-0 text-[13px] text-accent-700">
            This deletes every faceprint for {clubName}, every enrolment selfie and every match. Your photos are not
            touched. There is no undo.
          </p>
        ) : null}
        {message ? <p className="m-0 text-[12px] text-[color:var(--ink-55)]">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="soft-card flex flex-col gap-3 p-5">
      <span className="text-[15px] font-bold">{CLUB_NOTICE.title(clubName)}</span>
      <p className="m-0 text-[14px] text-[color:var(--ink-70)]">{CLUB_NOTICE.lead}</p>
      <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-[13px] leading-normal text-[color:var(--ink-70)]">
        {CLUB_NOTICE.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <label className="flex cursor-pointer items-start gap-2.5 text-[13px]">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-0.5"
        />
        <span>{CLUB_NOTICE.tickbox(clubName)}</span>
      </label>
      <button
        type="button"
        className="soft-btn soft-btn-primary self-start !min-h-[40px] !px-5 !text-[13px]"
        disabled={!accepted || pending}
        onClick={() =>
          startTransition(async () => {
            const res = await enableClubFacesAction(clubId, accepted);
            setMessage(res.error ?? res.message ?? "");
          })
        }
      >
        {pending ? "Setting it up…" : "Turn on face recognition"}
      </button>
      {message ? <p className="m-0 text-[12px] text-[color:var(--ink-55)]">{message}</p> : null}
    </div>
  );
}
