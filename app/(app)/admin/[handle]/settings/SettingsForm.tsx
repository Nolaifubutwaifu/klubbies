"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { updateClubAction, type ActionState } from "../../actions";

export function SettingsForm({
  clubId,
  name,
  organisation,
  description,
  accentColour,
}: {
  clubId: string;
  name: string;
  organisation: string | null;
  description: string | null;
  accentColour: string | null;
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateClubAction.bind(null, clubId), {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="field">
        Club name
        <input className="input" name="name" defaultValue={name} required maxLength={120} />
      </label>
      <label className="field">
        University
        <input className="input" name="organisation" defaultValue={organisation ?? ""} maxLength={160} />
      </label>
      <label className="field">
        Short description
        <textarea className="input" name="description" defaultValue={description ?? ""} maxLength={1000} />
      </label>
      <label className="field">
        Accent colour
        <input className="input" name="accentColour" defaultValue={accentColour ?? ""} placeholder="#ec3013" pattern="#[0-9a-fA-F]{6}" />
        <span className="text-[12px] font-normal text-neutral-600">Saved now, used for club branding in a later update.</span>
      </label>
      <FormMessage state={state} />
      <SubmitButton className="btn btn-primary self-start" pendingText="Saving…">
        Save settings
      </SubmitButton>
    </form>
  );
}
