import "server-only";

import {
  mapStoreOrderRow,
  STORE_ORDER_COLUMNS,
  type StoreOrderEntry,
  type StoreOrderRow,
} from "@/lib/store-orders";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Đọc đơn cửa hàng của một người.
 *
 * Đi bằng service role và lọc `user_id` trong code, giống `getRecentOrdersForUser`
 * cho đơn gói thành viên — không dựa vào RLS. Lý do: policy trả 0 dòng và policy
 * đúng-nhưng-chưa-có-đơn cho ra cùng một màn hình trống, nên một trục trặc quyền
 * sẽ hiện ra dưới dạng "bạn chưa có đơn nào" — câu sai nguy hiểm nhất có thể nói
 * với người vừa trả tiền.
 *
 * Tách khỏi `store-orders.ts` vì file đó được import từ component client; kéo
 * `server-only` vào đấy là hỏng build.
 */
export async function getStoreOrdersForUser(
  userId: string,
  limit = 50,
): Promise<{ orders: StoreOrderEntry[]; error: string | null }> {
  const admin = createAdminClient();
  if (!admin) {
    return { orders: [], error: "Hệ thống dữ liệu chưa sẵn sàng." };
  }

  const { data, error } = await admin
    .from("store_orders")
    .select(STORE_ORDER_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[store-orders] list failed:", error.message);
    // Cột chưa có = chưa chạy migration 027.
    const missingColumn = /payment_method|cancelled_at/.test(error.message);
    return {
      orders: [],
      error: missingColumn
        ? "Danh sách đơn chưa dùng được (thiếu cấu hình cơ sở dữ liệu)."
        : "Không tải được danh sách đơn hàng.",
    };
  }

  return {
    orders: (data ?? []).map((row) => mapStoreOrderRow(row as unknown as StoreOrderRow)),
    error: null,
  };
}
