import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { getClubContext } from "@/lib/auth/session";
import { accentStyle } from "@/lib/theme";

export default async function ClubLayout(props: LayoutProps<"/c/[handle]">) {
  const { handle } = await props.params;
  const ctx = await getClubContext(handle);
  if (!ctx) notFound();

  return (
    <div className="flex flex-1 flex-col" style={accentStyle(ctx.club.accent_colour)}>
      <AppHeader ctx={ctx} />
      {props.children}
    </div>
  );
}
