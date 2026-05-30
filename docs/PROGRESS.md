# Progress

<!-- Updated as work completes. Sections move items: Next → In Progress → Done.
     Keep Done items for reference — they show what has been built. -->

## Done
- [x] 2026-05-28 — Full documentation suite scaffolded (all 13 docs + ADR-001 + CONSTITUTION + AGENTS + CLAUDE)
- [x] 2026-05-28 — Git repository initialized on `main` branch
- [x] 2026-05-29 — Phase 1: Foundation — tooling, domain entities, ports, storage adapter, tests
- [x] 2026-05-29 — Phase 2: Core TUI — AnimationLoop, SpeechBubble, StatusBar, CompanionScreen, resize handling
- [x] 2026-05-29 — Phase 3: AI Integration — GeminiAdapter, FallbackPhraseStore, GeneratePhraseUseCase, offline indicator
- [x] 2026-05-29 — Phase 4: Buddy Lifecycle — CreateBuddyUseCase, BuddyPickerScreen, --new / --list / --delete flags
- [x] 2026-05-29 — Phase 5: Polish & Release — config.json, PhraseType rotation, README, CI, npm bin
- [x] 2026-05-29 — Post-release: Responsive TUI refactor (createWidgets/applyLayout split, lpos fix, bottom-anchored speech bubble)
- [x] 2026-05-29 — Post-release: Buddy ASCII art redesigned as floating heads (4–5 rows); box sized from template dimensions

## In Progress
<!-- Nothing -->

## Blocked
<!-- Nothing -->

## Icebox
- `--watch` mode: buddy reacts to git commits in current repo
- Shell integration snippet (auto-launch in .zshrc/.bashrc)
- Community buddy template registry
- `--daemon` mode with OS notifications
- Custom ASCII art import (user-supplied buddy templates)
