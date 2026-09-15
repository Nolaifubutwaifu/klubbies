"use client";

import { useActionState, useState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { generateHandleBase } from "@/lib/roster/handle";
import { createClubAction, type ActionState } from "../actions";

export function CreateClubForm({ appUrl }: { appUrl: string }) {
  const [state, action] = useActionState<ActionState, FormData>(createClubAction, {});
  const [name, setName] = useState("");
  const handle = generateHandleBase(name || "Your club");
  const host = appUrl.replace(/^https?:\/\//, "");

  return (
    <form action={action} className="flex max-w-[920px] flex-col gap-6 px-6 py-8">
      <div>
        <span className="kicker">Step 1 of 3</span>
        <h1 className="display mt-2" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>
          Create your club
        </h1>
      </div>
      <div className="hr" />
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div className="flex flex-col gap-4">
          <label className="field">
            Club name
            <input
              className="input"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="UQ Volleyball"
              required
              maxLength={120}
              autoFocus
            />
          </label>
          <label className="field">
            University
            <input className="input" name="organisation" placeholder="The University of Queensland" maxLength={160} />
          </label>
          <label className="field">
            Short description
            <textarea className="input" name="description" maxLength={1000} placeholder="Social and competitive volleyball since 1998." />
          </label>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-[13px] font-semibold">Your club address</span>
          <div className="border-2 border-divider bg-surface p-4">
            <div className="label-caps">Members will see</div>
            <div className="mt-2 font-heading text-[22px] font-black tracking-[-0.02em]">{name || "Your club"}</div>
            <div className="mt-1 break-all text-[13px] text-neutral-700">
              {host}/c/<strong>{handle}</strong>
            </div>
          </div>
          <p className="text-[13px] leading-normal text-neutral-700">
            The address is made from the club name. Once you upload photos it stays fixed, so links shared in group chats
            never break. If the address is taken we add a number to the end.
          </p>
        </div>
      </div>
      <FormMessage state={state} />
      <div className="hr" />
      <div className="flex flex-wrap gap-3">
        <SubmitButton className="btn btn-primary justify-start" pendingText="Creating…">
          Continue to member list
        </SubmitButton>
      </div>
    </form>
  );
}
