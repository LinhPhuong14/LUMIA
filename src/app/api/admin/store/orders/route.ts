import { NextResponse } from "next/server";

import { mapStoreOrderRow, STORE_ORDER_COLUMNS, type StoreOrderRow } from "@/lib/store-orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Đơn cửa hàng cho trang quản trị.
 *
 * Role gating do src/proxy.ts lo (service-role check trên /api/admin/*), ở đây
 * chỉ cần chắc là có phiên — giống các route admin khác.
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
    .from("store_orders")
    .select(`${STORE_ORDER_COLUMNS}, guest_email, profiles(full_name, email)`)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("[admin/store/orders] list failed:", error.message);
    return NextResponse.json({ error: "Không thể tải danh sách đơn hàng." }, { status: 500 });
  }

  type Joined = StoreOrderRow & {
    guest_email?: string | null;
    profiles?: { full_name?: string | null; email?: string | null } | null;
  };

  const orders = ((data ?? []) as unknown as Joined[]).map((row) => ({
    ...mapStoreOrderRow(row),
    // Khách vãng lai không có profile — vẫn phải liên hệ được, nên rơi về
    // guest_email rồi tới số điện thoại giao hàng.
    customerName: row.profiles?.full_name ?? null,
    customerEmail: row.profiles?.email ?? row.guest_email ?? null,
  }));

  return NextResponse.json({ orders });
}
