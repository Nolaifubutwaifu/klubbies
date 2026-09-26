"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { deleteAccountAction, type AccountResult } from "./actions";

type ClubRef = { name: string; handle: string };

/**
 * Delete account, at the bottom of the profile. Closed until asked for, then
 * it says plainly what goes, what stays, and what happens to any club this
 * person runs alone, before the one red button.
 */
export function DeleteAccount({ handOver, closes }: { handOver: ClubRef[]; closes: ClubRef[] }) {
  const [open, setOpen] = useState(false);
  const [understand, setUnderstand] = useState(false);
  const [state, action, pending] = useActionState<AccountResult, FormData>(deleteAccountAction, {});

  if (!open) {
    return (
      <button type="button" className="btn btn-secondary btn-sm self-start" onClick={() => setOpen(true)}>
        Delete my account
      </button>
    );
  }

  return (
    <div className="soft-card flex flex-col gap-3 p-5 text-[14px] leading-normal">
      <h2 className="soft-display text-[18px]">Delete your account</h2>
      <p className="m-0">
        This deletes your sign-in, your profile and photo, your saved photos, your face recognition selfie and
        faceprints, and anything you posted to a club feed. It can&apos;t be undone.
      </p>
      <p className="m-0 text-[color:var(--ink-70)]">
        Photos and videos you added to club albums stay with the club; ask the committee if you want any taken down.
        Your club can still see your name on its member list, and you can sign in again later if you&apos;re on it.
      </p>

      {handOver.length > 0 ? (
        <div className="notice flex flex-col gap-2">
          <span>
            You&apos;re the only admin of {handOver.map((club) => club.name).join(" and ")}. Hand it over to another
            member first, so the club isn&apos;t left without anyone running it.
          </span>
          {handOver.map((club) => (
            <Link key={club.handle} href={`/admin/${club.handle}/roles`} className="font-bold">
              Hand over {club.name}
            </Link>
          ))}
        </div>
      ) : (
        <>
          {closes.length > 0 ? (
            <div className="notice">
              Nobody else has joined {closes.map((club) => club.name).join(" or ")}, so it closes with your account: its
              subscription is cancelled and its albums are deleted.
            </div>
          ) : null}
          <form action={action} className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" name="understand" value="yes" checked={understand} onChange={(e) => setUnderstand(e.target.checked)} />
              <span>I understand my account is deleted for good.</span>
            </label>
            {state.error ? <span className="notice">{state.error}</span> : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn btn-danger" disabled={!understand || pending}>
                {pending ? "Deleting…" : "Delete my account"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)} disabled={pending}>
                Keep my account
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
