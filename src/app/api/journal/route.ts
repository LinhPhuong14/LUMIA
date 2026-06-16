import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/streak";
import { localDateString } from "@/lib/local-date";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

const metaSchema = z.object({
  title: z.string().max(200).optional(),
  fontFamily: z.enum(["serif", "sans", "hand"]).optional(),
  textColor: z.string().optional(),
  stickers: z.array(z.any()).optional(),
});

const schema = z.object({
  id: z.string().uuid().optional(), // present = update, absent = create
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
    .order("created_at", { ascending: false });

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

  if (date > today) {
    return NextResponse.json({ error: "Không thể lưu nhật ký cho ngày trong tương lai." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  const { id, content, promptUsed, meta } = parsed.data;

  // UPDATE existing entry by id
  if (id) {
    const { data, error } = await supabase
      .from("journal_entries")
      .update({ content, prompt_used: promptUsed ?? null, meta: meta ?? {}, date })
      .eq("id", id)
      .eq("user_id", session.id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: "Không thể cập nhật nhật ký." }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  // INSERT new entry — multiple entries per day allowed (migration 014 removed UNIQUE constraint)
  const payload = {
    user_id: session.id,
    content,
    prompt_used: promptUsed ?? null,
    meta: meta ?? {},
    date,
  };

  const { data, error } = await supabase
    .from("journal_entries")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[journal POST]", error.code, error.message);
    return NextResponse.json({ error: "Không thể lưu nhật ký. Vui lòng thử lại." }, { status: 500 });
  }

  await logActivity(session.id, "journal");
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu id." }, { status: 400 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Lỗi hệ thống." }, { status: 503 });

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", session.id);

  if (error) return NextResponse.json({ error: "Không thể xóa." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
