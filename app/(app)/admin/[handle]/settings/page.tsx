import type { Metadata } from "next";
import { PageTitle } from "@/components/ui";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { appUrl } from "@/lib/env";
import { SIGNED_URL_TTL, signPaths } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { LogoUploader } from "./LogoUploader";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Club settings" };

export default async function SettingsPage(props: PageProps<"/admin/[handle]/settings">) {
  const { handle } = await props.params;
  const ctx = await requireAdminContext(handle);
  const { club } = ctx;
  const supabase = await createClient();
  const logoUrl = club.logo_path ? ((await signPaths(supabase, [club.logo_path], SIGNED_URL_TTL.display)).get(club.logo_path) ?? null) : null;

  return (
    <main className="flex max-w-[920px] flex-col gap-6 px-6 py-8">
      <PageTitle kicker={club.name} title="Club settings" />
      <div className="hr" />
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <SettingsForm
          clubId={club.id}
          name={club.name}
          organisation={club.organisation}
          description={club.description}
          accentColour={club.accent_colour}
        />
        <div className="flex flex-col gap-4">
          <span className="text-[13px] font-semibold">Club mark</span>
          <span className="text-[13px] leading-normal text-neutral-700">
            Shown next to the club name in the header, and on the club switcher.
          </span>
          <LogoUploader clubId={club.id} logoUrl={logoUrl} />
          <div className="border-2 border-divider bg-surface p-4">
            <div className="label-caps">Club address</div>
            <div className="mt-2 break-all font-heading text-[18px] font-extrabold">
              {appUrl().replace(/^https?:\/\//, "")}/c/{club.handle}
            </div>
            <p className="mt-2 text-[13px] leading-normal text-neutral-700">
              Share this link with members. It never changes, so links in group chats keep working.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
