import "server-only";

import type { BoxProduct } from "@/data/catalog";
import { getServiceOrUserClient } from "@/lib/supabase/db";

/** A row of the admin-managed `subscription_plans` table (id = tier code). */
export type DbPlan = {
  id: string;
  name: string;
  description: string | null;
  group_name: string;
  price_vnd: number;
  duration_months: number;
  has_physical_box: boolean;
  physical_box_type: string | null;
  discount_percent: number;
  is_featured: boolean;
  is_first_time_only: boolean;
  is_active: boolean;
  features: string[];
  sort_order: number;
  box_image_url: string | null;
};

const PLAN_COLUMNS =
  "id,name,description,group_name,price_vnd,duration_months,has_physical_box,physical_box_type,discount_percent,is_featured,is_first_time_only,is_active,features,sort_order,box_image_url";

/** One active plan by tier code (subscription_plans.id). null if none/DB down. */
export async function getDbPlanByTier(tier: string): Promise<DbPlan | null> {
  const client = await getServiceOrUserClient();
  if (!client) return null;
  const { data } = await client
    .from("subscription_plans")
    .select(PLAN_COLUMNS)
    .eq("id", tier)
    .eq("is_active", true)
    .maybeSingle();
  return (data as DbPlan | null) ?? null;
}

/** All active plans, ordered for display. Empty array if none/DB down. */
export async function getActiveDbPlans(): Promise<DbPlan[]> {
  const client = await getServiceOrUserClient();
  if (!client) return [];
  const { data } = await client
    .from("subscription_plans")
    .select(PLAN_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as DbPlan[] | null) ?? [];
}

/**
 * Overlay the admin-managed plan (name/price/features/featured) onto a static
 * catalog product so pages that render a BoxProduct reflect /admin edits while
 * keeping the tier's structural + visual fields. No-op if the plan isn't in DB.
 */
export async function withDbPricing(product: BoxProduct): Promise<BoxProduct> {
  const plan = await getDbPlanByTier(product.tier);
  if (!plan) return product;
  const dbFeatures = Array.isArray(plan.features) ? plan.features : [];
  return {
    ...product,
    name: plan.name ?? product.name,
    price: typeof plan.price_vnd === "number" ? plan.price_vnd : product.price,
    features: dbFeatures.length > 0 ? dbFeatures : product.features,
    featured: plan.is_featured ?? product.featured,
  };
}
