import { NextResponse } from "next/server";

import { localDateString } from "@/lib/local-date";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const daysParam = searchParams.get("days");

  // ?days=N — return list of distinct active dates (YYYY-MM-DD) for history sidebar
  if (daysParam) {
    const n = Math.min(Math.max(parseInt(daysParam, 10) || 30, 1), 90);
    const since = new Date();
    since.setDate(since.getDate() - n);
    const { data, error } = await supabase
      .from("chat_messages")
      .select("created_at")
      .eq("user_id", session.id)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const seen = new Set<string>();
    const dates: string[] = [];
    for (const row of (data ?? []) as { created_at: string }[]) {
      const d = new Date(row.created_at);
      const vn = new Date(d.getTime() + 7 * 60 * 60 * 1000);
      const key = vn.toISOString().slice(0, 10);
      if (!seen.has(key)) { seen.add(key); dates.push(key); }
    }
    return NextResponse.json(dates);
  }

  // ?date=YYYY-MM-DD — load messages for a specific day; default = today
  const targetDate = dateParam ?? localDateString();
  const startOfDay = `${targetDate}T00:00:00+07:00`;
  const endOfDay   = `${targetDate}T23:59:59+07:00`;

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", session.id)
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
