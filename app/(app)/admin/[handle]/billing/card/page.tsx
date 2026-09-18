import type { Metadata } from "next";
import Link from "next/link";
import { CardForm } from "@/components/CardForm";
import { PageTitle } from "@/components/ui";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { getDefaultCard, stripeConfigured } from "@/lib/billing/stripe";

export const metadata: Metadata = { title: "Payment card" };

export default async function CardPage(props: PageProps<"/admin/[handle]/billing/card">) {
  const { handle } = await props.params;
  const ctx = await requireAdminContext(handle);
  const card = stripeConfigured() ? await getDefaultCard(ctx.club).catch(() => null) : null;

  return (
    <main className="flex max-w-[720px] flex-col gap-6 px-6 py-8">
      <Link href={`/admin/${handle}/billing`} className="btn btn-ghost self-start pl-0 text-[13px]">
        ← Billing
      </Link>
      <PageTitle kicker={ctx.club.name} title={card ? "Change payment card" : "Add a payment card"}>
        {card
          ? `Currently paying with ${card.brand.toUpperCase()} ending ${card.last4}, expires ${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)}.`
          : "Save a card for this club's subscription."}
      </PageTitle>
      <CardForm clubId={ctx.club.id} doneHref={`/admin/${handle}/billing`} />
    </main>
  );
}
