import type { ReactNode } from "react";
import { UploadProvider } from "./UploadProvider";
import { UploadTray } from "./UploadTray";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <UploadProvider>
      <div className="flex flex-1 flex-col">{children}</div>
      <UploadTray />
    </UploadProvider>
  );
}
