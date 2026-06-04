import type { FeatureFlagKey } from "@/types/domain";

export const defaultFeatureFlags: Record<FeatureFlagKey, boolean> = {
  journal: true,
  audio: false,
  ai: true,
  streak: false,
};
