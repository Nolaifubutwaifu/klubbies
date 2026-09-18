import type { ReactNode } from "react";
import { SoftBackdrop } from "@/components/soft/SoftBackdrop";

/** Marketing and legal pages share the soft ground. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-soft relative flex flex-1 flex-col">
      <SoftBackdrop />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
