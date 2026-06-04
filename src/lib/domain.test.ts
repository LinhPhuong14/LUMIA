import { describe, expect, it } from "vitest";

import { getTierPriority, resolveEntitlementSummary } from "@/lib/domain";
import { slugify, toOrderCode } from "@/lib/utils";

describe("domain helpers", () => {
  it("orders tiers from free to 5m", () => {
    expect(getTierPriority("free")).toBeLessThan(getTierPriority("1m"));
    expect(getTierPriority("1m")).toBeLessThan(getTierPriority("3m"));
    expect(getTierPriority("3m")).toBeLessThan(getTierPriority("5m"));
  });

  it("returns fallback summary for free tier", () => {
    const summary = resolveEntitlementSummary("free");
    expect(summary.tier).toBe("free");
    expect(summary.features.length).toBeGreaterThan(0);
  });

  it("creates URL-safe slugs", () => {
    expect(slugify("LUMIA Signature Box 5M")).toBe("lumia-signature-box-5m");
  });

  it("creates a numeric order code", () => {
    const code = toOrderCode(123);
    expect(typeof code).toBe("number");
    expect(`${code}`).toMatch(/^\d{9,12}$/);
  });
});
