import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/streak";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

const schema = z.object({
  content: z.string().min(1),
  promptUsed: z.string().optional(),
  date: z.string().optional(),
});

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

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", session.id)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getSubscriptionSnapshot(session.id);
  if (!snapshot.isActive) {
    return NextResponse.json({ error: "Cần hành trình active để viết journal." }, { status: 403 });
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

  const date = parsed.data.date ?? new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("journal_entries")
    .upsert(
      {
        user_id: session.id,
        content: parsed.data.content,
        prompt_used: parsed.data.promptUsed ?? null,
        date,
      },
      { onConflict: "user_id,date" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logActivity(session.id, "journal");
  return NextResponse.json(data);
}
