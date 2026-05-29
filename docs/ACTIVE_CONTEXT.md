# Active Context

<!-- Update this file at the START and END of every AI session.
     It is the first doc read each session to restore project state. -->

## Current Focus
Docs updated with TemplateRegistry port/adapter design. Starting Phase 1: Foundation — package.json, tsconfig, domain model (Buddy entity, all value objects, all three ports including TemplateRegistry), storage adapter, BundledTemplateRegistry, and animation PoC spike.

## In Progress
- Nothing yet — docs complete, code not started

## Blockers
- Need a `GEMINI_API_KEY` to test the AI adapter (Phase 3 dependency — not blocking Phase 1)

## Next Steps
1. Set up `package.json`, `tsconfig.json` (with `@` alias), ESLint, Prettier, Vitest config
2. Scaffold the full `src/` directory structure (empty files matching `docs/ARCHITECTURE.md` tree)
3. Implement domain layer: `Buddy` entity, all value objects, `AIProvider` and `BuddyRepository` ports
4. Implement `LocalStorageAdapter` with atomic write pattern
5. Build animation PoC spike: render a multi-frame ASCII loop in neo-blessed at 2fps with resize handling

## Significant Decisions
- 2026-05-28 — Chose Layered DDD with Ports & Adapters over simple MVC (see ADR-001)
- 2026-05-28 — Chose neo-blessed over ink for direct terminal control needed by ASCII art animation
- 2026-05-28 — ASCII buddy visuals are pre-designed template files, not AI-generated at runtime
- 2026-05-28 — Two species at launch: `crash` (Crash Bandicoot) and `generic-dev`

## Recent Context
- 2026-05-28 — Full documentation suite initialized: PRODUCT_BRIEF, RESEARCH, PRD, TECH_DESIGN, TESTING, PITFALLS, UX_DESIGN, GLOSSARY, ARCHITECTURE, STRUCTURE, ADR-001, CONSTITUTION, AGENTS, CLAUDE

## Open Questions
- Should `phraseIntervalSeconds` default to 30s or be configurable from the start? (P1 in PRD — decide before Phase 3)
- Confirm neo-blessed vs blessed fork health before Phase 2 starts (see RESEARCH.md risk table)
