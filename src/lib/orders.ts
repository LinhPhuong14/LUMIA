import type { TierCode } from "@/lib/product-tiers";
import { getProductTier } from "@/lib/product-tiers";
import type { OrderStatus } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  preparing: "Đang chuẩn bị",
  shipping: "Đang giao hàng",
  delivered: "Đã giao hàng",
};

export type OrderEntry = {
  id: string;
  status: OrderStatus;
  payosOrderId: string | null;
  amount: number;
  tier: TierCode | null;
  tierName: string | null;
  durationMonths: number | null;
  hasPhysicalBox: boolean;
  createdAt: string;
};

export function getOrderStatusLabel(status: string) {
  return orderStatusLabels[status as OrderStatus] ?? "Đang xử lý";
}

export function mapOrderRow(order: {
  id: string;
  status: string;
  payos_order_id: string | null;
  amount: number;
  tier?: string | null;
  duration_months?: number | null;
  has_physical_box?: boolean;
  created_at: string;
}): OrderEntry {
  const tier = (order.tier as TierCode | null) ?? null;
  return {
    id: order.id,
    status: order.status as OrderStatus,
    payosOrderId: order.payos_order_id,
    amount: order.amount,
    tier,
    tierName: tier ? getProductTier(tier).name : null,
    durationMonths: order.duration_months ?? null,
    hasPhysicalBox: order.has_physical_box ?? false,
    createdAt: order.created_at,
  };
}

export async function getRecentOrdersForUser(userId: string, limit = 5): Promise<OrderEntry[]> {
  const admin = createAdminClient();
  if (!admin) {
    return [];
  }

  const { data } = await admin
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map(mapOrderRow);
}

export async function getLatestOrderForUser(userId: string): Promise<OrderEntry | null> {
  const [latest] = await getRecentOrdersForUser(userId, 1);
  return latest ?? null;
}

export async function createOrder(params: {
  userId: string;
  payosOrderId: string;
  amount: number;
  tier: TierCode;
  shipping?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    note?: string;
  };
}) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Supabase service role not configured.");
  }

  const product = getProductTier(params.tier);

  const { data, error } = await admin
    .from("orders")
    .insert({
      user_id: params.userId,
      payos_order_id: params.payosOrderId,
      amount: params.amount,
      tier: params.tier,
      duration_months: product.durationMonths,
      has_physical_box: product.hasPhysicalBox,
      physical_box_type: product.physicalBoxType,
      status: "pending_payment",
      shipping_name: params.shipping?.name ?? null,
      shipping_phone: params.shipping?.phone ?? null,
      shipping_address: params.shipping?.address ?? null,
      shipping_city: params.shipping?.city ?? null,
      shipping_note: params.shipping?.note ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Supabase service role not configured.");
  }

  const { data, error } = await admin.from("orders").update({ status }).eq("id", orderId).select().single();
  if (error) {
    throw error;
  }
  return data;
}
