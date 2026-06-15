import { NextResponse } from "next/server";

import { localDateString } from "@/lib/local-date";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

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

  // Use Vietnam timezone so "today" aligns with user's local date (#004)
  const today = localDateString();
  const startOfDay = `${today}T00:00:00+07:00`;

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", session.id)
    .gte("created_at", startOfDay)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
