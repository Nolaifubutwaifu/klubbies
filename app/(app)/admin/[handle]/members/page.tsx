import type { Metadata } from "next";
import Link from "next/link";
import { BillingGate } from "@/components/BillingGate";
import { PageTitle, Stat } from "@/components/ui";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { canWrite } from "@/lib/billing/status";
import { createClient } from "@/lib/supabase/server";
import { AddMemberForm } from "./AddMemberForm";
import { MemberTable, type MemberRow } from "./MemberTable";
import { RosterImport } from "./RosterImport";

export const metadata: Metadata = { title: "Member list" };

const MAX_ROWS = 500;

export default async function MembersPage(props: PageProps<"/admin/[handle]/members">) {
  const { handle } = await props.params;
  const search = await props.searchParams;
  const ctx = await requireAdminContext(handle);
  const supabase = await createClient();
  const writable = canWrite(ctx.club.billing_status);

  const [{ data: members }, { data: roles }, imports] = await Promise.all([
    supabase
      .from("memberships")
      .select(
        "id, roster_name, roster_email, claimed_name, name_mismatch, status, role, role_id, first_seen_at, invited_at, created_at, grace_ends_at, user_id, club_roles(id, name, manage_club)",
      )
      .eq("club_id", ctx.club.id)
      .order("roster_name", { ascending: true })
      .limit(MAX_ROWS),
    supabase.from("club_roles").select("id, name, manage_club").eq("club_id", ctx.club.id).order("sort_order"),
    supabase
      .from("roster_imports")
      .select("id, filename, added_count, matched_count, error_count, imported_at")
      .eq("club_id", ctx.club.id)
      .eq("status", "committed")
      .order("imported_at", { ascending: false })
      .limit(5),
  ]);

  const rows: MemberRow[] = (members ?? []).map((m) => ({
    id: m.id,
    name: m.roster_name,
    email: m.roster_email,
    claimedName: m.claimed_name,
    nameMismatch: m.name_mismatch,
    status: m.status,
    roleId: m.role_id,
    roleName: m.club_roles?.name ?? (m.role === "club_admin" ? "Admin" : "Member"),
    isAdminRole: Boolean(m.club_roles?.manage_club) || m.role === "club_admin",
    since: m.invited_at ?? m.created_at,
    firstSeenAt: m.first_seen_at,
    graceEndsAt: m.grace_ends_at,
    userId: m.user_id,
  }));

  const onList = rows.filter((m) => m.status !== "revoked").length;
  const notSignedIn = rows.filter((m) => m.status !== "revoked" && !m.firstSeenAt).length;

  return (
    <main className="flex flex-col gap-7 px-4 py-8 sm:px-6">
      {search.step === "3" ? (
        <div className="soft-bordered flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <span className="soft-chip">Step 3 of 4</span>
            <div className="soft-display mt-2 text-[20px]">Add the people who should see your photos.</div>
          </div>
          <Link href={`/admin/${handle}/albums`} className="soft-btn soft-btn-primary no-underline">
            Step 4: first album
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle kicker={ctx.club.name} title="Member list" underline>
          {onList.toLocaleString("en-AU")} on the list. That list is the door: anyone on it can sign in and see your albums.
        </PageTitle>
        {ctx.perms.manage_club ? (
          <Link href={`/admin/${handle}/roles`} className="soft-btn soft-btn-tonal no-underline">
            Roles and permissions
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {writable ? (
          <>
            <RosterImport clubId={ctx.club.id} />
            <AddMemberForm clubId={ctx.club.id} />
          </>
        ) : (
          <BillingGate handle={handle} action="add members" />
        )}
        <Stat
          value={onList.toLocaleString("en-AU")}
          label="On the list"
          hint={notSignedIn > 0 ? `${notSignedIn.toLocaleString("en-AU")} never signed in` : "everyone has signed in"}
          tone={notSignedIn > 0 ? "attention" : "good"}
        />
      </div>

      <MemberTable
        clubId={ctx.club.id}
        currentUserId={ctx.userId}
        members={rows}
        roles={roles ?? []}
        canManageRoles={ctx.perms.manage_members}
      />

      {rows.length >= MAX_ROWS ? (
        <p className="text-[13px] text-[color:var(--ink-70)]">
          Showing the first {MAX_ROWS.toLocaleString("en-AU")} members. Search to narrow the list.
        </p>
      ) : null}

      {imports.data?.length ? (
        <section className="soft-card flex flex-col gap-3 p-5">
          <h2 className="soft-display text-[19px]">Import history</h2>
          <table className="table">
            <thead>
              <tr>
                <th>File</th>
                <th>Added</th>
                <th>Already there</th>
                <th>Problems</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {imports.data.map((i) => (
                <tr key={i.id}>
                  <td>{i.filename}</td>
                  <td>{i.added_count}</td>
                  <td>{i.matched_count}</td>
                  <td>{i.error_count}</td>
                  <td className="text-[color:var(--ink-70)]">{new Date(i.imported_at).toLocaleDateString("en-AU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </main>
  );
}
