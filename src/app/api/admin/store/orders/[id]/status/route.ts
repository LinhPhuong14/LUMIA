import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

/**
 * `pending_payment` không có ở đây: đơn cửa hàng chỉ mở COD nên không bao giờ
 * chờ thanh toán online, và cho admin lùi ngược về đó chỉ tạo ra một trạng thái
 * không ai xử lý.
 */
const schema = z.object({
  status: z.enum(["preparing", "shipping", "delivered", "cancelled"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("store_orders")
    .update({
      status: parsed.data.status,
      // Ghi mốc huỷ ở mọi đường huỷ, không riêng đường của khách — nếu không,
      // đơn admin huỷ sẽ trông như chưa từng bị huỷ khi tra lại sau này.
      ...(parsed.data.status === "cancelled" ? { cancelled_at: new Date().toISOString() } : {}),
    })
    .eq("id", id)
    .select("id,status")
    .maybeSingle();

  if (error) {
    console.error("[admin/store/orders] status update failed:", error.message);
    return NextResponse.json({ error: "Không cập nhật được trạng thái." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, status: data.status });
}
