import { describe, it, expect } from "vitest";
import { Mood, moodToState } from "@/domain/value-objects/mood.js";

describe("moodToState", () => {
  it("should convert each Mood enum value to its lowercase MoodState key", () => {
    expect(moodToState(Mood.IDLE)).toBe("idle");
    expect(moodToState(Mood.HAPPY)).toBe("happy");
    expect(moodToState(Mood.SAD)).toBe("sad");
    expect(moodToState(Mood.TALKING)).toBe("talking");
    expect(moodToState(Mood.SLEEPING)).toBe("sleeping");
  });
});
