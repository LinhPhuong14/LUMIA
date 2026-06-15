import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/streak";
import { localDateString } from "@/lib/local-date";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

const stickerSchema = z.object({
  id: z.string(),
  emoji: z.string(),
  imageUrl: z.string().optional(),
  x: z.number(),
  y: z.number(),
  size: z.number().optional(),
});

const metaSchema = z.object({
  fontFamily: z.enum(["serif", "sans", "hand"]).optional(),
  textColor: z.string().optional(),
  stickers: z.array(stickerSchema).optional(),
});

const schema = z.object({
  content: z.string().min(1),
  promptUsed: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ.")
    .optional(),
  meta: metaSchema.optional(),
});

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để tiếp tục." }, { status: 401 });
  }

  // (#007) Journal read also requires active subscription for consistency
  const snapshot = await getSubscriptionSnapshot(session.id);
  if (!snapshot.isActive) {
    return NextResponse.json({ error: "Cần hành trình active để xem nhật ký." }, { status: 403 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", session.id)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Không thể tải nhật ký. Vui lòng thử lại." }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để tiếp tục." }, { status: 401 });
  }

  const snapshot = await getSubscriptionSnapshot(session.id);
  if (!snapshot.isActive) {
    return NextResponse.json({ error: "Cần hành trình active để viết nhật ký." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const today = localDateString();
  const date = parsed.data.date ?? today;

  // Reject future dates
  if (date > today) {
    return NextResponse.json({ error: "Không thể lưu nhật ký cho ngày trong tương lai." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .upsert(
      {
        user_id: session.id,
        content: parsed.data.content,
        prompt_used: parsed.data.promptUsed ?? null,
        meta: parsed.data.meta ?? {},
        date,
      },
      { onConflict: "user_id,date" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Không thể lưu nhật ký. Vui lòng thử lại." }, { status: 500 });
  }

  await logActivity(session.id, "journal");
  return NextResponse.json(data);
}
