import { redirect } from "next/navigation";
import { SoftLanding } from "@/components/soft/SoftLanding";
import { getSessionUser } from "@/lib/auth/session";

export default async function LandingPage() {
  if (await getSessionUser()) redirect("/clubs");
  return <SoftLanding />;
}
