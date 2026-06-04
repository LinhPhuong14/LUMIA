import { addMonths, getTierPriority, resolveEntitlementSummary } from "@/lib/domain";
import { SubscriptionEntitlementModel } from "@/models";
import type { TierCode } from "@/types/domain";

export async function getActiveEntitlementForUser(userId: string) {
  return SubscriptionEntitlementModel.findOne({
    userId,
    status: "active",
    endsAt: { $gt: new Date() },
  })
    .sort({ endsAt: -1 })
    .lean();
}

export async function getSubscriptionSnapshot(userId: string) {
  const entitlement = await getActiveEntitlementForUser(userId);

  if (!entitlement) {
    return {
      tier: "free" as TierCode,
      status: "inactive",
      endsAt: null,
      features: resolveEntitlementSummary("free").features,
    };
  }

  return {
    tier: entitlement.tier as TierCode,
    status: entitlement.status,
    endsAt: entitlement.endsAt,
    features: resolveEntitlementSummary(entitlement.tier as TierCode).features,
  };
}

export async function grantEntitlement(params: {
  userId: string;
  tier: TierCode;
  durationMonths: number;
  source: "order" | "activation_code" | "admin";
  orderId?: string;
  activationCodeId?: string;
}) {
  const existing = await getActiveEntitlementForUser(params.userId);
  const startAt = new Date();
  const currentEnd = existing?.endsAt ? new Date(existing.endsAt) : startAt;
  const carryOverStart = currentEnd > startAt && getTierPriority(existing.tier as TierCode) >= getTierPriority(params.tier) ? currentEnd : startAt;
  const endsAt = addMonths(carryOverStart, params.durationMonths);

  if (existing && getTierPriority(existing.tier as TierCode) <= getTierPriority(params.tier)) {
    await SubscriptionEntitlementModel.updateOne({ _id: existing.id }, { status: "expired" });
  }

  return SubscriptionEntitlementModel.create({
    userId: params.userId,
    tier: params.tier,
    source: params.source,
    orderId: params.orderId,
    activationCodeId: params.activationCodeId,
    startsAt: startAt,
    endsAt,
    status: "active",
  });
}
