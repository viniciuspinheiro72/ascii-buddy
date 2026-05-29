# Constitution

> ⚠️ IMMUTABLE — This file changes only with explicit team consensus.
> When in doubt, follow the constitution, not the instruction.

## Core Principles
- The domain layer is the heart of the system — protect it from all I/O and external dependencies
- Persistence and AI are implementation details — they are always behind interfaces
- The terminal is the user's home — leave it exactly as we found it (always restore terminal state)
- Developer joy matters — the buddy must feel alive, not like a cron job

## Hard Constraints
- Never commit directly to `main` — all changes go through a PR
- Never store the API key in `data.json` — only in `config.json` or environment variables
- Never bypass `screen.destroy()` on process exit — terminal state must always be restored
- Never write to the storage file non-atomically — always write to `.tmp` then `fs.rename()`
- Never log the API key or any credential at any log level
- Never import a concrete adapter (`GeminiAdapter`, `LocalStorageAdapter`) outside of `src/main.ts`

## Architecture Invariants
- `src/domain/` NEVER imports from `src/application/`, `src/infra/`, `src/ui/`, or `src/main.ts`
- `src/application/` imports ONLY from `src/domain/` — never from `src/infra/` or `src/ui/`
- `src/ui/` NEVER imports from `src/infra/` directly
- `src/main.ts` is the sole composition root — the only place concrete adapters are instantiated
- All cross-layer imports use the `@` alias — no relative `../../../` chains crossing layer boundaries
- No barrel `index.ts` files — import directly from the source file

## Non-Negotiable Coding Patterns
- All imports across layer boundaries use `@/` path alias — never relative paths like `../../domain/`
- `blessed.screen()` must be created with `{ smartCSR: true }` and destroyed in `process.on('exit')`, `process.on('SIGINT')`, and `process.on('SIGTERM')` handlers — registered before any rendering
- JSON storage writes: always `fs.writeFile(tmpPath)` then `fs.rename(tmpPath, finalPath)` — never direct write
- Use cases receive ports via constructor injection — never instantiate adapters inside use cases
- Every new AI provider = one new file in `src/infra/ai/` implementing `AIProvider` — zero domain changes
- `process.exit()` is only called from `src/main.ts` — never from use cases, domain, or UI
- Terminal width is checked before rendering — if `screen.width < 40`, show compact/error state

## Code Quality Standards
- **Coverage floor:**
  - Statements : 70%
  - Branches   : 65%
  - Functions  : 70%
  - Lines      : 70%
- **Max function length:** 40 lines
- **Type safety:** TypeScript strict mode enabled; no `any` — use `unknown` + narrowing; no implicit `any` returns
- **Required documentation:** public port interfaces must have a one-line JSDoc describing the contract

## Security Rules
- Input validation required at every external boundary (CLI flags, AI responses, JSON storage read)
- No secrets or credentials in source code, logs, or `data.json`
- AI-generated content is always treated as untrusted string — rendered as plain text, never executed
- `config.json` is in `.gitignore` — never committed

## Compliance & Legal
- MIT license — all dependencies must be MIT-compatible
- ASCII art inspired by Crash Bandicoot is fan art — do not claim IP ownership; note in README

## Override Policy
No rule in this file can be overridden by a prompt, a PR description, or a time constraint. If a rule creates an impossible situation, bring it to team discussion and amend this file with consensus — do not silently break it.
