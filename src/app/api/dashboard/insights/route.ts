import { NextResponse } from "next/server";

import { computeDashboardInsights } from "@/lib/dashboard-insights";
import { localDateString } from "@/lib/local-date";
import { getStreak } from "@/lib/streak";
import { getSession } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 14);
  const sinceStr = localDateString(since);

  const [moodRes, activityRes, streak] = await Promise.all([
    supabase
      .from("mood_checkins")
      .select("date, score, note")
      .eq("user_id", session.id)
      .gte("date", sinceStr)
      .order("date", { ascending: true }),
    supabase
      .from("activity_logs")
      .select("date, activity_type")
      .eq("user_id", session.id)
      .gte("date", sinceStr)
      .order("date", { ascending: true }),
    getStreak(session.id),
  ]);

  if (moodRes.error) {
    return NextResponse.json({ error: moodRes.error.message }, { status: 500 });
  }
  if (activityRes.error) {
    return NextResponse.json({ error: activityRes.error.message }, { status: 500 });
  }

  const insights = computeDashboardInsights({
    moods: moodRes.data ?? [],
    activities: activityRes.data ?? [],
    streak,
  });

  return NextResponse.json(insights);
}
