import { NextResponse } from "next/server";

import { canCancelOrder, describeCancelBlock } from "@/lib/store-orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

/**
 * Khách tự huỷ đơn cửa hàng của mình.
 *
 * Đi bằng service role thay vì mở policy UPDATE trên `store_orders`: một policy
 * `USING (auth.uid() = user_id)` sẽ cho khách sửa mọi cột — `total_vnd`, `items`,
 * hay lật thẳng status sang 'delivered'. Ràng buộc thật là "chỉ đổi status sang
 * 'cancelled', và chỉ khi đơn chưa rời kho", nên nó được kiểm ở đây, còn quyền
 * ghi thì không giao cho trình duyệt.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const { id } = await params;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });
  }

  const { data: order, error } = await admin
    .from("store_orders")
    .select("id,user_id,status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[store/orders/cancel] read failed:", error.message);
    return NextResponse.json({ error: "Không đọc được đơn hàng." }, { status: 500 });
  }

  // Đơn của người khác trả 404 chứ không phải 403: 403 xác nhận đơn đó có thật,
  // đủ để dò xem mã nào tồn tại.
  if (!order || order.user_id !== session.id) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  if (!canCancelOrder(order.status)) {
    return NextResponse.json({ error: describeCancelBlock(order.status) }, { status: 409 });
  }

  // Điều kiện trạng thái lặp lại trong chính câu UPDATE: giữa lúc đọc và lúc ghi,
  // admin có thể vừa bấm "đang giao hàng". Không có mệnh đề này thì đơn đã lên
  // đường vẫn bị huỷ, và cái thua cuộc lại là kiện hàng ngoài đời.
  const { data: updated, error: updateError } = await admin
    .from("store_orders")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", order.id)
    .in("status", ["pending_payment", "paid", "preparing"])
    .select("id,status")
    .maybeSingle();

  if (updateError) {
    console.error("[store/orders/cancel] update failed:", updateError.message);
    return NextResponse.json({ error: "Không huỷ được đơn hàng." }, { status: 500 });
  }

  if (!updated) {
    return NextResponse.json(
      { error: "Đơn vừa được cập nhật trạng thái nên không huỷ được nữa. Vui lòng tải lại trang." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, status: updated.status });
}
