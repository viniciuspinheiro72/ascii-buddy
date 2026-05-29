import type { BuddyMetadata } from "@/domain/value-objects/buddy-metadata.js";
import type { PhraseContext } from "@/domain/value-objects/phrase-context.js";

/** Contract for any AI backend. Implement to add a new LLM provider. */
export interface AIProvider {
  generatePhrase(ctx: PhraseContext): Promise<string>;
  generateBuddyMetadata(): Promise<BuddyMetadata>;
}
