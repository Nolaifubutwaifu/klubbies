import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { apnsConfigured, isDeadToken, isWrongEnvironment, sendPush, type ApnsEnvironment, type PushMessage } from "./apns";

const OTHER: Record<ApnsEnvironment, ApnsEnvironment> = { production: "sandbox", sandbox: "production" };

/**
 * Pushes one message to every iPhone of the given people, and forgets any
 * token Apple says is dead (app deleted, notifications reset). Never throws:
 * a failed push must never fail the publish or post that caused it.
 *
 * A token only works against the Apple environment it came from. The app
 * says which one when it registers, but a build signed differently from how
 * it was compiled (a Release build run from Xcode, say) can label it wrong.
 * So a BadDeviceToken is tried once against the other environment before the
 * token is dropped, and the stored environment is corrected if that works.
 */
export async function pushToUsers(userIds: string[], message: PushMessage): Promise<number> {
  if (!apnsConfigured() || userIds.length === 0) return 0;
  try {
    const admin = createAdminClient();
    const { data: devices } = await admin.from("push_devices").select("token, environment").in("user_id", [...new Set(userIds)]);
    if (!devices?.length) return 0;

    let delivered = 0;
    const dead: string[] = [];
    const moved: { token: string; environment: ApnsEnvironment }[] = [];
    for (const environment of ["production", "sandbox"] as ApnsEnvironment[]) {
      const tokens = devices.filter((d) => d.environment === environment).map((d) => d.token);
      const retry: string[] = [];
      for (const result of await sendPush(environment, tokens, message)) {
        if (result.ok) delivered += 1;
        else if (isWrongEnvironment(result)) retry.push(result.token);
        else if (isDeadToken(result)) dead.push(result.token);
        else console.error("push not delivered", result.status, result.reason);
      }
      for (const result of await sendPush(OTHER[environment], retry, message)) {
        if (result.ok) {
          delivered += 1;
          moved.push({ token: result.token, environment: OTHER[environment] });
        } else dead.push(result.token);
      }
    }
    if (dead.length) await admin.from("push_devices").delete().in("token", dead);
    for (const { token, environment } of moved) {
      await admin.from("push_devices").update({ environment }).eq("token", token);
    }
    return delivered;
  } catch (error) {
    console.error("push failed", error);
    return 0;
  }
}
