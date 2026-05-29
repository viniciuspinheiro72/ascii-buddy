import { LocalStorageAdapter } from "@/infra/storage/local-storage-adapter.js";
import { BundledTemplateRegistry } from "@/infra/templates/bundled-template-registry.js";
import { GeminiAdapter } from "@/infra/ai/gemini-adapter.js";
import { resolveApiKey } from "@/infra/storage/config-reader.js";
import { LoadBuddyUseCase } from "@/application/use-cases/load-buddy.use-case.js";
import { GeneratePhraseUseCase } from "@/application/use-cases/generate-phrase.use-case.js";
import { CompanionScreen } from "@/ui/screens/companion-screen.js";
import { Buddy } from "@/domain/entities/buddy.js";
import { randomPhraseType } from "@/domain/value-objects/phrase-context.js";
import { logger } from "@/infra/logger.js";

async function main(): Promise<void> {
  // Wire concrete adapters to domain ports (sole DI composition root)
  const buddyRepository = new LocalStorageAdapter();
  const templateRegistry = new BundledTemplateRegistry();

  const apiKey = await resolveApiKey();
  const aiProvider = apiKey ? new GeminiAdapter(apiKey) : null;

  if (!apiKey) {
    process.stdout.write(
      "No GEMINI_API_KEY found — running in offline mode (fallback phrases only).\n",
    );
  }

  const loadBuddy = new LoadBuddyUseCase(buddyRepository, templateRegistry);
  const generatePhrase = new GeneratePhraseUseCase(aiProvider, buddyRepository);

  let result = await loadBuddy.execute();

  if (!result) {
    // No active buddy yet — demo mode until Phase 4 adds --new
    process.stdout.write(
      "No buddy found — loading demo mode (run with --new in Phase 4 to create one).\n",
    );

    const demoBuddy = Buddy.create(
      {
        name: "Segfault",
        description: "A grizzled C++ veteran who has seen things. Many things.",
        talent: "manual memory management",
      },
      "crash",
    );
    const demoTemplate = await templateRegistry.getTemplate("crash");
    result = { buddy: demoBuddy, template: demoTemplate };
  }

  const { buddy, template } = result;

  const getPhrase = async () =>
    generatePhrase.execute({
      buddyName: buddy.name,
      buddyTalent: buddy.talent,
      buddyDescription: buddy.description,
      phraseType: randomPhraseType(),
    });

  const screen = new CompanionScreen(buddy, template, getPhrase);

  try {
    screen.open();
  } catch (err) {
    logger.error(`Screen error: ${String(err)}`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  logger.error(String(err));
  process.exit(1);
});
