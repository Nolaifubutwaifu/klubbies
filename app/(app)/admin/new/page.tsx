import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { appUrl } from "@/lib/env";
import { CreateClubForm } from "./CreateClubForm";

export const metadata: Metadata = { title: "Create your club" };

export default async function NewClubPage() {
  await requireUser("/admin/new");
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b-2 border-divider px-6 py-4">
        <Brand href="/clubs" />
        <Link href="/clubs" className="btn btn-ghost text-[13px]">
          Cancel
        </Link>
      </header>
      <CreateClubForm appUrl={appUrl()} />
    </main>
  );
}
