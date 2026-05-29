import { describe, it, expect } from "vitest";
import { Buddy } from "@/domain/entities/buddy.js";
import { Mood } from "@/domain/value-objects/mood.js";
import type { BuddyMetadata } from "@/domain/value-objects/buddy-metadata.js";

const META: BuddyMetadata = {
  name: "Segfault",
  description: "A grizzled C++ veteran.",
  talent: "manual memory management",
};

describe("Buddy.create", () => {
  it("should assign a uuid id", () => {
    const buddy = Buddy.create(META);
    expect(buddy.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("should copy metadata fields", () => {
    const buddy = Buddy.create(META);
    expect(buddy.name).toBe("Segfault");
    expect(buddy.description).toBe("A grizzled C++ veteran.");
    expect(buddy.talent).toBe("manual memory management");
  });

  it("should default mood to IDLE", () => {
    const buddy = Buddy.create(META);
    expect(buddy.mood).toBe(Mood.IDLE);
  });

  it("should start with empty phrase history", () => {
    const buddy = Buddy.create(META);
    expect(buddy.phraseHistory).toHaveLength(0);
  });

  it("should use provided species when given", () => {
    const buddy = Buddy.create(META, "crash");
    expect(buddy.species).toBe("crash");
  });

  it("should assign a valid species when none provided", () => {
    const buddy = Buddy.create(META);
    expect(["crash", "generic-dev"]).toContain(buddy.species);
  });
});

describe("Buddy.withMood", () => {
  it("should return a new Buddy with the updated mood", () => {
    const buddy = Buddy.create(META);
    const happy = buddy.withMood(Mood.HAPPY);
    expect(happy.mood).toBe(Mood.HAPPY);
    expect(buddy.mood).toBe(Mood.IDLE);
  });

  it("should preserve all other fields", () => {
    const buddy = Buddy.create(META, "crash");
    const talking = buddy.withMood(Mood.TALKING);
    expect(talking.id).toBe(buddy.id);
    expect(talking.name).toBe(buddy.name);
    expect(talking.species).toBe("crash");
  });
});

describe("Buddy.withPhrase", () => {
  it("should prepend the phrase to history", () => {
    const buddy = Buddy.create(META);
    const updated = buddy.withPhrase("undefined is not a function");
    expect(updated.phraseHistory[0]).toBe("undefined is not a function");
  });

  it("should cap history at 10 entries", () => {
    let buddy = Buddy.create(META);
    for (let i = 0; i < 12; i++) {
      buddy = buddy.withPhrase(`phrase ${i}`);
    }
    expect(buddy.phraseHistory).toHaveLength(10);
  });

  it("should keep the most recent phrase first", () => {
    let buddy = Buddy.create(META);
    buddy = buddy.withPhrase("first");
    buddy = buddy.withPhrase("second");
    expect(buddy.phraseHistory[0]).toBe("second");
  });
});
