import type { AIProvider } from "@/domain/ports/ai-provider.js";
import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";
import type { PhraseContext } from "@/domain/value-objects/phrase-context.js";
import { FallbackPhraseStore } from "@/infra/ai/fallback-phrase-store.js";
import { logger } from "@/infra/logger.js";

export interface GeneratePhraseResult {
  phrase: string;
  offline: boolean;
}

export class GeneratePhraseUseCase {
  constructor(
    private readonly aiProvider: AIProvider | null,
    private readonly buddyRepository: BuddyRepository,
  ) {}

  async execute(ctx: PhraseContext): Promise<GeneratePhraseResult> {
    if (!this.aiProvider) {
      return { phrase: FallbackPhraseStore.getRandom(), offline: true };
    }

    try {
      const phrase = await this.aiProvider.generatePhrase(ctx);

      // Persist phrase to the active buddy's history
      const buddy = await this.buddyRepository.getActive();
      if (buddy) {
        await this.buddyRepository.save(buddy.withPhrase(phrase));
      }

      return { phrase, offline: false };
    } catch (err) {
      logger.error(`AI phrase generation failed: ${String(err)}`);
      return { phrase: FallbackPhraseStore.getRandom(), offline: true };
    }
  }
}
