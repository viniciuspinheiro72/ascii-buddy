import { describe, it, expect, vi, beforeEach } from "vitest";
import { PhraseType } from "@/domain/value-objects/phrase-context.js";
import type { PhraseContext } from "@/domain/value-objects/phrase-context.js";

// Mock @google/generative-ai before importing the adapter
const mockGenerateContent = vi.fn();
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

// Import after mock is set up
const { GeminiAdapter } = await import("@/infra/ai/gemini-adapter.js");

const CTX: PhraseContext = {
  buddyName: "Segfault",
  buddyTalent: "manual memory management",
  buddyDescription: "A grizzled C++ veteran.",
  phraseType: PhraseType.WISE,
};

describe("GeminiAdapter.generatePhrase", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return the trimmed response text", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "  Memory is just a suggestion.  " },
    });

    const adapter = new GeminiAdapter("fake-key");
    const phrase = await adapter.generatePhrase(CTX);

    expect(phrase).toBe("Memory is just a suggestion.");
  });

  it("should take only the first non-empty line when the model adds extra text", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "Here is your phrase:\nMemory is just a suggestion.\nHope that helps!" },
    });

    const adapter = new GeminiAdapter("fake-key");
    const phrase = await adapter.generatePhrase(CTX);

    expect(phrase).toBe("Here is your phrase:");
  });

  it("should truncate responses longer than 120 characters", async () => {
    const longPhrase = "A".repeat(200);
    mockGenerateContent.mockResolvedValue({
      response: { text: () => longPhrase },
    });

    const adapter = new GeminiAdapter("fake-key");
    const phrase = await adapter.generatePhrase(CTX);

    expect(phrase.length).toBe(120);
  });

  it("should propagate API errors so the use case can catch them", async () => {
    mockGenerateContent.mockRejectedValue(new Error("quota exceeded"));

    const adapter = new GeminiAdapter("fake-key");
    await expect(adapter.generatePhrase(CTX)).rejects.toThrow("quota exceeded");
  });
});

describe("GeminiAdapter.generateBuddyMetadata", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should parse a valid JSON response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            name: "Heisenbug",
            description: "Appears only when you stop looking.",
            talent: "quantum debugging",
          }),
      },
    });

    const adapter = new GeminiAdapter("fake-key");
    const meta = await adapter.generateBuddyMetadata();

    expect(meta.name).toBe("Heisenbug");
    expect(meta.description).toBe("Appears only when you stop looking.");
    expect(meta.talent).toBe("quantum debugging");
  });

  it("should strip markdown fences if the model wraps in ```json", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          '```json\n{"name":"Deadlock","description":"Waits forever.","talent":"mutex archaeology"}\n```',
      },
    });

    const adapter = new GeminiAdapter("fake-key");
    const meta = await adapter.generateBuddyMetadata();

    expect(meta.name).toBe("Deadlock");
  });

  it("should throw if required fields are missing", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => '{"name":"Oops"}' },
    });

    const adapter = new GeminiAdapter("fake-key");
    await expect(adapter.generateBuddyMetadata()).rejects.toThrow("Incomplete metadata");
  });
});
