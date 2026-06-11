import { NextResponse } from "next/server";
import { z } from "zod";

import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

const schema = z.object({
  answers: z.array(z.number().int().min(1).max(5)).min(5).max(7),
});

function computeResult(avg: number) {
  if (avg >= 4) return { label: "Đang căng thẳng cao", categories: ["breathing", "guided_meditation"] };
  if (avg >= 3) return { label: "Đang căng thẳng nhẹ", categories: ["wind_down", "mini_meditation"] };
  if (avg >= 2) return { label: "Khá ổn định", categories: ["sleep_music", "sleep_sound"] };
  return { label: "Khá bình yên", categories: ["sleep_sound", "guided_meditation"] };
}

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ hasTaken: false, results: [] });
  }

  const { data } = await admin
    .from("mood_test_results")
    .select("*")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    hasTaken: (data?.length ?? 0) > 0,
    count: data?.length ?? 0,
    latest: data?.[0] ?? null,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getSubscriptionSnapshot(session.id);
  const admin = createAdminClient();

  if (!snapshot.isActive && admin) {
    const { count } = await admin
      .from("mood_test_results")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.id);
    if ((count ?? 0) >= 1) {
      return NextResponse.json({ error: "Free tier chỉ làm mood test 1 lần." }, { status: 403 });
    }
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const avg = parsed.data.answers.reduce((a, b) => a + b, 0) / parsed.data.answers.length;
  const result = computeResult(avg);

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("mood_test_results")
    .insert({
      user_id: session.id,
      answers: parsed.data.answers,
      result_label: result.label,
      recommendations: result.categories,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
