# Decision Log

<!-- One entry per significant decision. Newest first.
     For major architectural decisions, write a full ADR in docs/adr/ instead.
     This log is for daily decisions that don't warrant a full ADR. -->

## Format
```
### YYYY-MM-DD — [Decision title]
- **Decision:** What was decided
- **Why:** The reason — context, constraints, trade-offs
- **Alternatives considered:** What else was on the table
- **Consequences:** What this means going forward
```

---

### 2026-05-28 — ASCII buddy visuals are pre-designed template files, not AI-generated
- **Decision:** Buddy ASCII art is stored as curated TypeScript frame arrays in `src/assets/buddies/`. The AI generates personality metadata only (name, description, talent).
- **Why:** LLMs produce inconsistent ASCII art — quality varies wildly, output can't be animated, and it wastes tokens on every buddy creation. Pre-designed frames guarantee consistent quality, support multi-frame animation, and are zero-cost at runtime.
- **Alternatives considered:** AI-generated ASCII at buddy creation time; procedural ASCII generation algorithm.
- **Consequences:** Adding a new buddy species requires a human to design all 5 mood state frame arrays. This is intentional — quality over quantity.

### 2026-05-28 — Two launch species: `crash` (Crash Bandicoot fan art) and `generic-dev`
- **Decision:** Ship with exactly 2 species. `crash` is the hero mascot; `generic-dev` is the default for users who prefer a neutral mascot.
- **Why:** Two species is enough to validate the species-switching mechanic without over-investing in art before validating interest.
- **Alternatives considered:** One species only; five species at launch.
- **Consequences:** `--new` randomly assigns one of the two. Post-launch species added as community contributions.

### 2026-05-28 — neo-blessed chosen over ink for the TUI layer
- **Decision:** Use neo-blessed (blessed fork) instead of React-based ink.
- **Why:** neo-blessed gives direct terminal control — precise box positioning, raw key events, and manual repaint control. This is necessary for pixel-accurate ASCII art animation. ink's React model adds abstraction overhead that works against low-level animation needs.
- **Alternatives considered:** ink (React-based), terminal-kit, vanilla ANSI escape codes.
- **Consequences:** Team must learn neo-blessed API. Animation flicker is managed manually (see PITFALLS.md). If neo-blessed is abandoned, migration to ink is possible via the UI layer boundary — domain and application code are unaffected.

### 2026-05-28 — Phrase interval defaults to 30s, configurable in Phase 5
- **Decision:** Hardcode 30s phrase interval in Phase 1–4; make it configurable via `config.json` in Phase 5.
- **Why:** Avoids config file complexity before the core feature is working. 30s feels alive without being annoying.
- **Alternatives considered:** Configurable from day one; 60s default.
- **Consequences:** Phase 1–4 code uses a `DEFAULT_PHRASE_INTERVAL = 30` constant. Phase 5 replaces the constant with a config read.
