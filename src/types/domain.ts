export type TierCode = "free" | "1m" | "3m" | "5m" | "gift";

export type ProductDefinition = {
  slug: string;
  tier: TierCode;
  tierLabel: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  durationMonths: number;
  gradient: string;
  ritualFocus: string;
  digitalAccess: string;
  physicalItems: string[];
  features: string[];
  badge?: string;
  ctaLabel: string;
};

export type FeatureFlagKey = "journal" | "audio" | "ai" | "streak";
