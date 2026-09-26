import Link from "next/link";
import { isNativeAppRequest } from "@/lib/native-app-server";

export async function BillingGate({ handle, action }: { handle: string; action: string }) {
  // Inside the iPhone app there is nowhere to pay, so say what's locked and stop there.
  const inApp = await isNativeAppRequest();
  return (
    <div className="dropzone px-4 py-8" style={{ cursor: "default", gridColumn: "1 / -1" }}>
      <span className="font-heading text-[18px] font-bold">{inApp ? "This club isn't active yet" : `Activate your club to ${action}`}</span>
      <span className="max-w-[46ch] text-[14px] text-ink-70">
        {inApp
          ? `Once it's active you can ${action} here. Existing albums stay visible to members.`
          : "Adding members and uploading unlock once the club is paid for. Existing albums stay visible to members."}
      </span>
      {inApp ? null : (
        <Link href={`/admin/${handle}/billing`} className="btn btn-primary mt-2">
          Activate club
        </Link>
      )}
    </div>
  );
}
