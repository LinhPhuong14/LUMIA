import type { GatedFeature } from "@/types/domain";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getServiceOrUserClient } from "@/lib/supabase/db";
import {
  addMonths,
  getProductTier,
  isValidTierCode,
  type ProductTier,
  type TierCode,
} from "@/lib/product-tiers";
import type { OrderStatus, Subscription, SubscriptionStatus } from "@/lib/supabase/types";

const PAID_ORDER_STATUSES: OrderStatus[] = ["paid", "preparing", "shipping", "delivered"];

export type SubscriptionSnapshot = {
  status: SubscriptionStatus;
  tier: TierCode | null;
  tierName: string | null;
  durationMonths: number | null;
  startedAt: string | null;
  expiresAt: string | null;
  boxOrderId: string | null;
  isActive: boolean;
  daysRemaining: number | null;
  periodProgress: number | null;
  hasPhysicalBox: boolean;
  physicalBoxStatus: OrderStatus | null;
};

export function isSubscriptionActive(
  sub: Pick<Subscription, "status" | "expires_at">,
): boolean {
  return sub.status === "active" && sub.expires_at !== null && new Date(sub.expires_at) > new Date();
}

export function getDaysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) {
    return null;
  }
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) {
    return 0;
  }
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getPeriodProgress(startedAt: string | null, expiresAt: string | null): number | null {
  if (!startedAt || !expiresAt) {
    return null;
  }
  const start = new Date(startedAt).getTime();
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  if (now <= start) {
    return 0;
  }
  if (now >= end) {
    return 100;
  }
  return Math.round(((now - start) / (end - start)) * 100);
}

function toSnapshot(sub: Subscription | null, physicalBoxStatus: OrderStatus | null = null): SubscriptionSnapshot {
  if (!sub) {
    return {
      status: "free",
      tier: null,
      tierName: null,
      durationMonths: null,
      startedAt: null,
      expiresAt: null,
      boxOrderId: null,
      isActive: false,
      daysRemaining: null,
      periodProgress: null,
      hasPhysicalBox: false,
      physicalBoxStatus: null,
    };
  }

  const active = isSubscriptionActive(sub);
  return {
    status: active ? "active" : sub.status === "active" ? "expired" : sub.status,
    tier: (sub.tier as TierCode | null) ?? null,
    tierName:
      sub.tier && isValidTierCode(sub.tier) ? getProductTier(sub.tier).name : null,
    durationMonths: sub.duration_months,
    startedAt: sub.started_at,
    expiresAt: sub.expires_at,
    boxOrderId: sub.box_order_id,
    isActive: active,
    daysRemaining: active ? getDaysRemaining(sub.expires_at) : getDaysRemaining(sub.expires_at),
    periodProgress: getPeriodProgress(sub.started_at, sub.expires_at),
    hasPhysicalBox: sub.has_physical_box ?? false,
    physicalBoxStatus,
  };
}

async function getPhysicalBoxOrderStatus(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  orderId: string | null,
): Promise<OrderStatus | null> {
  if (!orderId) {
    return null;
  }
  const { data } = await admin.from("orders").select("status").eq("id", orderId).maybeSingle();
  return (data?.status as OrderStatus | undefined) ?? null;
}

export async function getSubscriptionForUser(userId: string): Promise<Subscription | null> {
  const client = await getServiceOrUserClient();
  if (!client) {
    return null;
  }

  const { data } = await client
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as Subscription | null) ?? null;
}

export async function getSubscriptionSnapshot(userId: string): Promise<SubscriptionSnapshot> {
  const sub = await getSubscriptionForUser(userId);
  const admin = createAdminClient();

  if (sub && sub.status === "active" && sub.expires_at && new Date(sub.expires_at) <= new Date()) {
    if (admin) {
      await admin.from("subscriptions").update({ status: "expired" }).eq("id", sub.id);
    }
    const physicalBoxStatus = admin ? await getPhysicalBoxOrderStatus(admin, sub.box_order_id) : null;
    return toSnapshot({ ...sub, status: "expired" }, physicalBoxStatus);
  }

  const physicalBoxStatus =
    admin && sub?.box_order_id ? await getPhysicalBoxOrderStatus(admin, sub.box_order_id) : null;
  return toSnapshot(sub, physicalBoxStatus);
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const snapshot = await getSubscriptionSnapshot(userId);
  return snapshot.status;
}

export async function hasUserBoughtFirstTime(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) {
    return false;
  }

  const { count } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("tier", "first_time")
    .in("status", PAID_ORDER_STATUSES);

  return (count ?? 0) > 0;
}

export function checkAccess(snapshot: SubscriptionSnapshot, feature: GatedFeature): boolean {
  const activeOnly: GatedFeature[] = [
    "journal_write",
    "audio_full",
    "chat",
    "mood_test",
    "breathing",
    "timer",
    "reports",
  ];

  if (!activeOnly.includes(feature)) {
    return true;
  }

  return snapshot.isActive;
}

export async function grantSubscription(userId: string, tier: TierCode, orderId: string) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Supabase service role not configured.");
  }

  const product: ProductTier = getProductTier(tier);
  const startedAt = new Date();
  const expiresAt = addMonths(startedAt, product.durationMonths);

  const { data: existing } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    status: "active" as const,
    tier,
    duration_months: product.durationMonths,
    has_physical_box: product.hasPhysicalBox,
    started_at: startedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    box_order_id: orderId,
  };

  if (existing) {
    const { data: updated, error } = await admin
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) {
      throw error;
    }
    return updated as Subscription;
  }

  const { data: created, error } = await admin
    .from("subscriptions")
    .insert({ user_id: userId, ...payload })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return created as Subscription;
}

/** @deprecated Use grantSubscription from PayOS webhook */
export async function activateSubscriptionAfterPayment(userId: string, orderId: string) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Supabase service role not configured.");
  }

  const { data: order } = await admin.from("orders").select("tier").eq("id", orderId).single();
  if (!order?.tier) {
    throw new Error("Order missing tier.");
  }

  return grantSubscription(userId, order.tier as TierCode, orderId);
}

export async function requireActiveSubscription() {
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const snapshot = await getSubscriptionSnapshot(user.id);
  return snapshot.isActive ? snapshot : null;
}
