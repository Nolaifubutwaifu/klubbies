"use client";

import { useActionState, useState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { ACCENT_SWATCHES, clubToneStyle } from "@/lib/theme";
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
  const [accent, setAccent] = useState(accentColour ?? "");
  const preview = clubToneStyle(accent);

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
        <span className="text-[13px] font-semibold">Club tone</span>
        <span className="text-[13px] leading-normal text-[color:var(--ink-70)]">
          The quiet buttons and the small labels across this club take this colour. Headlines, tags and the main
          buttons keep the Klubbies red, so your club still looks like Klubbies.
        </span>
        <input type="hidden" name="accentColour" value={accent} />
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Use ${swatch}`}
              aria-pressed={accent.toLowerCase() === swatch}
              onClick={() => setAccent(swatch)}
              className="relative h-9 w-9 cursor-pointer rounded-full border-0 outline-offset-2"
              style={{
                background: swatch,
                outline: accent.toLowerCase() === swatch ? "2px solid var(--color-text)" : "none",
              }}
            >
              {accent.toLowerCase() === swatch ? (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="absolute inset-0 m-auto h-4 w-4"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={3.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : null}
            </button>
          ))}
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="color"
              value={accent || "#d8c8f0"}
              onChange={(e) => setAccent(e.target.value)}
              className="h-9 w-9 cursor-pointer soft-card bg-transparent p-0"
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
          {accent ? (
            <button type="button" className="btn btn-ghost text-[13px]" onClick={() => setAccent("")}>
              Use the default tone
            </button>
          ) : null}
        </div>
        {/* The preview shows what actually changes: the quiet tier and the
            accessory label. The primary and the tag are there to show what
            stays the same in every club. */}
        <div className="flex flex-wrap items-center gap-3 soft-card p-3" style={preview}>
          <span className="btn btn-ghost">Download all</span>
          <span className="tag tag-neutral">Members only</span>
          <span className="btn btn-primary">Add photos</span>
          <span className="tag tag-accent">Formal</span>
        </div>
      </div>

      <FormMessage state={state} />
      <SubmitButton className="btn btn-primary self-start" pendingText="Saving…">
        Save settings
      </SubmitButton>
    </form>
  );
}
