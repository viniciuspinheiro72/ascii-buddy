# Architecture

## Overview
ascii-buddy follows a Layered DDD (Domain-Driven Design) architecture with Ports & Adapters (Hexagonal). The domain layer is pure TypeScript with zero external dependencies — all I/O (AI API, file storage, terminal rendering) lives in outer layers and communicates with the domain through typed interfaces (ports). `src/main.ts` is the sole composition root where concrete adapters are wired to their ports.

## Directory Structure
```
ascii-buddy/
├── src/
│   ├── main.ts                        ← CLI entry point + DI composition root
│   ├── domain/                        ← Pure domain logic — NO external imports
│   │   ├── entities/
│   │   │   └── buddy.ts               ← Buddy aggregate root
│   │   ├── value-objects/
│   │   │   ├── buddy-template.ts      ← ASCII frame spec (value object)
│   │   │   ├── mood.ts                ← Mood enum + MoodState type
│   │   │   ├── phrase-context.ts      ← PhraseContext + PhraseType
│   │   │   └── buddy-metadata.ts      ← AI-generated metadata shape
│   │   └── ports/
│   │       ├── ai-provider.ts         ← AIProvider interface
│   │       └── buddy-repository.ts    ← BuddyRepository interface
│   ├── application/                   ← Use cases — depends on domain ports only
│   │   └── use-cases/
│   │       ├── load-buddy.use-case.ts
│   │       ├── create-buddy.use-case.ts
│   │       ├── generate-phrase.use-case.ts
│   │       ├── list-buddies.use-case.ts
│   │       └── delete-buddy.use-case.ts
│   ├── infra/                         ← Concrete adapters implementing domain ports
│   │   ├── ai/
│   │   │   ├── gemini-adapter.ts      ← implements AIProvider
│   │   │   ├── gemini-system-prompt.ts← System prompt template function
│   │   │   └── fallback-phrase-store.ts← Offline fallback phrases
│   │   └── storage/
│   │       ├── local-storage-adapter.ts← implements BuddyRepository
│   │       └── schema.ts              ← StorageSchema + ConfigSchema types
│   ├── ui/                            ← TUI layer (neo-blessed)
│   │   ├── screens/
│   │   │   ├── companion-screen.ts    ← Main buddy view
│   │   │   └── buddy-picker-screen.ts ← --list interactive picker
│   │   └── components/
│   │       ├── speech-bubble.ts
│   │       ├── animation-loop.ts
│   │       └── status-bar.ts
│   └── assets/
│       └── buddies/
│           ├── crash.ts               ← Crash Bandicoot BuddyTemplate frames
│           └── generic-dev.ts         ← Generic dev mascot frames
├── docs/
├── tests/
│   ├── unit/                          ← Domain + use case tests (Vitest)
│   └── integration/                   ← Storage adapter + AI adapter tests
└── package.json
```

## Layer Responsibilities
| Layer       | Folder              | Responsibility |
|-------------|---------------------|----------------|
| Domain      | `src/domain/`       | Business entities, value objects, and port interfaces. Pure TypeScript — no imports outside `src/domain/` |
| Application | `src/application/`  | Use cases that orchestrate domain objects via ports. No knowledge of concrete adapters or UI |
| Infra       | `src/infra/`        | Concrete implementations of domain ports: Gemini API adapter, local JSON storage adapter, fallback phrase store |
| UI          | `src/ui/`           | neo-blessed screens and components. Calls application use cases; never calls infra directly |
| Assets      | `src/assets/`       | Static ASCII art frame data. Imported by UI layer only |
| CLI/Entry   | `src/main.ts`       | Flag parsing, DI wiring, bootstraps the correct screen |

## Dependency Rules
```
domain/      ← imports nothing outside itself
application/ ← imports domain/ only (entities + ports)
infra/       ← imports domain/ (to implement ports); never imports application/ or ui/
ui/          ← imports application/ and domain/ types; never imports infra/ directly
assets/      ← no imports (pure data)
main.ts      ← imports all layers; the only place infra is instantiated and injected
```

**Violations that break the architecture:**
- `domain/` importing anything from `infra/`, `ui/`, or `application/`
- `application/` importing a concrete adapter (`GeminiAdapter`, `LocalStorageAdapter`)
- `ui/` importing from `infra/` directly
- Any relative `../../../` import chain crossing layer boundaries

## Data Flow

### Normal startup (active buddy exists)
```
main.ts
  └─► parse flags (no flag = default start)
      └─► wire: LocalStorageAdapter → BuddyRepository
                GeminiAdapter       → AIProvider
          └─► LoadBuddyUseCase.execute()
                └─► BuddyRepository.getActive()
                    └─► LocalStorageAdapter reads ~/.ascii-buddy/data.json
              └─► returns Buddy + BuddyTemplate
          └─► CompanionScreen.render(buddy, template)
                └─► AnimationLoop.start()
                └─► GeneratePhraseUseCase → AIProvider → GeminiAdapter
                    └─► SpeechBubble.show(phrase)
```

### --new flag
```
main.ts
  └─► CreateBuddyUseCase.execute()
        └─► AIProvider.generateBuddyMetadata() → GeminiAdapter → Gemini API
            └─► assign random species template
                └─► BuddyRepository.save() → LocalStorageAdapter → data.json
                    └─► BuddyRepository.setActive()
  └─► CompanionScreen.render(newBuddy, template)
```

## Where to Add New Things
| Thing | Where |
|-------|-------|
| New domain entity or value object | `src/domain/entities/` or `src/domain/value-objects/` |
| New domain port (interface) | `src/domain/ports/` |
| New use case | `src/application/use-cases/` |
| New AI provider adapter | `src/infra/ai/` — implement `AIProvider` port |
| New storage adapter | `src/infra/storage/` — implement `BuddyRepository` port |
| New TUI screen | `src/ui/screens/` |
| New TUI component | `src/ui/components/` |
| New buddy species ASCII frames | `src/assets/buddies/` |
| New unit test | `tests/unit/` mirroring the source path |
| New integration test | `tests/integration/` |

## Key Conventions
- All imports use the `@` alias (`@/domain/...`, `@/application/...`) — never relative `../..`
- See `docs/STRUCTURE.md` for full naming and code style conventions
- See `docs/GLOSSARY.md` for precise meanings of all domain terms

## Architecture Decision Records
- Location: `docs/adr/`
- Write an ADR when: changing the tech stack, introducing a new pattern, making a security trade-off, or deprecating a core abstraction.
- See `docs/adr/ADR-001-initial-architecture.md` for the first entry and format reference.
