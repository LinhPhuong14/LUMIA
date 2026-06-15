import { NextResponse } from "next/server";

import { localDateString } from "@/lib/local-date";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

const FREE_DAILY_LIMIT = 3;

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getSubscriptionSnapshot(session.id);
  if (snapshot.isActive) {
    return NextResponse.json({ limit: null, used: 0, remaining: null, isActive: true });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ limit: FREE_DAILY_LIMIT, used: 0, remaining: FREE_DAILY_LIMIT, isActive: false });
  }

  // Use Vietnam timezone so quota resets at midnight VN time (#004)
  const today = localDateString();
  const { data } = await supabase
    .from("chat_daily_usage")
    .select("count")
    .eq("user_id", session.id)
    .eq("date", today)
    .maybeSingle();

  const used = data?.count ?? 0;
  return NextResponse.json({
    limit: FREE_DAILY_LIMIT,
    used,
    remaining: Math.max(0, FREE_DAILY_LIMIT - used),
    isActive: false,
  });
}
