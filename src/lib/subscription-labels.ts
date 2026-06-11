import type { SubscriptionSnapshot } from "@/lib/subscriptions";

export type PlanBadgeVariant = "free" | "active" | "expired";

export function getPlanBadgeVariant(snapshot: SubscriptionSnapshot): PlanBadgeVariant {
  if (snapshot.isActive) return "active";
  if (snapshot.status === "expired") return "expired";
  return "free";
}

export function getPlanDisplayLabel(snapshot: SubscriptionSnapshot): string {
  if (snapshot.isActive && snapshot.tierName) {
    const days = snapshot.daysRemaining ?? 0;
    return `${snapshot.tierName} · Còn ${days} ngày`;
  }
  if (snapshot.isActive) {
    return "Đang dùng";
  }
  if (snapshot.status === "expired") {
    return "Đã kết thúc · Gia hạn →";
  }
  return "Dùng thử · Nâng cấp →";
}

export function getSubscriptionStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Đang dùng";
    case "expired":
      return "Đã kết thúc";
    case "free":
      return "Dùng thử";
    default:
      return status;
  }
}

export function getPhysicalBoxStatusLabel(status: string | null): string {
  switch (status) {
    case "paid":
      return "Đã thanh toán — chờ chuẩn bị";
    case "preparing":
      return "Đang chuẩn bị";
    case "shipping":
      return "Đang giao hàng";
    case "delivered":
      return "Đã giao hàng";
    default:
      return "Chưa có thông tin";
  }
}
