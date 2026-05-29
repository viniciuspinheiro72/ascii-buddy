import { v4 as uuidv4 } from "uuid";
import { Mood } from "@/domain/value-objects/mood.js";
import type { BuddyMetadata } from "@/domain/value-objects/buddy-metadata.js";

const MAX_PHRASE_HISTORY = 10;
const AVAILABLE_SPECIES = ["crash", "generic-dev"] as const;

export type SpeciesId = (typeof AVAILABLE_SPECIES)[number];

export interface BuddyProps {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly talent: string;
  readonly species: string;
  readonly mood: Mood;
  readonly createdAt: Date;
  readonly lastSeenAt: Date;
  readonly phraseHistory: readonly string[];
}

export class Buddy {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly talent: string;
  readonly species: string;
  readonly mood: Mood;
  readonly createdAt: Date;
  readonly lastSeenAt: Date;
  readonly phraseHistory: readonly string[];

  private constructor(props: BuddyProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.talent = props.talent;
    this.species = props.species;
    this.mood = props.mood;
    this.createdAt = props.createdAt;
    this.lastSeenAt = props.lastSeenAt;
    this.phraseHistory = props.phraseHistory;
  }

  static create(metadata: BuddyMetadata, species?: string): Buddy {
    const resolvedSpecies =
      species ?? AVAILABLE_SPECIES[Math.floor(Math.random() * AVAILABLE_SPECIES.length)];

    return new Buddy({
      id: uuidv4(),
      name: metadata.name,
      description: metadata.description,
      talent: metadata.talent,
      species: resolvedSpecies as string,
      mood: Mood.IDLE,
      createdAt: new Date(),
      lastSeenAt: new Date(),
      phraseHistory: [],
    });
  }

  static reconstitute(props: BuddyProps): Buddy {
    return new Buddy(props);
  }

  withMood(mood: Mood): Buddy {
    return new Buddy({ ...this.toProps(), mood });
  }

  withPhrase(phrase: string): Buddy {
    const updated = [phrase, ...this.phraseHistory].slice(0, MAX_PHRASE_HISTORY);
    return new Buddy({ ...this.toProps(), phraseHistory: updated, lastSeenAt: new Date() });
  }

  withLastSeen(): Buddy {
    return new Buddy({ ...this.toProps(), lastSeenAt: new Date() });
  }

  toProps(): BuddyProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      talent: this.talent,
      species: this.species,
      mood: this.mood,
      createdAt: this.createdAt,
      lastSeenAt: this.lastSeenAt,
      phraseHistory: this.phraseHistory,
    };
  }
}
