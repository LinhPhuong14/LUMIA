import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

const profileSchema = z.object({
  fullName: z.string().min(2).optional(),
  onboardingGoal: z.enum(["sleep", "stress", "meditation"]).optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase chưa sẵn sàng." }, { status: 503 });
  }

  const updates: Record<string, string> = {};
  if (parsed.data.fullName) {
    updates.full_name = parsed.data.fullName;
  }
  if (parsed.data.onboardingGoal) {
    updates.onboarding_goal = parsed.data.onboardingGoal;
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", session.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
