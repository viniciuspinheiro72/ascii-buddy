import { describe, it, expect } from "vitest";
import { FallbackPhraseStore } from "@/infra/ai/fallback-phrase-store.js";

describe("FallbackPhraseStore", () => {
  it("should return a non-empty string", () => {
    expect(FallbackPhraseStore.getRandom()).toBeTruthy();
  });

  it("should return a string within the 120-char speech bubble limit", () => {
    // Run enough times to catch outliers
    for (let i = 0; i < 50; i++) {
      expect(FallbackPhraseStore.getRandom().length).toBeLessThanOrEqual(120);
    }
  });

  it("should have at least 50 phrases", () => {
    expect(FallbackPhraseStore.getAll().length).toBeGreaterThanOrEqual(50);
  });

  it("should return different phrases across multiple calls", () => {
    const sample = new Set(Array.from({ length: 30 }, () => FallbackPhraseStore.getRandom()));
    expect(sample.size).toBeGreaterThan(1);
  });
});
