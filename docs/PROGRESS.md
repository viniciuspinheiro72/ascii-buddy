# Progress

<!-- Updated as work completes. Sections move items: Next → In Progress → Done.
     Keep Done items for reference — they show what has been built. -->

## Done
- [x] 2026-05-28 — Full documentation suite scaffolded (all 13 docs + ADR-001 + CONSTITUTION + AGENTS + CLAUDE)
- [x] 2026-05-28 — Git repository initialized on `main` branch

## In Progress
<!-- Nothing yet -->

## Blocked
| Item | Blocker | Who can unblock |
|------|---------|-----------------|
| Phase 3 — AI Integration | Needs `GEMINI_API_KEY` for live testing | Developer (get free key at ai.google.dev) |

## Next

### Phase 1 — Foundation
- [ ] `package.json` with scripts: `dev`, `build`, `lint`, `format`, `test`, `test:unit`, `test:integration`, `test:coverage`
- [ ] `tsconfig.json` with strict mode + `@` → `src` path alias
- [ ] ESLint config (TypeScript rules) + Prettier config
- [ ] Vitest config with coverage thresholds matching CONSTITUTION.md
- [ ] Scaffold full `src/` directory tree (empty files)
- [ ] `Buddy` entity with `Buddy.create(metadata)` factory
- [ ] All value objects: `BuddyTemplate`, `Mood` enum, `MoodState` type, `PhraseContext`, `PhraseType`, `BuddyMetadata`
- [ ] `AIProvider` and `BuddyRepository` port interfaces
- [ ] `LocalStorageAdapter` with atomic write + backup recovery
- [ ] `schema.ts`: `StorageSchema` + `ConfigSchema` types
- [ ] Domain + storage adapter unit/integration tests
- [ ] Animation PoC spike: neo-blessed multi-frame loop at 2fps with resize handler

### Phase 2 — Core TUI
- [ ] `AnimationLoop` component (setInterval, frame stepper, pause/resume)
- [ ] `SpeechBubble` blessed Box with auto-clear timer
- [ ] `StatusBar` component (mood indicator, buddy name/talent, offline flag)
- [ ] `CompanionScreen` — full render pipeline: buddy box + speech bubble + status bar
- [ ] Terminal width detection + compact mode (< 50 cols) + minimal mode (< 40 cols)
- [ ] `process.on('exit'/'SIGINT'/'SIGTERM')` — screen destroy registered before first render
- [ ] `LoadBuddyUseCase` wired into `CompanionScreen`

### Phase 3 — AI Integration
- [ ] `GeminiAdapter` implementing `AIProvider`
- [ ] `gemini-system-prompt.ts` template function (personality-aware, dev-themed)
- [ ] `FallbackPhraseStore` — 50+ hardcoded dev phrases
- [ ] `GeneratePhraseUseCase` with fallback on network error
- [ ] Offline indicator in `StatusBar`
- [ ] Phrase history written to storage (last 10 per buddy)
- [ ] API key resolution: env var → config.json → first-run prompt

### Phase 4 — Buddy Lifecycle
- [ ] `CreateBuddyUseCase` — AI generates metadata, random species assigned
- [ ] `--new` CLI flag wired to `CreateBuddyUseCase`
- [ ] `crash.ts` asset — all 5 mood states × frames finalized
- [ ] `generic-dev.ts` asset — all 5 mood states × frames finalized
- [ ] `ListBuddiesUseCase`
- [ ] `BuddyPickerScreen` — scrollable list + animated preview panel + keyboard nav
- [ ] `--list` CLI flag wired to `BuddyPickerScreen`
- [ ] `DeleteBuddyUseCase` + `--delete <id>` flag with confirmation prompt
- [ ] Welcome flow: no existing data → auto-trigger `--new`

### Phase 5 — Polish & Release
- [ ] Time-of-day mood transitions (SLEEPING late at night, HAPPY in morning)
- [ ] `~/.ascii-buddy/config.json` — phraseIntervalSeconds, defaultBuddyId, provider
- [ ] `PhraseType` rotation across sessions (not always same tone)
- [ ] README with demo gif, install instructions, usage flags, GEMINI_API_KEY setup
- [ ] `.npmignore` + `package.json` bin field for `npx ascii-buddy`
- [ ] GitHub Actions CI: lint + test on PR
- [ ] v1.0.0 tag + GitHub release

## Icebox
- `--watch` mode: buddy reacts to git commits in current repo
- Shell integration snippet (auto-launch in .zshrc/.bashrc)
- Community buddy template registry
- `--daemon` mode with OS notifications
- Custom ASCII art import (user-supplied buddy templates)
