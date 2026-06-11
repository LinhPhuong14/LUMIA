import { NextResponse } from "next/server";

import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ limit: FREE_DAILY_LIMIT, used: 0, remaining: FREE_DAILY_LIMIT, isActive: false });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await admin
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
