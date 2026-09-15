"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { createAlbumAction, type ActionState } from "../../actions";

export function NewAlbumForm({ clubId }: { clubId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(createAlbumAction.bind(null, clubId), {});
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="flex flex-col gap-4 border-2 border-accent p-4">
      <span className="kicker">New event album</span>
      <div className="grid items-end gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="field">
          Event name
          <input className="input" name="title" placeholder="Gala Dinner 2026" required maxLength={160} />
        </label>
        <label className="field">
          Date
          <input className="input" name="eventDate" type="date" defaultValue={today} />
        </label>
        <input type="hidden" name="allowDownload" value="on" />
        <input type="hidden" name="description" value="" />
        <SubmitButton className="btn btn-primary justify-start" pendingText="Creating…">
          Create and upload
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
