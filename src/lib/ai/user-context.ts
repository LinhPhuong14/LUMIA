import { localDateString } from "@/lib/local-date";
import { createClient } from "@/lib/supabase/server";

export type UserContext = {
  name: string;
  moodToday: number | null;
  moodNoteToday: string | null;
  moodAvg7d: number | null;
  moodTrend: "improving" | "declining" | "stable" | null;
  streakDays: number;
  recentJournalSnippet: string | null;
  isPremium: boolean;
  sessionDate: string;
};

export async function getUserContext(
  userId: string,
  userName: string,
  isPremium: boolean,
): Promise<UserContext> {
  const ctx: UserContext = {
    name: userName,
    moodToday: null,
    moodNoteToday: null,
    moodAvg7d: null,
    moodTrend: null,
    streakDays: 0,
    recentJournalSnippet: null,
    isPremium,
    sessionDate: localDateString(),
  };

  const supabase = await createClient();
  if (!supabase) return ctx;

  const today = localDateString();

  // Run queries in parallel
  const [moodRes, moodHistRes, streakRes, journalRes] = await Promise.allSettled([
    // Today's mood check-in
    supabase
      .from("mood_checkins")
      .select("score, note")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle(),

    // Last 7 days of moods
    supabase
      .from("mood_checkins")
      .select("score, date")
      .eq("user_id", userId)
      .gte("date", daysAgo(7))
      .order("date", { ascending: true }),

    // Streak
    supabase
      .from("streaks")
      .select("current_streak")
      .eq("user_id", userId)
      .maybeSingle(),

    // Latest journal entry (short snippet)
    supabase
      .from("journal_entries")
      .select("content, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (moodRes.status === "fulfilled" && moodRes.value.data) {
    ctx.moodToday = moodRes.value.data.score;
    ctx.moodNoteToday = moodRes.value.data.note ?? null;
  }

  if (moodHistRes.status === "fulfilled" && moodHistRes.value.data?.length) {
    const scores = moodHistRes.value.data.map((r) => r.score as number);
    ctx.moodAvg7d = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    if (scores.length >= 3) {
      const first = scores.slice(0, Math.ceil(scores.length / 2));
      const last = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
      const lastAvg = last.reduce((a, b) => a + b, 0) / last.length;
      if (lastAvg - firstAvg > 0.4) ctx.moodTrend = "improving";
      else if (firstAvg - lastAvg > 0.4) ctx.moodTrend = "declining";
      else ctx.moodTrend = "stable";
    }
  }

  if (streakRes.status === "fulfilled" && streakRes.value.data) {
    ctx.streakDays = streakRes.value.data.current_streak ?? 0;
  }

  if (journalRes.status === "fulfilled" && journalRes.value.data?.content) {
    const raw = journalRes.value.data.content as string;
    // Strip HTML tags and trim to 200 chars for context
    const text = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    ctx.recentJournalSnippet = text.length > 200 ? text.slice(0, 200) + "…" : text;
  }

  return ctx;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
