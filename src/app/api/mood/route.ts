import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/streak";
import { localDateString } from "@/lib/local-date";
import { ensureUserProfile } from "@/lib/supabase/ensure-profile";
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

  const profile = await ensureUserProfile(session);
  if (!profile.ok) {
    return NextResponse.json({ error: profile.error }, { status: 500 });
  }

  const today = localDateString();
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
    console.error("[mood] upsert failed:", error.message, error.code);
    return NextResponse.json(
      {
        error: error.message,
        hint:
          error.code === "42501"
            ? "Chạy supabase/migrations/005_ensure_profile_rpc.sql trên Supabase SQL Editor."
            : undefined,
      },
      { status: 500 },
    );
  }

  await logActivity(session.id, "mood");
  return NextResponse.json(data);
}
