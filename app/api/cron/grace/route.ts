import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { pruneRateEvents } from "@/lib/auth/rate-limit";
import { serverEnv } from "@/lib/env";
import { runGraceJob } from "@/lib/membership/grace";

export const maxDuration = 300;

function authorised(request: Request): boolean {
  const expected = Buffer.from(`Bearer ${serverEnv().CRON_SECRET}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Daily via Vercel Cron (vercel.json): revokes expired grace memberships and
// sends the day 7 and day 29 reminders.
export async function GET(request: Request) {
  if (!authorised(request)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const result = await runGraceJob();
  await pruneRateEvents();
  return NextResponse.json(result);
}
