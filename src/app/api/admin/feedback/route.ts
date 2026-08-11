import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";
import { describeSchemaError } from "@/lib/supabase/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Góp ý của người dùng, cho trang quản trị.
 *
 * Bảng `feedback` có sẵn policy "Admins can view all feedback" từ migration 010
 * nhưng chưa từng có route hay màn hình nào đọc nó — người dùng gửi góp ý vào
 * một nơi không ai mở. Sửa được nút Gửi mà thiếu chỗ đọc thì tính năng vẫn chưa
 * chạy, chỉ là hỏng ở đoạn sau.
 *
 * Role gating do src/proxy.ts lo (service-role check trên /api/admin/*).
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("feedback")
    .select("id, category, rating, message, wishes, is_public, created_at, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/feedback] list failed:", error.code, error.message);
    return NextResponse.json(
      { feedback: [], error: describeSchemaError(error, "028_create_feedback.sql") },
      { status: 500 },
    );
  }

  type Row = {
    id: string;
    category: string;
    rating: number | null;
    message: string;
    wishes: string | null;
    is_public: boolean;
    created_at: string;
    profiles?: { full_name?: string | null; email?: string | null } | null;
  };

  const feedback = ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    category: row.category,
    rating: row.rating,
    message: row.message,
    wishes: row.wishes,
    isPublic: row.is_public,
    createdAt: row.created_at,
    // Góp ý ẩn danh (user_id null) vẫn phải đọc được — nội dung mới là thứ cần.
    userName: row.profiles?.full_name ?? null,
    userEmail: row.profiles?.email ?? null,
  }));

  return NextResponse.json({ feedback });
}
