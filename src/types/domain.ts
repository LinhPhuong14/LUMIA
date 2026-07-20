export type OnboardingGoal =
  | "peace"
  | "sleep"
  | "habit"
  | "self_care"
  | "sharing"
  // Legacy values from the original enum, still present on older rows.
  | "stress"
  | "meditation";
export type SubscriptionStatus = "free" | "active" | "expired";
export type OrderStatus = "paid" | "preparing" | "shipping" | "delivered";

export type FeatureFlagKey = "journal" | "audio" | "ai" | "streak";

export type GatedFeature =
  | "journal_write"
  | "audio_full"
  | "chat"
  | "mood_test"
  | "breathing"
  | "timer"
  | "reports";
