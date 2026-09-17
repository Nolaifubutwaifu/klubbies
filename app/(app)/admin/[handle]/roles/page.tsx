import type { Metadata } from "next";
import { PageTitle } from "@/components/ui";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { createClient } from "@/lib/supabase/server";
import { RoleEditor } from "./RoleEditor";

export const metadata: Metadata = { title: "Roles" };

export default async function RolesPage(props: PageProps<"/admin/[handle]/roles">) {
  const { handle } = await props.params;
  const ctx = await requireAdminContext(handle);
  const supabase = await createClient();

  const [{ data: roles }, { data: counts }] = await Promise.all([
    supabase.from("club_roles").select("*").eq("club_id", ctx.club.id).order("sort_order").order("created_at"),
    supabase.from("memberships").select("role_id, status").eq("club_id", ctx.club.id).neq("status", "revoked"),
  ]);

  const memberCount = new Map<string, number>();
  for (const row of counts ?? []) {
    if (!row.role_id) continue;
    memberCount.set(row.role_id, (memberCount.get(row.role_id) ?? 0) + 1);
  }

  return (
    <main className="flex max-w-[980px] flex-col gap-6 px-6 py-8">
      <PageTitle kicker={ctx.club.name} title="Roles and permissions">
        Every member has one role. Roles decide who can add people, make albums, upload photos and post to the feed.
      </PageTitle>
      <div className="hr" />
      <RoleEditor
        clubId={ctx.club.id}
        roles={(roles ?? []).map((role) => ({ ...role, memberCount: memberCount.get(role.id) ?? 0 }))}
      />
    </main>
  );
}
