import { NextResponse } from "next/server";

import { getStreak } from "@/lib/streak";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const streak = await getStreak(session.id);
  return NextResponse.json(streak);
}
