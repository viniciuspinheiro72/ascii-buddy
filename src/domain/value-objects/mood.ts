export enum Mood {
  IDLE = "IDLE",
  HAPPY = "HAPPY",
  SAD = "SAD",
  TALKING = "TALKING",
  SLEEPING = "SLEEPING",
}

export type MoodState = "idle" | "happy" | "sad" | "talking" | "sleeping";

export function moodToState(mood: Mood): MoodState {
  return mood.toLowerCase() as MoodState;
}
