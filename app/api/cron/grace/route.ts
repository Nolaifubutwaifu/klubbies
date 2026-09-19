import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { pruneRateEvents } from "@/lib/auth/rate-limit";
import { serverEnv } from "@/lib/env";
import { runRemovalSweep } from "@/lib/media/removals";
import { runScheduledPublishJob } from "@/lib/media/schedule";
import { runGraceJob } from "@/lib/membership/grace";

export const maxDuration = 300;

function authorised(request: Request): boolean {
  const expected = Buffer.from(`Bearer ${serverEnv().CRON_SECRET}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Via Vercel Cron (vercel.json): publishes albums whose scheduled time has
// passed, deletes photos whose removal request nobody answered, revokes
// expired grace memberships, and sends the day 7 and day 29 reminders.
// Publishing runs first so a scheduled album is live as early in the pass as
// possible.
export async function GET(request: Request) {
  if (!authorised(request)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const scheduled = await runScheduledPublishJob();
  const removals = await runRemovalSweep();
  const grace = await runGraceJob();
  await pruneRateEvents();
  return NextResponse.json({ scheduled, removals, grace });
}
