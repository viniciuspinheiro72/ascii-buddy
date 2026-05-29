# Active Context

<!-- Update this file at the START and END of every AI session.
     It is the first doc read each session to restore project state. -->

## Current Focus
Phase 5 — Polish: config file, mood transitions, fallback phrase variety, release prep.

## In Progress
- Nothing yet — Phase 4 committed, Phase 5 not started

## Blockers
- None — `GEMINI_API_KEY` needed at runtime for AI features, but not for development/tests

## Next Steps
1. Config file support — read `phraseIntervalSeconds` and tunables from `~/.ascii-buddy/config.json`
2. Mood transitions — HAPPY on first phrase, SAD on long idle, SLEEPING after timeout
3. Fallback phrases polish — ensure variety and correct rotation across PhraseTypes
4. Release prep — `npm pack` smoke test, README with install + usage, GitHub Actions CI

## Significant Decisions
- 2026-05-28 — Chose Layered DDD with Ports & Adapters over simple MVC (see ADR-001)
- 2026-05-28 — Chose neo-blessed over ink for direct terminal control needed by ASCII art animation
- 2026-05-28 — ASCII buddy visuals are pre-designed template files, not AI-generated at runtime
- 2026-05-28 — Two species at launch: `crash` (Crash Bandicoot) and `generic-dev`
- 2026-05-29 — `--delete` reuses BuddyPickerScreen (press `d` in the list) rather than a separate flow

## Recent Context
- 2026-05-28 — Full documentation suite initialized
- 2026-05-29 — Phases 1–3 complete: domain, TUI, Gemini AI integration — 53 tests passing
- 2026-05-29 — Phase 4 complete: CreateBuddyUseCase, ListBuddiesUseCase, DeleteBuddyUseCase, BuddyPickerScreen, --new/--list/--delete flags wired — 67 tests passing

## Open Questions
- `phraseIntervalSeconds`: default 30s or make configurable in Phase 5? (decide at Phase 5 start)
- SLEEPING mood: trigger after how many minutes of idle? (10 min suggested in PRD)
