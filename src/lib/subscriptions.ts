import type { GatedFeature } from "@/types/domain";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getServiceOrUserClient } from "@/lib/supabase/db";
import type { Subscription, SubscriptionStatus } from "@/lib/supabase/types";

const JOURNEY_DAYS = 21;

export type SubscriptionSnapshot = {
  status: SubscriptionStatus;
  startedAt: string | null;
  expiresAt: string | null;
  boxOrderId: string | null;
  isActive: boolean;
  currentDay: number | null;
};

export function isSubscriptionActive(sub: Pick<Subscription, "status" | "started_at" | "expires_at">): boolean {
  return (
    sub.status === "active" &&
    sub.started_at !== null &&
    sub.expires_at !== null &&
    new Date(sub.expires_at) > new Date()
  );
}

export function getCurrentDay(startedAt: string | null, expiresAt: string | null): number | null {
  if (!startedAt || !expiresAt) {
    return null;
  }
  const start = new Date(startedAt);
  const now = new Date();
  if (now < start) {
    return null;
  }
  const day = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(day, 1), JOURNEY_DAYS);
}

function toSnapshot(sub: Subscription | null): SubscriptionSnapshot {
  if (!sub) {
    return {
      status: "free",
      startedAt: null,
      expiresAt: null,
      boxOrderId: null,
      isActive: false,
      currentDay: null,
    };
  }

  const active = isSubscriptionActive(sub);
  return {
    status: active ? "active" : sub.status === "active" ? "expired" : sub.status,
    startedAt: sub.started_at,
    expiresAt: sub.expires_at,
    boxOrderId: sub.box_order_id,
    isActive: active,
    currentDay: active ? getCurrentDay(sub.started_at, sub.expires_at) : null,
  };
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
  if (sub && sub.status === "active" && sub.expires_at && new Date(sub.expires_at) <= new Date()) {
    const admin = createAdminClient();
    if (admin) {
      await admin.from("subscriptions").update({ status: "expired" }).eq("id", sub.id);
    }
    return toSnapshot({ ...sub, status: "expired" });
  }
  return toSnapshot(sub);
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const snapshot = await getSubscriptionSnapshot(userId);
  return snapshot.status;
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

export async function startJourney(userId: string, orderId: string) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Supabase service role not configured.");
  }

  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).eq("user_id", userId).single();
  if (!order || order.status !== "delivered") {
    throw new Error("Order must be delivered before starting journey.");
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub || sub.status !== "active" || sub.started_at) {
    throw new Error("Subscription not ready to start.");
  }

  const startedAt = new Date();
  const expiresAt = new Date(startedAt);
  expiresAt.setDate(expiresAt.getDate() + JOURNEY_DAYS);

  const { data: updated, error } = await admin
    .from("subscriptions")
    .update({
      started_at: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      box_order_id: orderId,
    })
    .eq("id", sub.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return updated as Subscription;
}

export async function activateSubscriptionAfterPayment(userId: string, orderId: string) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Supabase service role not configured.");
  }

  const { data: existing } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === "active" && existing.started_at && existing.expires_at && new Date(existing.expires_at) > new Date()) {
    return existing as Subscription;
  }

  if (existing) {
    const { data: updated } = await admin
      .from("subscriptions")
      .update({
        status: "active",
        started_at: null,
        expires_at: null,
        box_order_id: orderId,
      })
      .eq("id", existing.id)
      .select()
      .single();
    return updated as Subscription;
  }

  const { data: created, error } = await admin
    .from("subscriptions")
    .insert({
      user_id: userId,
      status: "active",
      started_at: null,
      expires_at: null,
      box_order_id: orderId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return created as Subscription;
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
