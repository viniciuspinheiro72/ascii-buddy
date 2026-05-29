#!/usr/bin/env node
import { LocalStorageAdapter } from "@/infra/storage/local-storage-adapter.js";
import { BundledTemplateRegistry } from "@/infra/templates/bundled-template-registry.js";
import { GeminiAdapter } from "@/infra/ai/gemini-adapter.js";
import { resolveConfig } from "@/infra/storage/config-reader.js";
import { LoadBuddyUseCase } from "@/application/use-cases/load-buddy.use-case.js";
import { CreateBuddyUseCase } from "@/application/use-cases/create-buddy.use-case.js";
import { ListBuddiesUseCase } from "@/application/use-cases/list-buddies.use-case.js";
import { DeleteBuddyUseCase } from "@/application/use-cases/delete-buddy.use-case.js";
import { GeneratePhraseUseCase } from "@/application/use-cases/generate-phrase.use-case.js";
import { CompanionScreen } from "@/ui/screens/companion-screen.js";
import { BuddyPickerScreen } from "@/ui/screens/buddy-picker-screen.js";
import type { Buddy } from "@/domain/entities/buddy.js";
import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";
import { randomPhraseType } from "@/domain/value-objects/phrase-context.js";
import { logger } from "@/infra/logger.js";

function parseFlag(args: string[]): "new" | "list" | "delete" | "default" {
  if (args.includes("--new")) return "new";
  if (args.includes("--list")) return "list";
  if (args.includes("--delete")) return "delete";
  return "default";
}

async function openCompanion(
  buddy: Buddy,
  template: BuddyTemplate,
  generatePhrase: GeneratePhraseUseCase,
  phraseIntervalMs: number,
): Promise<void> {
  const getPhrase = async () =>
    generatePhrase.execute({
      buddyName: buddy.name,
      buddyTalent: buddy.talent,
      buddyDescription: buddy.description,
      phraseType: randomPhraseType(),
    });

  const screen = new CompanionScreen(buddy, template, getPhrase, phraseIntervalMs);

  try {
    screen.open();
  } catch (err) {
    logger.error(`Screen error: ${String(err)}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const flag = parseFlag(process.argv.slice(2));

  // Wire concrete adapters to domain ports (sole DI composition root)
  const buddyRepository = new LocalStorageAdapter();
  const templateRegistry = new BundledTemplateRegistry();

  const config = await resolveConfig();
  const apiKey = process.env["GEMINI_API_KEY"] ?? config.apiKey ?? null;
  const aiProvider = apiKey ? new GeminiAdapter(apiKey) : null;
  const phraseIntervalMs = config.phraseIntervalSeconds * 1_000;

  if (!apiKey && flag !== "list" && flag !== "delete") {
    process.stdout.write(
      "No GEMINI_API_KEY found — running in offline mode (fallback phrases only).\n",
    );
  }

  const generatePhrase = new GeneratePhraseUseCase(aiProvider, buddyRepository);

  // --new: create a fresh buddy via AI, then open companion screen
  if (flag === "new") {
    if (!aiProvider) {
      process.stdout.write(
        "GEMINI_API_KEY is required to create a new buddy.\n" +
          "Set it in your environment or in ~/.ascii-buddy/config.json.\n",
      );
      process.exit(1);
    }

    process.stdout.write("Generating your new buddy...\n");
    const createBuddy = new CreateBuddyUseCase(aiProvider, buddyRepository, templateRegistry);
    const { buddy, template } = await createBuddy.execute();
    process.stdout.write(`\nMeet ${buddy.name}! (${buddy.talent})\n\n`);
    await openCompanion(buddy, template, generatePhrase, phraseIntervalMs);
    return;
  }

  // --list / --delete: open the interactive picker
  if (flag === "list" || flag === "delete") {
    const listBuddies = new ListBuddiesUseCase(buddyRepository);
    const deleteBuddy = new DeleteBuddyUseCase(buddyRepository);

    const { buddies, activeBuddyId } = await listBuddies.execute();

    if (buddies.length === 0) {
      process.stdout.write("No buddies yet. Run with --new to create your first buddy.\n");
      process.exit(0);
    }

    const picker = new BuddyPickerScreen(
      buddies,
      activeBuddyId,
      async (id) => {
        const result = await deleteBuddy.execute(id);
        return { newActiveBuddyId: result.newActiveBuddy?.id ?? null };
      },
    );

    const selectedId = await picker.open();
    if (!selectedId) process.exit(0);

    await buddyRepository.setActive(selectedId);
    const buddy = await buddyRepository.findById(selectedId);
    if (!buddy) process.exit(0);

    const template = await templateRegistry.getTemplate(buddy.species);
    await openCompanion(buddy, template, generatePhrase, phraseIntervalMs);
    return;
  }

  // Default: load active buddy and open companion screen
  const loadBuddy = new LoadBuddyUseCase(buddyRepository, templateRegistry);
  const result = await loadBuddy.execute();

  if (!result) {
    process.stdout.write(
      "No buddy found. Run `ascii-buddy --new` to create one.\n",
    );
    process.exit(0);
  }

  await openCompanion(result.buddy, result.template, generatePhrase, phraseIntervalMs);
}

main().catch((err: unknown) => {
  logger.error(String(err));
  process.exit(1);
});
