import { AppHeader } from "@/components/AppHeader";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { accentStyle } from "@/lib/theme";

export default async function AdminLayout(props: LayoutProps<"/admin/[handle]">) {
  const { handle } = await props.params;
  const ctx = await requireAdminContext(handle);
  return (
    <div className="flex flex-1 flex-col" style={accentStyle(ctx.club.accent_colour)}>
      <AppHeader ctx={ctx} forceAdmin />
      {props.children}
    </div>
  );
}
