import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isVercelCronAuthorized } from "@/lib/env";
import { getAppUrl } from "@/lib/app-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Vercel Cron — GET only. Runs weekly report generation for all active users. */
export async function GET(request: Request) {
  if (!isVercelCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: subs } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active")
    .not("started_at", "is", null);

  const userIds = [...new Set((subs ?? []).map((s) => s.user_id))];
  const base = getAppUrl();
  const results: Array<{ userId: string; ok: boolean }> = [];

  for (const userId of userIds) {
    try {
      const res = await fetch(`${base}/api/reports/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": process.env.CRON_SECRET ?? "",
        },
        body: JSON.stringify({ type: "weekly", userId }),
      });
      results.push({ userId, ok: res.ok });
    } catch {
      results.push({ userId, ok: false });
    }
  }

  return NextResponse.json({ triggered: results.length, results });
}
