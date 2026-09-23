import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { pruneRateEvents } from "@/lib/auth/rate-limit";
import { serverEnv } from "@/lib/env";
import { runFaceJobs } from "@/lib/faces/jobs";
import { runRemovalSweep } from "@/lib/media/removals";
import { runScheduledPublishJob } from "@/lib/media/schedule";
import { runGraceJob } from "@/lib/membership/grace";

export const maxDuration = 300;

function authorised(request: Request): boolean {
  const expected = Buffer.from(`Bearer ${serverEnv().CRON_SECRET}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// TODO(vercel-pro): put this back to hourly ("0 * * * *"). It runs once a day
// only because Vercel's Hobby plan refuses more than one cron run per day, and
// a daily pass means a scheduled album can wait until the next 9am Melbourne
// rather than going live near the time the committee picked. Nothing else here
// minds the delay; scheduling is the part that does.
//
// Via Vercel Cron (vercel.json): publishes albums whose scheduled time has
// passed, deletes photos whose removal request nobody answered, revokes
// expired grace memberships, and sends the day 7 and day 29 reminders.
// Publishing runs first so a scheduled album is live as early in the pass as
// possible.
//
// Face jobs run last and are the one part that would rather be hourly: on
// Hobby this pass is also the backstop that deletes revoked faceprints from
// AWS, so the consent copy's 24 hours is its outer bound. Uploads kick their
// own drain, so in practice this catches backfill and anything that errored.
export async function GET(request: Request) {
  if (!authorised(request)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const scheduled = await runScheduledPublishJob();
  const removals = await runRemovalSweep();
  const grace = await runGraceJob();
  const faces = await runFaceJobs();
  await pruneRateEvents();
  return NextResponse.json({ scheduled, removals, grace, faces });
}
