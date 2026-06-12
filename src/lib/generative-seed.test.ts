import { describe, expect, it } from "vitest";

import { hashSeed, seededRandom } from "./generative-seed";

describe("hashSeed", () => {
  it("returns deterministic output for the same input", () => {
    expect(hashSeed("user-123")).toBe(hashSeed("user-123"));
    expect(hashSeed("2026-06-11")).toBe(hashSeed("2026-06-11"));
  });

  it("returns different values for different inputs", () => {
    expect(hashSeed("a")).not.toBe(hashSeed("b"));
  });
});

describe("seededRandom", () => {
  it("produces repeatable sequences", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });
});
