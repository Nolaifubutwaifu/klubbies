import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { ClubHeader } from "@/components/ClubHeader";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { displayNameFor } from "@/lib/auth/display-name";
import { canWrite } from "@/lib/billing/status";

export default async function AdminLayout(props: LayoutProps<"/admin/[handle]">) {
  const { handle } = await props.params;
  const ctx = await requireAdminContext(handle);
  return (
    <div className="flex flex-1 flex-col">
      <ClubHeader ctx={ctx} displayName={await displayNameFor(ctx)} area="admin" />
      <AdminNav handle={ctx.club.handle} />
      {!canWrite(ctx.club.billing_status) || ctx.club.billing_status === "past_due" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-divider bg-accent-100 px-6 py-3 text-[14px] text-accent-800">
          <span>
            {ctx.club.billing_status === "past_due"
              ? "The last payment for this club failed. Update your card to keep adding members and uploading."
              : "This club isn't active yet. Adding members and uploading unlock after payment."}
          </span>
          <Link href={`/admin/${ctx.club.handle}/billing`} className="btn btn-primary">
            {ctx.club.billing_status === "past_due" ? "Update billing" : "Activate club"}
          </Link>
        </div>
      ) : null}
      {props.children}
    </div>
  );
}
