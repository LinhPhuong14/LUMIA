import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/streak";
import { getSession } from "@/lib/supabase/auth";
import type { ActivityType } from "@/lib/supabase/types";

const schema = z.object({
  activityType: z.enum(["mood", "journal", "audio", "chat", "breathing", "timer"]),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const streak = await logActivity(session.id, parsed.data.activityType as ActivityType);
  return NextResponse.json(streak);
}
