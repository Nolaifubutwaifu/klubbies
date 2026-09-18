import type { Metadata } from "next";
import { SoftLanding } from "@/components/soft/SoftLanding";

export const metadata: Metadata = { title: "Home preview" };

/** Soft-theme proposal for the marketing home page. Sits beside "/". */
export default function SoftHomePreviewPage() {
  return <SoftLanding />;
}
