import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

const assessmentSchema = z.object({
  moodScore: z.number().int().min(1).max(5),          // Q1
  dominantEmotion: z.string(),                         // Q2
  moodInfluencer: z.string(),                          // Q3
  sleepScore: z.number().int().min(1).max(5),          // Q4
  sleepHours: z.string(),                              // Q5
  wakeFeeling: z.string(),                             // Q6
  stressScore: z.number().int().min(1).max(5),         // Q7
  improveGoals: z.array(z.string()).max(3),            // Q8 multi-select
  openNote: z.string().max(500).optional(),            // Q9
  tonightChoice: z.string(),                           // Q10
});

/**
 * Returns the most recent Monday (inclusive of today if today is Monday)
 * as an ISO date string "YYYY-MM-DD" in local time.
 */
function getMostRecentMonday(): string {
  const now = new Date();
  // getDay(): 0=Sun, 1=Mon … 6=Sat
  const day = now.getDay();
  // Days since last Monday: Mon→0, Tue→1, … Sun→6
  const daysSinceMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday);
  // Format as YYYY-MM-DD
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// POST /api/mood/weekly-assessment
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const parsed = assessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase chưa sẵn sàng." }, { status: 503 });
  }

  const weekStart = getMostRecentMonday();
  const data = parsed.data;

  const row = {
    user_id: session.id,
    week_start: weekStart,
    mood_score: data.moodScore,
    sleep_score: data.sleepScore,
    stress_score: data.stressScore,
    dominant_emotion: data.dominantEmotion,
    mood_influencer: data.moodInfluencer,
    sleep_hours: data.sleepHours,
    wake_feeling: data.wakeFeeling,
    improve_goals: data.improveGoals,
    open_note: data.openNote ?? null,
    tonight_choice: data.tonightChoice,
    raw_answers: data as Record<string, unknown>,
  };

  const { data: saved, error } = await supabase
    .from("weekly_assessments")
    .upsert(row, { onConflict: "user_id,week_start" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    weekStart,
    assessment: saved,
    scores: {
      mood: data.moodScore,
      sleep: data.sleepScore,
      stress: data.stressScore,
      average: Math.round(((data.moodScore + data.sleepScore + (6 - data.stressScore)) / 3) * 10) / 10,
    },
  });
}

// GET /api/mood/weekly-assessment
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase chưa sẵn sàng." }, { status: 503 });
  }

  const weekStart = getMostRecentMonday();

  // Fetch the latest assessment overall
  const { data: latest, error: latestError } = await supabase
    .from("weekly_assessments")
    .select("*")
    .eq("user_id", session.id)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    return NextResponse.json({ error: latestError.message }, { status: 500 });
  }

  const hasCurrentWeek = latest?.week_start === weekStart;

  return NextResponse.json({
    latest: latest ?? null,
    weekStart,
    hasCurrentWeek,
  });
}
