import { NextResponse } from "next/server";
import { z } from "zod";

import { runReport } from "@/lib/ai/report-pipeline";
import { hasLlmConfig, isVercelCronAuthorized } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

const schema = z.object({
  type: z.enum(["weekly", "full_21"]).optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  const reportType = parsed.success ? (parsed.data.type ?? "weekly") : "weekly";

  const isCron = isVercelCronAuthorized(request);
  if (!session && !isCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const targetUserId = session?.id ?? (body as { userId?: string }).userId;
  if (!targetUserId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", targetUserId)
    .single();
  const userName = profile?.full_name ?? "Bạn";

  const days = reportType === "full_21" ? 21 : 7;
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: moods }, { data: activities }, { data: journals }] = await Promise.all([
    admin.from("mood_checkins").select("date, score, note").eq("user_id", targetUserId).gte("date", sinceStr),
    admin.from("activity_logs").select("date, activity_type").eq("user_id", targetUserId).gte("date", sinceStr),
    admin.from("journal_entries").select("date, content").eq("user_id", targetUserId).gte("date", sinceStr),
  ]);

  // Activity counts per type
  const activityCounts: Record<string, number> = {};
  for (const a of activities ?? []) {
    activityCounts[a.activity_type] = (activityCounts[a.activity_type] ?? 0) + 1;
  }

  const summary = {
    reportType,
    periodDays: days,
    periodStart: sinceStr,
    periodEnd: today,
    moodCheckIns: moods?.length ?? 0,
    avgMood: moods?.length
      ? Math.round((moods.reduce((s, m) => s + m.score, 0) / moods.length) * 10) / 10
      : null,
    moodScores: moods?.map((m) => m.score) ?? [],
    activities: activityCounts,
    journalDays: journals?.length ?? 0,
  };

  const journalSnippets = (journals ?? [])
    .filter((j) => j.content?.trim())
    .map((j) => j.content.replace(/<[^>]+>/g, "").trim().slice(0, 150))
    .slice(0, 5);

  // Fallback insight without LLM
  let insight = `Tuần này ${userName} đã check-in ${summary.moodCheckIns}/${days} ngày.`;
  if (summary.avgMood) insight += ` Mood trung bình: ${summary.avgMood}/5.`;
  if (summary.journalDays > 0) insight += ` Đã viết nhật ký ${summary.journalDays} lần.`;
  insight += " Hãy tiếp tục duy trì nhé!";

  if (hasLlmConfig()) {
    try {
      insight = await runReport({ userName, summary, journalSnippets });
    } catch { /* keep fallback */ }
  }

  const { data, error } = await admin
    .from("reports")
    .insert({
      user_id: targetUserId,
      type: reportType,
      content: { insight, summary },
      period_start: sinceStr,
      period_end: today,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
