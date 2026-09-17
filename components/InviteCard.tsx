"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { acceptInviteAction, declineInviteAction } from "@/app/(app)/actions";
import type { MyClub } from "@/lib/auth/session";
import { formatLongDate } from "@/lib/format";

export function InviteCard({ invite }: { invite: MyClub }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-2 border-accent p-4">
      <span className="max-w-[42ch] text-[14px] leading-normal">
        <strong>{invite.name}</strong> added you to their member list on {formatLongDate(invite.since)}. Accept to see
        their albums.
      </span>
      <span className="flex gap-2">
        <button
          type="button"
          className="btn btn-primary text-[13px]"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await acceptInviteAction(invite.membershipId);
              if (res.ok) {
                router.push(`/c/${invite.handle}`);
                router.refresh();
              }
            })
          }
        >
          Accept
        </button>
        <button
          type="button"
          className="btn btn-ghost text-[13px]"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await declineInviteAction(invite.membershipId);
              router.refresh();
            })
          }
        >
          Not me
        </button>
      </span>
    </div>
  );
}
