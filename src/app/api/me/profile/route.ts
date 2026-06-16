import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

const profileSchema = z.object({
  fullName: z.string().min(2).optional(),
  // Expanded - now accepts any string goal value (peace, sleep, habit, self_care, sharing, stress, meditation, …)
  onboardingGoal: z.string().optional(),
  nickname: z.string().min(1).optional(),
  // Full onboarding answers stored as arbitrary JSON
  onboardingData: z.record(z.string(), z.unknown()).optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase chưa sẵn sàng." }, { status: 503 });
  }

  const updates: Record<string, unknown> = {};

  if (parsed.data.fullName !== undefined) {
    updates.full_name = parsed.data.fullName;
  }
  if (parsed.data.onboardingGoal !== undefined) {
    updates.onboarding_goal = parsed.data.onboardingGoal;
  }
  if (parsed.data.nickname !== undefined) {
    updates.nickname = parsed.data.nickname;
  }
  if (parsed.data.onboardingData !== undefined) {
    updates.onboarding_data = parsed.data.onboardingData;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", session.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
