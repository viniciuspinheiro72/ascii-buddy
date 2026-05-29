import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider } from "@/domain/ports/ai-provider.js";
import type { PhraseContext } from "@/domain/value-objects/phrase-context.js";
import type { BuddyMetadata } from "@/domain/value-objects/buddy-metadata.js";
import { buildPhrasePrompt, buildMetadataPrompt } from "@/infra/ai/gemini-system-prompt.js";
import { logger } from "@/infra/logger.js";

const DEFAULT_MODEL = "gemini-2.0-flash-lite";
const MAX_PHRASE_LENGTH = 120;

export class GeminiAdapter implements AIProvider {
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelId: string;

  constructor(apiKey: string, modelId = DEFAULT_MODEL) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelId = modelId;
  }

  async generatePhrase(ctx: PhraseContext): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.modelId });
    const prompt = buildPhrasePrompt(ctx);

    logger.debug(`Generating phrase (type: ${ctx.phraseType}) for ${ctx.buddyName}`);

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Take only the first non-empty line — model sometimes adds preamble
    const phrase = raw.split("\n").find((line) => line.trim().length > 0)?.trim() ?? raw;

    return phrase.slice(0, MAX_PHRASE_LENGTH);
  }

  async generateBuddyMetadata(): Promise<BuddyMetadata> {
    const model = this.genAI.getGenerativeModel({ model: this.modelId });
    const prompt = buildMetadataPrompt();

    logger.debug("Generating buddy metadata");

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    return parseMetadata(raw);
  }
}

function parseMetadata(raw: string): BuddyMetadata {
  // Strip markdown fences if the model wraps in ```json ... ```
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  const name = String(parsed["name"] ?? "").trim();
  const description = String(parsed["description"] ?? "").trim();
  const talent = String(parsed["talent"] ?? "").trim();

  if (!name || !description || !talent) {
    throw new Error(`Incomplete metadata from AI: ${raw}`);
  }

  return { name, description, talent };
}
