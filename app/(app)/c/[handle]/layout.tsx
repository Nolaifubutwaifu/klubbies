import { notFound } from "next/navigation";
import { ClubHeader } from "@/components/ClubHeader";
import { displayNameFor } from "@/lib/auth/display-name";
import { getClubContext } from "@/lib/auth/session";

export default async function ClubLayout(props: LayoutProps<"/c/[handle]">) {
  const { handle } = await props.params;
  const ctx = await getClubContext(handle);
  if (!ctx) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <ClubHeader ctx={ctx} displayName={await displayNameFor(ctx)} area="member" />
      {props.children}
    </div>
  );
}
