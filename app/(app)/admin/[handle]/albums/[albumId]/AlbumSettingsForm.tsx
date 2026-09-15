"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { updateAlbumAction, type ActionState } from "../../../actions";

export function AlbumSettingsForm({
  albumId,
  title,
  eventDate,
  description,
  allowDownload,
}: {
  albumId: string;
  title: string;
  eventDate: string | null;
  description: string | null;
  allowDownload: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateAlbumAction.bind(null, albumId), {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="field">
        Event name
        <input className="input" name="title" defaultValue={title} required maxLength={160} />
      </label>
      <label className="field">
        Date
        <input className="input" name="eventDate" type="date" defaultValue={eventDate ?? ""} />
      </label>
      <label className="field">
        Description
        <textarea className="input" name="description" defaultValue={description ?? ""} maxLength={2000} />
      </label>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Visible to</span>
        <div className="border-2 border-divider p-3">
          <span className="text-[14px] font-semibold">All members</span>
          <br />
          <span className="text-[13px] text-neutral-700">Anyone on the current list, once published.</span>
        </div>
      </div>
      <label className="flex items-center gap-3 text-[14px]">
        <input
          type="checkbox"
          name="allowDownload"
          defaultChecked={allowDownload}
          style={{ width: 18, height: 18, accentColor: "var(--color-accent)" }}
        />
        Members may download originals
      </label>
      <FormMessage state={state} />
      <SubmitButton className="btn btn-secondary self-start" pendingText="Saving…">
        Save details
      </SubmitButton>
    </form>
  );
}
