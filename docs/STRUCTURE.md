# Codebase Structure & Conventions

## File Naming
- **Source files:** `kebab-case.ts` — e.g. `buddy-repository.ts`, `create-buddy.use-case.ts`
- **Test files:** `*.test.ts`, centralized in `tests/unit/` and `tests/integration/`, mirroring `src/` paths
- **Type-only files:** `*.ts` with only `interface` / `type` exports — no special suffix needed; types live with their concept
- **Asset files:** `kebab-case.ts` — e.g. `crash.ts`, `generic-dev.ts`
- **Config files:** `*.config.ts` or `*.json` at project root

## Folder Organization
Type-first within each layer, then by concept:

```
src/
├── domain/
│   ├── entities/         ← one file per aggregate/entity
│   ├── value-objects/    ← one file per value object or enum group
│   └── ports/            ← one file per port interface
├── application/
│   └── use-cases/        ← one file per use case
├── infra/
│   ├── ai/               ← AI adapter(s) + prompt template + fallback store
│   └── storage/          ← storage adapter(s) + schema
├── ui/
│   ├── screens/          ← full-screen blessed layouts
│   └── components/       ← reusable blessed widgets
└── assets/
    └── buddies/          ← one file per buddy species (ASCII frame data)
```

No barrel `index.ts` files — import directly from the source file. This avoids circular import issues and makes dependencies explicit.

## Import Conventions
- **Always use `@` alias** — never relative paths that cross layer boundaries:
  ```ts
  // ✅ correct
  import { Buddy } from "@/domain/entities/buddy";
  import { AIProvider } from "@/domain/ports/ai-provider";

  // ❌ wrong
  import { Buddy } from "../../domain/entities/buddy";
  ```
- **Relative imports are allowed only within the same folder** (e.g. two files in the same `use-cases/` directory)
- **Import order:** external packages → `@/domain` → `@/application` → `@/infra` → `@/ui` → `@/assets`
- **No barrel exports (`index.ts`)** — import directly from the file that owns the symbol
- **Type-only imports:** use `import type` when importing only types/interfaces:
  ```ts
  import type { Buddy } from "@/domain/entities/buddy";
  ```

## Naming Conventions
| Concept | Convention | Example |
|---------|-----------|---------|
| Variables / functions | camelCase | `activeBuddy`, `generatePhrase()` |
| Classes | PascalCase | `GeminiAdapter`, `LocalStorageAdapter` |
| Interfaces | PascalCase, no `I` prefix | `AIProvider`, `BuddyRepository` |
| Type aliases | PascalCase | `MoodState`, `BuddyMetadata` |
| Enums | PascalCase (name), SCREAMING_SNAKE (values) | `Mood.IDLE`, `PhraseType.SARCASTIC` |
| Constants | SCREAMING_SNAKE_CASE | `DEFAULT_PHRASE_INTERVAL`, `MAX_PHRASE_LENGTH` |
| Files | kebab-case | `buddy-repository.ts`, `create-buddy.use-case.ts` |
| Use case classes | `<Action>UseCase` | `CreateBuddyUseCase`, `LoadBuddyUseCase` |
| Adapter classes | `<Target>Adapter` | `GeminiAdapter`, `LocalStorageAdapter` |
| Screen classes | `<Name>Screen` | `CompanionScreen`, `BuddyPickerScreen` |
| Port interfaces | noun only, no suffix | `AIProvider`, `BuddyRepository` |
| Environment variables | SCREAMING_SNAKE_CASE | `GEMINI_API_KEY`, `ASCII_BUDDY_DATA_DIR` |

## Code Style

**Use case pattern — constructor injection, single `execute()` method:**
```ts
export class CreateBuddyUseCase {
  constructor(
    private readonly aiProvider: AIProvider,
    private readonly buddyRepository: BuddyRepository,
  ) {}

  async execute(): Promise<Buddy> {
    const metadata = await this.aiProvider.generateBuddyMetadata();
    const buddy = Buddy.create(metadata);
    await this.buddyRepository.save(buddy);
    await this.buddyRepository.setActive(buddy.id);
    return buddy;
  }
}
```

**Port interface pattern — async, returns domain types:**
```ts
export interface AIProvider {
  generatePhrase(ctx: PhraseContext): Promise<string>;
  generateBuddyMetadata(): Promise<BuddyMetadata>;
}
```

**Value object pattern — readonly, no setters:**
```ts
export interface PhraseContext {
  readonly buddyName: string;
  readonly buddyTalent: string;
  readonly buddyDescription: string;
  readonly phraseType: PhraseType;
}
```

**Enum pattern:**
```ts
export enum Mood {
  IDLE     = "IDLE",
  HAPPY    = "HAPPY",
  SAD      = "SAD",
  TALKING  = "TALKING",
  SLEEPING = "SLEEPING",
}
```

## Co-location Rules
- **Tests:** centralized in `tests/`, mirroring `src/` structure:
  - `src/domain/entities/buddy.ts` → `tests/unit/domain/entities/buddy.test.ts`
  - `src/infra/storage/local-storage-adapter.ts` → `tests/integration/infra/storage/local-storage-adapter.test.ts`
- **Types:** co-located with their owning concept — no centralized `types/` folder
- **Assets (ASCII frames):** `src/assets/buddies/` — one file per species, never inlined in UI components

## What NOT to Do
- **No `any` types** — use `unknown` and narrow, or define the proper type
- **No direct `process.exit()` in use cases or domain** — let the CLI layer handle exit
- **No `console.log` in production paths** — use the logger utility (respects `ASCII_BUDDY_LOG_LEVEL`)
- **No hardcoded paths** — use `os.homedir()` + the `ASCII_BUDDY_DATA_DIR` env var
- **No importing infra from ui** — the UI layer never touches `GeminiAdapter` or `LocalStorageAdapter` directly
- **No relative imports crossing layer boundaries** — always use `@` alias
- **No `index.ts` barrel files** — import directly from the source file
- **No mutation of domain objects after creation** — return new instances or use explicit setter methods on the aggregate
- **No `require()` calls** — ESM only (`import`/`export`)
