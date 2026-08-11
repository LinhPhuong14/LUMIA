import { NextResponse } from "next/server";
import { z } from "zod";

import { describeSchemaError, isMissingTableError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MIGRATION = "028_create_feedback.sql";

const schema = z.object({
  category: z.enum(["bug", "feature", "content", "ux", "other"]),
  rating: z.number().int().min(1).max(5).optional(),
  message: z.string().min(1).max(2000),
  wishes: z.string().max(1000).optional(),
  isPublic: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error("[feedback] validation error:", JSON.stringify(parsed.error.flatten()));
    return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
  }

  const { category, rating, message, wishes, isPublic } = parsed.data;

  const { error } = await supabase.from("feedback").insert({
    user_id: user?.id ?? null,
    category,
    rating: rating ?? null,
    message,
    wishes: wishes ?? null,
    is_public: isPublic,
  });

  if (error) {
    // Trước đây lỗi bị nuốt hoàn toàn — không log, không phân loại. Nút "Gửi
    // phản hồi" chỉ hiện một câu chung, còn log server thì trống, nên không có
    // đường nào lần ra nguyên nhân.
    console.error("[feedback] insert failed:", error.code, error.message);
    return NextResponse.json(
      {
        error: isMissingTableError(error)
          ? "Tính năng góp ý chưa sẵn sàng (thiếu cấu hình cơ sở dữ liệu). Vui lòng báo quản trị viên."
          : "Không thể lưu phản hồi",
        detail: describeSchemaError(error, MIGRATION),
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ feedback: [] });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ feedback: [] });
  }

  const { data, error } = await supabase
    .from("feedback")
    .select("id, category, rating, message, wishes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    // Danh sách rỗng lặng lẽ là câu trả lời sai nguy hiểm: nó đọc thành "bạn
    // chưa gửi phản hồi nào" kể cả khi bảng không tồn tại.
    console.error("[feedback] list failed:", error.code, error.message);
    return NextResponse.json(
      { feedback: [], error: describeSchemaError(error, MIGRATION) },
      { status: 500 },
    );
  }

  return NextResponse.json({ feedback: data ?? [] });
}
