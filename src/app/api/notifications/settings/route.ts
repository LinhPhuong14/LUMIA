import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  bedtime_enabled:  z.boolean().optional(),
  bedtime_time:     z.string().regex(/^\d{2}:\d{2}$/).optional(),
  bedtime_lead_min: z.number().int().min(0).max(120).optional(),
  morning_enabled:  z.boolean().optional(),
  morning_time:     z.string().regex(/^\d{2}:\d{2}$/).optional(),
  streak_enabled:   z.boolean().optional(),
  streak_time:      z.string().regex(/^\d{2}:\d{2}$/).optional(),
  weekly_enabled:   z.boolean().optional(),
  weekly_day:       z.number().int().min(0).max(6).optional(),
  weekly_time:      z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ settings: null });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ settings: null }, { status: 401 });

  const { data } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ settings: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  // Convert HH:MM to HH:MM:SS for Postgres TIME type
  const toTime = (t?: string) => t ? `${t}:00` : undefined;
  const update = {
    ...parsed.data,
    bedtime_time: toTime(parsed.data.bedtime_time),
    morning_time: toTime(parsed.data.morning_time),
    streak_time:  toTime(parsed.data.streak_time),
    weekly_time:  toTime(parsed.data.weekly_time),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("notification_settings")
    .upsert({ user_id: user.id, ...update }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: "Không thể lưu cài đặt" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
