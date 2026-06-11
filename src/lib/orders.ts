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
  createdAt: string;
};

export function getOrderStatusLabel(status: string) {
  return orderStatusLabels[status as OrderStatus] ?? "Đang xử lý";
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

  return (data ?? []).map((order) => ({
    id: order.id,
    status: order.status as OrderStatus,
    payosOrderId: order.payos_order_id,
    amount: order.amount,
    createdAt: order.created_at,
  }));
}

export async function getLatestOrderForUser(userId: string): Promise<OrderEntry | null> {
  const [latest] = await getRecentOrdersForUser(userId, 1);
  return latest ?? null;
}

export async function getDeliveredOrderForUser(userId: string): Promise<OrderEntry | null> {
  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const { data } = await admin
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "delivered")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    status: data.status as OrderStatus,
    payosOrderId: data.payos_order_id,
    amount: data.amount,
    createdAt: data.created_at,
  };
}

export async function createOrder(params: {
  userId: string;
  payosOrderId: string;
  amount: number;
}) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Supabase service role not configured.");
  }

  const { data, error } = await admin
    .from("orders")
    .insert({
      user_id: params.userId,
      payos_order_id: params.payosOrderId,
      amount: params.amount,
      status: "pending_payment",
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
