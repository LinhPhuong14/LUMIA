import { getServiceOrUserClient } from "@/lib/supabase/db";
import type { ActivityType } from "@/lib/supabase/types";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function logActivity(userId: string, activityType: ActivityType) {
  const client = await getServiceOrUserClient();
  if (!client) {
    return null;
  }

  const today = todayDateString();

  await client.from("activity_logs").insert({
    user_id: userId,
    activity_type: activityType,
    date: today,
  });

  const { data: streak } = await client.from("streaks").select("*").eq("user_id", userId).maybeSingle();
  if (!streak) {
    return { current_streak: 0, longest_streak: 0 };
  }

  if (streak.last_active_date === today) {
    return streak;
  }

  const yesterday = yesterdayDateString();
  const currentStreak = streak.last_active_date === yesterday ? streak.current_streak + 1 : 1;
  const longestStreak = Math.max(streak.longest_streak, currentStreak);

  const { data: updated } = await client
    .from("streaks")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_active_date: today,
    })
    .eq("user_id", userId)
    .select()
    .single();

  return updated;
}

export async function getStreak(userId: string) {
  const client = await getServiceOrUserClient();
  if (!client) {
    return { current_streak: 0, longest_streak: 0, badges: [] as string[] };
  }

  const { data: streak } = await client.from("streaks").select("*").eq("user_id", userId).maybeSingle();
  const current = streak?.current_streak ?? 0;
  const badges: string[] = [];
  if (current >= 7) badges.push("Ngày 7");
  if (current >= 14) badges.push("Ngày 14");
  if (current >= 21) badges.push("Ngày 21");

  return {
    current_streak: current,
    longest_streak: streak?.longest_streak ?? 0,
    badges,
  };
}
