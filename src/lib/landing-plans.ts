import {
  boxCardBySlug,
  landingBoxCards,
  type LandingBoxCard,
} from "@/components/landing/data/landing-content";
import { createClient } from "@/lib/supabase/server";

/** LandingBoxCard without the (non-serializable) Lucide icon component, so it can
 *  be passed from a server component to a client component. The client re-attaches
 *  the icon by slug. */
export type LandingBoxCardData = Omit<LandingBoxCard, "icon">;

function stripIcon(card: LandingBoxCard): LandingBoxCardData {
  const { icon: _icon, ...rest } = card;
  return rest;
}

function formatVnd(n: number): string {
  return n.toLocaleString("vi-VN") + "đ";
}

/**
 * Membership plans for the landing "Gói LUMIA" grid, sourced from the admin-managed
 * `subscription_plans` table and merged with each tier's static visual identity
 * (icon, gradient, tagline…). Falls back to the hardcoded tiers when the table is
 * empty or Supabase is unavailable — matching the pattern PromoSection already uses.
 */
export async function getLandingBoxCards(): Promise<LandingBoxCardData[]> {
  const supabase = await createClient();
  if (!supabase) return landingBoxCards.map(stripIcon);

  const { data, error } = await supabase
    .from("subscription_plans")
    .select(
      "id,name,price_vnd,duration_months,features,is_featured,is_active,is_first_time_only,sort_order",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return landingBoxCards.map(stripIcon);
  }

  const cards = data
    // first-time / promo plans are surfaced by PromoSection, not the tier grid
    .filter((plan) => !plan.is_first_time_only)
    .map((plan) => {
      const base = boxCardBySlug[plan.id];
      const dbFeatures = (plan.features as string[] | null) ?? [];
      return {
        slug: plan.id,
        name: plan.name ?? base?.name ?? plan.id,
        price: formatVnd(plan.price_vnd),
        per: `${plan.duration_months ?? 1} tháng`,
        // DB features are authoritative when present; otherwise keep the rich static copy
        features: dbFeatures.length > 0 ? dbFeatures : base?.features ?? [],
        featured: plan.is_featured ?? base?.featured ?? false,
        // presentation-only fields live in the static tier map
        blurb: base?.blurb ?? "",
        tagline: base?.tagline ?? "",
        idealFor: base?.idealFor ?? "",
        gradient: base?.gradient ?? "var(--gradient-lime)",
        badge: base?.badge,
        photoTier: base?.photoTier ?? "standard",
      } satisfies LandingBoxCardData;
    });

  return cards.length > 0 ? cards : landingBoxCards.map(stripIcon);
}
