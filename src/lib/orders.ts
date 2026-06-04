import { Types } from "mongoose";

import { OrderModel } from "@/models";

export const orderStatusLabels = {
  draft: "Đang chuẩn bị",
  pending_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  provisioning: "Đang mở quyền truy cập",
  fulfilled: "Đã hoàn tất",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
} as const;

export type OrderStatusCode = keyof typeof orderStatusLabels;

export type OrderHistoryItem = {
  productSlug: string;
  productName: string;
  quantity: number;
  tier: string;
  unitPrice: number;
};

export type OrderHistoryEntry = {
  id: string;
  orderCode: number;
  status: OrderStatusCode;
  totalAmount: number;
  tier: string;
  createdAt: Date;
  items: OrderHistoryItem[];
};

function normalizeOrder(order: {
  _id?: unknown;
  id?: string;
  orderCode: number;
  status: OrderStatusCode;
  totalAmount: number;
  tier: string;
  createdAt: Date;
  items?: Array<{
    productSlug: string;
    productName: string;
    quantity: number;
    tier: string;
    unitPrice: number;
  }>;
}): OrderHistoryEntry {
  return {
    id: order.id ?? String(order._id ?? order.orderCode),
    orderCode: order.orderCode,
    status: order.status,
    totalAmount: order.totalAmount,
    tier: order.tier,
    createdAt: order.createdAt,
    items:
      order.items?.map((item) => ({
        productSlug: item.productSlug,
        productName: item.productName,
        quantity: item.quantity,
        tier: item.tier,
        unitPrice: item.unitPrice,
      })) ?? [],
  };
}

function isValidUserId(userId: string) {
  return Types.ObjectId.isValid(userId);
}

export function getOrderStatusLabel(status: string) {
  return orderStatusLabels[status as OrderStatusCode] ?? "Đang xử lý";
}

export function getOrderPrimaryProduct(order: OrderHistoryEntry) {
  return order.items[0] ?? null;
}

export async function getRecentOrdersForUser(userId: string, limit = 5): Promise<OrderHistoryEntry[]> {
  if (!isValidUserId(userId)) {
    return [] satisfies OrderHistoryEntry[];
  }

  const orders = await OrderModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return orders.map((order) =>
    normalizeOrder({
      _id: order._id,
      id: String(order._id),
      orderCode: order.orderCode,
      status: order.status as OrderStatusCode,
      totalAmount: order.totalAmount,
      tier: order.tier,
      createdAt: order.createdAt,
      items: order.items,
    }),
  );
}

export async function getLatestOrderForUser(userId: string): Promise<OrderHistoryEntry | null> {
  const [latestOrder] = await getRecentOrdersForUser(userId, 1);
  return latestOrder ?? null;
}

export async function getLatestCompletedOrderForUser(userId: string): Promise<OrderHistoryEntry | null> {
  if (!isValidUserId(userId)) {
    return null;
  }

  const order = await OrderModel.findOne({
    userId,
    status: { $in: ["paid", "provisioning", "fulfilled"] },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!order) {
    return null;
  }

  return normalizeOrder({
    _id: order._id,
    id: String(order._id),
    orderCode: order.orderCode,
    status: order.status as OrderStatusCode,
    totalAmount: order.totalAmount,
    tier: order.tier,
    createdAt: order.createdAt,
    items: order.items,
  });
}
