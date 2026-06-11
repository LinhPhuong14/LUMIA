import type { SubscriptionSnapshot } from "@/lib/subscriptions";

export type PlanBadgeVariant = "free" | "active" | "expired";

export function getPlanBadgeVariant(snapshot: SubscriptionSnapshot): PlanBadgeVariant {
  if (snapshot.isActive) return "active";
  if (snapshot.status === "expired") return "expired";
  return "free";
}

export function getPlanDisplayLabel(snapshot: SubscriptionSnapshot): string {
  if (snapshot.isActive && snapshot.currentDay) {
    return `Đang dùng · Ngày ${snapshot.currentDay}/21`;
  }
  if (snapshot.isActive) {
    return "Đang dùng";
  }
  if (snapshot.status === "expired") {
    return "Đã kết thúc";
  }
  return "Dùng thử";
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
