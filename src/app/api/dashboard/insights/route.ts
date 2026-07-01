import { NextResponse } from "next/server";

import { computeDashboardInsights, type RecommendedTrack } from "@/lib/dashboard-insights";
import { localDateString } from "@/lib/local-date";
import { getStreak } from "@/lib/streak";
import { getSession } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const CATEGORY_LABEL: Record<string, string> = {
  sleep_sound: "Âm thanh ngủ",
  sleep_cast: "Sleep Cast",
  wind_down: "Wind Down",
  sleep_music: "Nhạc ngủ",
  guided_meditation: "Thiền có hướng dẫn",
  mini_meditation: "Thiền ngắn",
  breathing: "Hơi thở",
  timer_ambient: "Âm nền",
};

const CATEGORY_HREF: Record<string, string> = {
  sleep_sound: "/audio/sleep",
  sleep_cast: "/audio/sleep",
  wind_down: "/audio/sleep",
  sleep_music: "/audio/sleep",
  guided_meditation: "/audio/meditation",
  mini_meditation: "/audio/meditation",
  breathing: "/audio/breathing",
  timer_ambient: "/audio/timer",
};

// Prefer calming, sleep-oriented tracks; when the user reports a rough day (low mood)
// lean fully into the calming categories before anything else.
const CALMING = ["sleep_sound", "wind_down", "sleep_music", "sleep_cast"];
const UPLIFTING = ["guided_meditation", "mini_meditation", "breathing"];

async function getRecommendedTrack(
  supabase: SupabaseClient,
  todayScore: number | null,
): Promise<RecommendedTrack | null> {
  const { data } = await supabase
    .from("audio_tracks")
    .select("title, category, duration_seconds")
    .order("sort_order", { ascending: true });
  if (!data || data.length === 0) return null;

  const order = todayScore != null && todayScore <= 2 ? CALMING : [...CALMING, ...UPLIFTING];
  let chosen: { title: string; category: string; duration_seconds: number | null } | undefined;
  for (const category of order) {
    chosen = data.find((track) => track.category === category);
    if (chosen) break;
  }
  chosen = chosen ?? data[0];

  return {
    title: chosen.title,
    categoryLabel: CATEGORY_LABEL[chosen.category] ?? "Âm thanh",
    durationSeconds: chosen.duration_seconds,
    href: CATEGORY_HREF[chosen.category] ?? "/audio",
  };
}

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

  const recommendedTrack = await getRecommendedTrack(supabase, insights.today?.score ?? null);

  return NextResponse.json({ ...insights, recommendedTrack });
}
