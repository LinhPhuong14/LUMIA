import { NextResponse } from "next/server";
import { z } from "zod";

import { runReflect } from "@/lib/ai/journal-pipeline";
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

  const userId = session?.id;
  if (!userId && !isCron) {
    return NextResponse.json({ error: "User required" }, { status: 400 });
  }

  const targetUserId = userId ?? (body as { userId?: string }).userId;
  if (!targetUserId) {
    return NextResponse.json({ error: "userId required for cron" }, { status: 400 });
  }

  const { data: profile } = await admin.from("profiles").select("full_name").eq("id", targetUserId).single();
  const userName = profile?.full_name ?? "Bạn";

  const days = reportType === "full_21" ? 21 : 7;
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const [{ data: moods }, { data: activities }, { data: journals }] = await Promise.all([
    admin.from("mood_checkins").select("*").eq("user_id", targetUserId).gte("date", sinceStr),
    admin.from("activity_logs").select("*").eq("user_id", targetUserId).gte("date", sinceStr),
    admin.from("journal_entries").select("date, content").eq("user_id", targetUserId).gte("date", sinceStr),
  ]);

  const summary = {
    moodCount: moods?.length ?? 0,
    avgMood: moods?.length ? moods.reduce((s, m) => s + m.score, 0) / moods.length : null,
    activities: activities?.map((a) => a.activity_type) ?? [],
    journalDays: journals?.length ?? 0,
    reportType,
    periodDays: days,
  };

  let insight = `Tuần này bạn check-in mood ${summary.moodCount}/${days} ngày.`;
  if (summary.avgMood) {
    insight += ` Mood trung bình: ${summary.avgMood.toFixed(1)}/5.`;
  }

  let safetyFlag = false;
  let riskLevel = "none";

  if (hasLlmConfig()) {
    const reflectText = [
      `Báo cáo ${reportType === "full_21" ? "21 ngày" : "tuần"} LUMIA.`,
      `Dữ liệu: ${JSON.stringify(summary)}`,
      journals?.length
        ? `Nhật ký gần đây: ${journals.map((j) => j.content.slice(0, 120)).join(" | ")}`
        : "",
    ].join("\n");

    try {
      const result = await runReflect({ userName, text: reflectText });
      insight = result.reflection;
      safetyFlag = result.safety_flag;
      riskLevel = result.risk_level;
    } catch {
      // keep fallback insight
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await admin
    .from("reports")
    .insert({
      user_id: targetUserId,
      type: reportType,
      content: { insight, summary, safety_flag: safetyFlag, risk_level: riskLevel },
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
