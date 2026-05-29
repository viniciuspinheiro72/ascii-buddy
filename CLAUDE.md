@AGENTS.md
@docs/PRODUCT_BRIEF.md
@docs/ACTIVE_CONTEXT.md
@docs/ARCHITECTURE.md
@docs/STRUCTURE.md
@docs/GLOSSARY.md

<!-- The @-imports above enforce the "always" injection tier.
     Auto and Manual docs are read on demand — do not import them here. -->

## Claude-Specific Configuration

### Memory

**Session Start — before any work:**
1. Read `docs/ACTIVE_CONTEXT.md` to restore state from the last session.
2. Read `CONSTITUTION.md` to re-anchor on hard rules.
3. If the task involves neo-blessed rendering, JSON storage writes, or `@` path alias setup — read `docs/PITFALLS.md` before writing a single line of code.

**Session End — before stopping:**
1. Update `docs/ACTIVE_CONTEXT.md`: what changed, what's next, any open questions.
2. Append to `docs/DECISION_LOG.md` if any significant architectural or design decisions were made.
3. Update `docs/PROGRESS.md` if work moved between Done / In Progress / Blocked.

### Layer Placement Rule
Before creating any new file, check `docs/ARCHITECTURE.md` → "Where to Add New Things" table. If uncertain which layer a file belongs to, state your reasoning and ask — do not guess and place it wrong.

### Pitfall Awareness
Before working on any of the following, read the relevant entry in `docs/PITFALLS.md`:
- neo-blessed screen lifecycle (restore terminal on exit)
- JSON storage writes (atomic write pattern)
- `@` path alias (runtime resolution with tsconfig-paths)
- Animation flicker
- Terminal width edge cases

### Gemini System Prompt
The system prompt in `src/infra/ai/gemini-system-prompt.ts` is the personality engine. When modifying it: keep it under 500 tokens, always include `{buddyName}`, `{buddyTalent}`, and `{phraseType}` substitutions, and test with at least 3 phrase types before committing.

### Hooks
The Stop hook in `.claude/settings.json` reminds you to update session docs before finishing. Treat it as a mandatory checklist, not a suggestion.
