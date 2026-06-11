import { NextResponse } from "next/server";

import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getSubscriptionSnapshot(session.id);
  return NextResponse.json(snapshot);
}
