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
    return NextResponse.json({ error: "Bạn cần đăng nhập để tiếp tục." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  const profile = await ensureUserProfile(session);
  if (!profile.ok) {
    return NextResponse.json({ error: "Không thể xác minh hồ sơ người dùng." }, { status: 500 });
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
    return NextResponse.json({ error: "Không thể lưu cảm xúc. Vui lòng thử lại." }, { status: 500 });
  }

  await logActivity(session.id, "mood");
  return NextResponse.json(data);
}
