import { Mood } from "@/domain/value-objects/mood.js";

export const SCHEMA_VERSION = 1;

export interface BuddyRecord {
  id: string;
  name: string;
  description: string;
  talent: string;
  species: string;
  mood: Mood;
  createdAt: string;
  lastSeenAt: string;
  phraseHistory: string[];
}

export interface StorageSchema {
  version: number;
  activeBuddyId: string | null;
  buddies: BuddyRecord[];
}

export interface ConfigSchema {
  apiKey?: string;
  provider: "gemini";
  phraseIntervalSeconds: number;
  defaultBuddyId?: string;
}

export const DEFAULT_CONFIG: ConfigSchema = {
  provider: "gemini",
  phraseIntervalSeconds: 30,
};

export const EMPTY_STORAGE: StorageSchema = {
  version: SCHEMA_VERSION,
  activeBuddyId: null,
  buddies: [],
};
