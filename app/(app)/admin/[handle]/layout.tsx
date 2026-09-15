import { AdminNav } from "@/components/AdminNav";
import { ClubHeader } from "@/components/ClubHeader";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { displayNameFor } from "@/lib/auth/display-name";

export default async function AdminLayout(props: LayoutProps<"/admin/[handle]">) {
  const { handle } = await props.params;
  const ctx = await requireAdminContext(handle);
  return (
    <div className="flex flex-1 flex-col">
      <ClubHeader ctx={ctx} displayName={await displayNameFor(ctx)} area="admin" />
      <AdminNav handle={ctx.club.handle} />
      {props.children}
    </div>
  );
}
