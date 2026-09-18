import type { Metadata } from "next";
import { PageTitle } from "@/components/ui";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { createClient } from "@/lib/supabase/server";
import { Handover, type HandoverCandidate } from "./Handover";
import { RoleEditor } from "./RoleEditor";

export const metadata: Metadata = { title: "Roles" };

export default async function RolesPage(props: PageProps<"/admin/[handle]/roles">) {
  const { handle } = await props.params;
  const ctx = await requireAdminContext(handle);
  const supabase = await createClient();

  const [{ data: roles }, { data: counts }, { data: people }] = await Promise.all([
    supabase.from("club_roles").select("*").eq("club_id", ctx.club.id).order("sort_order").order("created_at"),
    supabase.from("memberships").select("role_id, status").eq("club_id", ctx.club.id).neq("status", "revoked"),
    // Only people who have actually signed in can be handed a club.
    supabase
      .from("memberships")
      .select("id, roster_name, claimed_name, role, user_id, status")
      .eq("club_id", ctx.club.id)
      .eq("status", "active")
      .not("user_id", "is", null)
      .order("roster_name"),
  ]);

  const memberCount = new Map<string, number>();
  for (const row of counts ?? []) {
    if (!row.role_id) continue;
    memberCount.set(row.role_id, (memberCount.get(row.role_id) ?? 0) + 1);
  }

  const candidates: HandoverCandidate[] = (people ?? [])
    .filter((m) => m.user_id !== ctx.userId)
    .map((m) => ({
      membershipId: m.id,
      name: m.claimed_name ?? m.roster_name,
      isAdmin: m.role === "club_admin",
    }));
  const owner = (people ?? []).find((m) => m.user_id === ctx.userId);

  return (
    <main className="flex flex-col gap-7 px-4 py-8 sm:px-6">
      <PageTitle kicker={ctx.club.name} title="Roles and permissions">
        Every member has one role. Roles decide who can add people, make albums, upload photos and post to the feed.
      </PageTitle>
      <RoleEditor
        clubId={ctx.club.id}
        roles={(roles ?? []).map((role) => ({ ...role, memberCount: memberCount.get(role.id) ?? 0 }))}
      />
      {ctx.perms.manage_club ? (
        <Handover
          clubId={ctx.club.id}
          clubName={ctx.club.name}
          ownerName={owner ? (owner.claimed_name ?? owner.roster_name) : "You"}
          candidates={candidates}
        />
      ) : null}
    </main>
  );
}
