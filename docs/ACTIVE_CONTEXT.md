# Active Context

<!-- Update this file at the START and END of every AI session.
     It is the first doc read each session to restore project state. -->

## Current Focus
All 5 phases complete — project is at v0.1.0 release state.

## In Progress
- Nothing — all phases merged to main

## Blockers
- None

## Next Steps
- `npm publish` when ready to release to npm
- Consider v0.2.0: RemoteTemplateRegistry (community species), `--daemon` mode, hunger/happiness stats

## Significant Decisions
- 2026-05-28 — Chose Layered DDD with Ports & Adapters over simple MVC (see ADR-001)
- 2026-05-28 — Chose neo-blessed over ink for direct terminal control needed by ASCII art animation
- 2026-05-28 — ASCII buddy visuals are pre-designed template files, not AI-generated at runtime
- 2026-05-28 — Two species at launch: `crash` (Crash Bandicoot) and `generic-dev`
- 2026-05-29 — `--delete` reuses BuddyPickerScreen (press `d`) rather than a separate TUI flow
- 2026-05-29 — SLEEPING triggers after 10 min of no keypress (not phrase interval); any keypress wakes
- 2026-05-29 — phraseIntervalSeconds defaults to 30s, configurable via config.json

## Recent Context
- 2026-05-28 — Full documentation suite initialized
- 2026-05-29 — Phase 1–5 complete and merged; 67 tests passing, CI green

## Open Questions
- None blocking v0.1.0
