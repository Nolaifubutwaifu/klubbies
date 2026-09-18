import type { ReactNode } from "react";
import { AppFooter } from "@/components/AppFooter";
import { SoftBackdrop } from "@/components/soft/SoftBackdrop";
import { UploadProvider } from "./UploadProvider";
import { UploadTray } from "./UploadTray";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <UploadProvider>
      <div className="theme-soft relative flex flex-1 flex-col">
        <SoftBackdrop />
        <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-1 flex-col">{children}</div>
        <AppFooter />
      </div>
      <UploadTray />
    </UploadProvider>
  );
}
