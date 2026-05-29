import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeneratePhraseUseCase } from "@/application/use-cases/generate-phrase.use-case.js";
import { Buddy } from "@/domain/entities/buddy.js";
import { PhraseType } from "@/domain/value-objects/phrase-context.js";
import type { AIProvider } from "@/domain/ports/ai-provider.js";
import type { BuddyRepository } from "@/domain/ports/buddy-repository.js";
import type { PhraseContext } from "@/domain/value-objects/phrase-context.js";

const META = { name: "Segfault", description: "C++ vet.", talent: "manual memory management" };
const CTX: PhraseContext = {
  buddyName: "Segfault",
  buddyTalent: "manual memory management",
  buddyDescription: "C++ vet.",
  phraseType: PhraseType.SARCASTIC,
};

function makeRepo(activeBuddy: Buddy | null): BuddyRepository {
  return {
    getActive: vi.fn().mockResolvedValue(activeBuddy),
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn(),
    findAll: vi.fn(),
    setActive: vi.fn(),
    delete: vi.fn(),
  };
}

function makeAIProvider(phrase: string): AIProvider {
  return {
    generatePhrase: vi.fn().mockResolvedValue(phrase),
    generateBuddyMetadata: vi.fn(),
  };
}

describe("GeneratePhraseUseCase", () => {
  describe("when aiProvider is null (offline mode)", () => {
    it("should return a fallback phrase with offline: true", async () => {
      const uc = new GeneratePhraseUseCase(null, makeRepo(null));
      const result = await uc.execute(CTX);

      expect(result.offline).toBe(true);
      expect(result.phrase).toBeTruthy();
    });

    it("should not call the repository", async () => {
      const repo = makeRepo(null);
      const uc = new GeneratePhraseUseCase(null, repo);
      await uc.execute(CTX);

      expect(repo.getActive).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe("when aiProvider is available", () => {
    let repo: BuddyRepository;
    let ai: AIProvider;

    beforeEach(() => {
      const buddy = Buddy.create(META, "crash");
      repo = makeRepo(buddy);
      ai = makeAIProvider("Real developers ship on Fridays.");
    });

    it("should return the AI phrase with offline: false", async () => {
      const uc = new GeneratePhraseUseCase(ai, repo);
      const result = await uc.execute(CTX);

      expect(result.offline).toBe(false);
      expect(result.phrase).toBe("Real developers ship on Fridays.");
    });

    it("should call generatePhrase with the provided context", async () => {
      const uc = new GeneratePhraseUseCase(ai, repo);
      await uc.execute(CTX);

      expect(ai.generatePhrase).toHaveBeenCalledWith(CTX);
    });

    it("should persist the phrase to the active buddy's history", async () => {
      const uc = new GeneratePhraseUseCase(ai, repo);
      await uc.execute(CTX);

      expect(repo.save).toHaveBeenCalledOnce();
      const savedBuddy = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0][0] as Buddy;
      expect(savedBuddy.phraseHistory[0]).toBe("Real developers ship on Fridays.");
    });

    it("should skip saving if no active buddy exists", async () => {
      const emptyRepo = makeRepo(null);
      const uc = new GeneratePhraseUseCase(ai, emptyRepo);
      const result = await uc.execute(CTX);

      expect(result.offline).toBe(false);
      expect(emptyRepo.save).not.toHaveBeenCalled();
    });
  });

  describe("when the AI call fails", () => {
    it("should return a fallback phrase with offline: true", async () => {
      const brokenAI: AIProvider = {
        generatePhrase: vi.fn().mockRejectedValue(new Error("API unreachable")),
        generateBuddyMetadata: vi.fn(),
      };
      const uc = new GeneratePhraseUseCase(brokenAI, makeRepo(null));
      const result = await uc.execute(CTX);

      expect(result.offline).toBe(true);
      expect(result.phrase).toBeTruthy();
    });
  });
});
