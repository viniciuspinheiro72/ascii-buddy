import { LocalStorageAdapter } from "@/infra/storage/local-storage-adapter.js";
import { BundledTemplateRegistry } from "@/infra/templates/bundled-template-registry.js";
import { FallbackPhraseStore } from "@/infra/ai/fallback-phrase-store.js";
import { LoadBuddyUseCase } from "@/application/use-cases/load-buddy.use-case.js";
import { CompanionScreen } from "@/ui/screens/companion-screen.js";
import { Buddy } from "@/domain/entities/buddy.js";
import { logger } from "@/infra/logger.js";

async function main(): Promise<void> {
  // Wire concrete adapters to domain ports (sole DI composition root)
  const buddyRepository = new LocalStorageAdapter();
  const templateRegistry = new BundledTemplateRegistry();

  const loadBuddy = new LoadBuddyUseCase(buddyRepository, templateRegistry);
  let result = await loadBuddy.execute();

  if (!result) {
    // Phase 2 demo: show a temporary buddy so the TUI can be tested.
    // In Phase 4 this path becomes: print a message and run --new.
    process.stdout.write(
      "No buddy found — loading demo mode (use --new in Phase 4 to create one).\n",
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

  // Phase 2: phrases come from the fallback store.
  // Phase 3 will replace this with the Gemini adapter.
  const getPhrase = async (): Promise<string> => FallbackPhraseStore.getRandom();

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
