import type { MoodState } from "@/domain/value-objects/mood.js";

export interface BuddyTemplate {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly width: number;
  readonly height: number;
  readonly frames: Record<MoodState, readonly string[]>;
}
