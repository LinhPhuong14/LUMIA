import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/streak";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

const schema = z.object({
  score: z.number().int().min(1).max(5),
  note: z.string().optional(),
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

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("mood_checkins")
    .upsert(
      {
        user_id: session.id,
        score: parsed.data.score,
        note: parsed.data.note ?? null,
        date: today,
      },
      { onConflict: "user_id,date" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logActivity(session.id, "mood");
  return NextResponse.json(data);
}
