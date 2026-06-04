import { lumiaProducts } from "@/data/catalog";
import type { TierCode } from "@/types/domain";

export function getTierPriority(tier: TierCode) {
  switch (tier) {
    case "5m":
      return 4;
    case "3m":
      return 3;
    case "1m":
      return 2;
    default:
      return 1;
  }
}

export function addMonths(date: Date, months: number) {
  const clone = new Date(date);
  clone.setMonth(clone.getMonth() + months);
  return clone;
}

export function getProductFromTier(tier: TierCode) {
  return lumiaProducts.find((product) => product.tier === tier);
}

export function resolveEntitlementSummary(tier: TierCode) {
  const product = getProductFromTier(tier);
  return {
    tier,
    label: product?.name ?? "LUMIA Free",
    features: product?.features ?? ["Mood check-in", "3 bai thien mo dau", "3 luot AI listening moi ngay"],
  };
}
