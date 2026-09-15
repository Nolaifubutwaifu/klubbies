"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Dialog } from "@/components/Dialog";
import { FormMessage } from "@/components/forms";
import { StatusTag } from "@/components/ui";
import { endGraceAction, removeMembersAction, restoreMemberAction, type ActionState } from "../../actions";

type Member = {
  id: string;
  roster_name: string;
  roster_email: string;
  claimed_name: string | null;
  name_mismatch: boolean;
  status: string;
  role: string;
  first_seen_at: string | null;
  invited_at: string | null;
  created_at: string;
  grace_ends_at: string | null;
  user_id: string | null;
};

export function MemberTable({ clubId, currentUserId, members }: { clubId: string; currentUserId: string; members: Member[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [endTarget, setEndTarget] = useState<Member | null>(null);
  const [typedName, setTypedName] = useState("");
  const [result, setResult] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  const removable = members.filter((m) => (m.status === "active" || m.status === "pending") && m.user_id !== currentUserId);
  const chosen = removable.filter((m) => selected.has(m.id));
  const keepGrace = chosen.filter((m) => m.user_id !== null).length;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const run = (fn: () => Promise<ActionState>, after?: () => void) =>
    startTransition(async () => {
      const res = await fn();
      setResult(res);
      if (res.ok) {
        after?.();
        router.refresh();
      }
    });

  if (members.length === 0) {
    return <p className="border-2 border-divider p-6 text-[14px] text-neutral-700">Nobody matches this view.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <FormMessage state={result} />
      {chosen.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 border-2 border-ink bg-neutral-100 px-4 py-2 text-[14px]">
          <strong>{chosen.length} selected</strong>
          <button type="button" className="btn btn-primary" onClick={() => setConfirmRemove(true)}>
            Remove from list
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="table min-w-[680px]">
          <thead>
            <tr>
              <th className="w-8">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={removable.length > 0 && chosen.length === removable.length}
                  onChange={(e) => setSelected(e.target.checked ? new Set(removable.map((m) => m.id)) : new Set())}
                  style={{ accentColor: "var(--color-accent)" }}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Added</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const canSelect = removable.includes(m);
              return (
                <tr key={m.id}>
                  <td>
                    {canSelect ? (
                      <input
                        type="checkbox"
                        aria-label={`Select ${m.roster_name}`}
                        checked={selected.has(m.id)}
                        onChange={() => toggle(m.id)}
                        style={{ accentColor: "var(--color-accent)" }}
                      />
                    ) : null}
                  </td>
                  <td className="font-semibold">
                    {m.roster_name}
                    {m.name_mismatch && m.claimed_name ? (
                      <div className="mt-1">
                        <span className="tag tag-accent-2" title="The name typed at sign-in differs from the list">
                          Signed in as “{m.claimed_name}”
                        </span>
                      </div>
                    ) : null}
                  </td>
                  <td className="text-neutral-700">{m.roster_email}</td>
                  <td>
                    <StatusTag status={m.status} role={m.role} graceEndsAt={m.grace_ends_at} />
                  </td>
                  <td className="text-neutral-700">{new Date(m.invited_at ?? m.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</td>
                  <td className="text-right whitespace-nowrap">
                    {m.status === "grace" ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost text-[13px]"
                          onClick={() => {
                            setTypedName("");
                            setEndTarget(m);
                          }}
                        >
                          End access now
                        </button>
                        <button type="button" className="btn btn-ghost text-[13px]" disabled={pending} onClick={() => run(() => restoreMemberAction(clubId, m.id))}>
                          Restore
                        </button>
                      </>
                    ) : m.status === "revoked" ? (
                      <button type="button" className="btn btn-ghost text-[13px]" disabled={pending} onClick={() => run(() => restoreMemberAction(clubId, m.id))}>
                        Restore
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={confirmRemove} onClose={() => setConfirmRemove(false)} title={`Remove ${chosen.length} ${chosen.length === 1 ? "person" : "people"}?`}>
        <p className="text-[15px] leading-normal">
          <strong>
            {chosen.length} {chosen.length === 1 ? "person loses" : "people lose"} access
          </strong>{" "}
          to new albums from now on.
          {keepGrace > 0
            ? ` ${keepGrace} of them signed in before, so they keep access to earlier albums for 30 days and get an email about it.`
            : ""}
        </p>
        <ul className="max-h-40 overflow-auto text-[14px] text-neutral-700">
          {chosen.map((m) => (
            <li key={m.id}>
              {m.roster_name} · {m.roster_email}
            </li>
          ))}
        </ul>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setConfirmRemove(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={() =>
              run(
                () => removeMembersAction(
                  clubId,
                  chosen.map((m) => m.id),
                ),
                () => {
                  setSelected(new Set());
                  setConfirmRemove(false);
                },
              )
            }
          >
            {pending ? "Removing…" : `Remove ${chosen.length}`}
          </button>
        </div>
      </Dialog>

      <Dialog open={endTarget !== null} onClose={() => setEndTarget(null)} title="End access now?">
        <p className="text-[15px] leading-normal">
          {endTarget?.roster_name} will lose access to every album immediately, instead of on the date they were told. Use
          this only if they were removed for cause.
        </p>
        <label className="field">
          Type {endTarget?.roster_name} to confirm
          <input className="input" value={typedName} onChange={(e) => setTypedName(e.target.value)} autoComplete="off" />
        </label>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setEndTarget(null)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending || !endTarget || typedName.trim().toLowerCase() !== endTarget.roster_name.trim().toLowerCase()}
            onClick={() => endTarget && run(() => endGraceAction(clubId, endTarget.id, typedName), () => setEndTarget(null))}
          >
            End access
          </button>
        </div>
      </Dialog>
    </div>
  );
}
