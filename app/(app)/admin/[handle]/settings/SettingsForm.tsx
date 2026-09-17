"use client";

import { useActionState, useState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { ACCENT_SWATCHES, DEFAULT_ACCENT, accentStyle } from "@/lib/theme";
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
  const [accent, setAccent] = useState(accentColour ?? DEFAULT_ACCENT);
  const preview = accentStyle(accent);

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

      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-semibold">Club colour</span>
        <span className="text-[13px] leading-normal text-neutral-700">
          Buttons, tags and highlights across this club follow this colour. Only this club changes.
        </span>
        <input type="hidden" name="accentColour" value={accent.toLowerCase() === DEFAULT_ACCENT ? "" : accent} />
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Use ${swatch}`}
              aria-pressed={accent.toLowerCase() === swatch}
              onClick={() => setAccent(swatch)}
              className="h-9 w-9 cursor-pointer border-2"
              style={{ background: swatch, borderColor: accent.toLowerCase() === swatch ? "var(--color-text)" : "transparent" }}
            />
          ))}
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="h-9 w-9 cursor-pointer border-2 border-divider bg-transparent p-0"
              aria-label="Pick a custom colour"
            />
            <input
              className="input w-[120px] font-mono text-[13px]"
              value={accent}
              onChange={(e) => setAccent(e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`)}
              pattern="#[0-9a-fA-F]{6}"
              aria-label="Hex colour"
            />
          </label>
          {accent.toLowerCase() !== DEFAULT_ACCENT ? (
            <button type="button" className="btn btn-ghost text-[13px]" onClick={() => setAccent(DEFAULT_ACCENT)}>
              Reset to Klubbies red
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-2 border-divider p-3" style={preview}>
          <span className="btn btn-primary">Primary button</span>
          <span className="tag tag-accent">Admin</span>
          <span className="kicker">Preview</span>
        </div>
      </div>

      <FormMessage state={state} />
      <SubmitButton className="btn btn-primary self-start" pendingText="Saving…">
        Save settings
      </SubmitButton>
    </form>
  );
}
