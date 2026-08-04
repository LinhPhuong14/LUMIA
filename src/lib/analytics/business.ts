import "server-only";

import type { DateRange } from "@/lib/analytics/date-range";
import type { BusinessReport, BusinessTrendPoint, SourceState } from "@/lib/analytics/types";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Số liệu kinh doanh đọc thẳng từ Supabase — đây là dữ liệu **thật**, không
 * bao giờ bị thay bằng dữ liệu mẫu. Đơn hàng nằm ở hai bảng: `orders` (gói
 * subscription/box) và `store_orders` (sản phẩm lẻ trong cửa hàng).
 */

/** Chỉ tính đơn đã thu được tiền — `pending_payment`/`cancelled` không phải doanh thu. */
const PAID_STATUSES = ["paid", "preparing", "shipping", "delivered"];

type OrderRow = { amount: number; created_at: string };

function startOfDay(isoDate: string): string {
  return `${isoDate}T00:00:00.000Z`;
}

function endOfDay(isoDate: string): string {
  return `${isoDate}T23:59:59.999Z`;
}

function sumRevenue(orders: OrderRow[]): number {
  return orders.reduce((total, order) => total + (order.amount ?? 0), 0);
}

/** Gộp doanh thu theo ngày, giữ cả ngày không có đơn để biểu đồ không bị đứt. */
function buildTrend(orders: OrderRow[], range: DateRange): BusinessTrendPoint[] {
  const byDate = new Map<string, { revenue: number; orders: number }>();

  const cursor = new Date(startOfDay(range.startDate));
  const end = new Date(startOfDay(range.endDate));
  while (cursor.getTime() <= end.getTime()) {
    byDate.set(cursor.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  for (const order of orders) {
    const date = order.created_at.slice(0, 10);
    const bucket = byDate.get(date);
    if (bucket) {
      bucket.revenue += order.amount ?? 0;
      bucket.orders += 1;
    }
  }

  return [...byDate.entries()].map(([date, bucket]) => ({ date, ...bucket }));
}

/**
 * Ngày tạo profile sớm nhất — mốc "mở bán" để dữ liệu mẫu bám theo tuổi thật
 * của site. Tách riêng để tab chỉ xem traffic không phải kéo cả báo cáo doanh thu.
 */
export async function fetchFirstProfileAt(): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const { data } = await admin
    .from("profiles")
    .select("created_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (data?.created_at as string | undefined) ?? null;
}

export async function fetchBusinessReport(
  range: DateRange,
): Promise<SourceState<BusinessReport>> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      status: "not_configured",
      message: "Cần SUPABASE_SECRET_KEY để đọc số liệu đơn hàng.",
      data: null,
    };
  }

  async function loadOrders(from: string, to: string): Promise<OrderRow[]> {
    const [subscriptionOrders, storeOrders] = await Promise.all([
      admin!
        .from("orders")
        .select("amount,created_at")
        .in("status", PAID_STATUSES)
        .gte("created_at", startOfDay(from))
        .lte("created_at", endOfDay(to)),
      admin!
        .from("store_orders")
        .select("total_vnd,created_at")
        .in("status", PAID_STATUSES)
        .gte("created_at", startOfDay(from))
        .lte("created_at", endOfDay(to)),
    ]);

    if (subscriptionOrders.error) {
      throw new Error(subscriptionOrders.error.message);
    }

    return [
      ...(subscriptionOrders.data ?? []).map((row) => ({
        amount: row.amount as number,
        created_at: row.created_at as string,
      })),
      // Bảng store_orders có thể chưa được migrate trên project cũ — thiếu thì bỏ qua.
      ...(storeOrders.error
        ? []
        : (storeOrders.data ?? []).map((row) => ({
            amount: row.total_vnd as number,
            created_at: row.created_at as string,
          }))),
    ];
  }

  try {
    const [current, previous, signups, previousSignups, firstProfile] = await Promise.all([
      loadOrders(range.startDate, range.endDate),
      loadOrders(range.previousStartDate, range.previousEndDate),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfDay(range.startDate))
        .lte("created_at", endOfDay(range.endDate)),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfDay(range.previousStartDate))
        .lte("created_at", endOfDay(range.previousEndDate)),
      admin
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    const revenue = sumRevenue(current);
    const previousRevenue = sumRevenue(previous);

    return {
      status: "ok",
      data: {
        revenue,
        previousRevenue,
        orders: current.length,
        previousOrders: previous.length,
        signups: signups.count ?? 0,
        previousSignups: previousSignups.count ?? 0,
        averageOrderValue: current.length > 0 ? revenue / current.length : 0,
        previousAverageOrderValue:
          previous.length > 0 ? previousRevenue / previous.length : 0,
        firstProfileAt: (firstProfile.data?.created_at as string | undefined) ?? null,
        trend: buildTrend(current, range),
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Không đọc được số liệu đơn hàng.",
      data: null,
    };
  }
}
