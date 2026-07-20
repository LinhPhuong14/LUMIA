import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";
import { ensureUserProfile } from "@/lib/supabase/ensure-profile";

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
    // Merge, don't replace: the settings panel patches one field at a time and
    // a plain assignment would drop every other onboarding answer.
    const { data: current } = await supabase
      .from("profiles")
      .select("onboarding_data")
      .eq("id", session.id)
      .maybeSingle();

    const existing = (current?.onboarding_data ?? {}) as Record<string, unknown>;
    updates.onboarding_data = { ...existing, ...parsed.data.onboardingData };
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true });
  }

  // The auth trigger that seeds public.profiles does not always fire, which left
  // users with no profile row at all. UPDATE then matched zero rows and Supabase
  // reported no error, so onboarding "saved" successfully while persisting
  // nothing — and /auth/callback sent the user straight back to /onboarding on
  // the next login. Create the row first, then verify the write landed.
  const ensured = await ensureUserProfile(session);
  if (!ensured.ok) {
    return NextResponse.json({ error: ensured.error }, { status: 500 });
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", session.id)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!updated || updated.length === 0) {
    console.error("[api/me/profile] update matched no profile row", { userId: session.id });
    return NextResponse.json({ error: "Không tìm thấy hồ sơ người dùng." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
