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

### 2026-05-29 — Buddy species redesigned as floating heads
- **Decision:** Strip body rows from both `crash` and `generic-dev` frames; each species is now a 4–5 row floating head. `BuddyTemplate.width/height` declared per-species; `CompanionScreen` derives `boxW = template.width + 4` and `boxH = template.height + 3` at construction time.
- **Why:** Full-body ASCII art (9 rows) consumed most of the terminal height and felt heavy as a persistent widget. A floating head is compact, expressive, and leaves room for the speech bubble.
- **Alternatives considered:** Keep full body but scale down; make body optional per template.
- **Consequences:** Any future species must declare accurate `width` and `height` on `BuddyTemplate` — the box is sized from those values, not hardcoded. Existing 67 tests still pass.

### 2026-05-29 — UI stripped to bare terminal: no borders, no header, no status bar
- **Decision:** Remove all blessed borders, the header box, and the status bar from `CompanionScreen`. Speech text renders as plain terminal text directly beside (full mode) or below (compact/minimal) the buddy. Only the key hints footer remains as UI chrome.
- **Why:** The previous layout felt cluttered — borders, header, and status bar competed visually with the ASCII art. The buddy and its phrase are the only content that matters.
- **Alternatives considered:** Keep header but remove border; keep status bar inline with footer.
- **Consequences:** `StatusBar` class is no longer used in `CompanionScreen` (file kept for potential reuse). Buddy box dimensions simplified: `boxH = template.height`, `boxW = template.width + 2`. Mood/offline state no longer displayed; could be reintroduced as a minimal footer annotation if needed.

### 2026-05-29 — CompanionScreen refactored to createWidgets() + applyLayout()
- **Decision:** Split the former `buildLayout()` into `createWidgets()` (called once on open) and `applyLayout()` (called on every resize). Added `reposition()` methods to `SpeechBubble` and `StatusBar` that mutate `position` in-place and clear blessed's `lpos` cache. Speech bubble uses `bottom`-anchored positioning in compact/minimal modes.
- **Why:** The original resize handler called `screen.destroy()` + reset `this.destroyed = false`, which was a broken pattern — it destroyed the screen object but left timers and event listeners alive. The in-place approach keeps all bindings intact across resizes. Bottom-anchoring the speech bubble in compact/minimal modes prevents it from falling off-screen when the terminal is short.
- **Alternatives considered:** Recreate all widgets on resize (works but flickers and loses state); fixed positions (breaks on short terminals).
- **Consequences:** `SpeechBubble` and `StatusBar` expose `reposition()` as part of their public API. All layout logic lives in `applyLayout()` — adding a new breakpoint means touching only that method.

### 2026-05-28 — TemplateRegistry port added; v1 ships with BundledTemplateRegistry
- **Decision:** Introduce a `TemplateRegistry` port (interface) in the domain layer with three adapters planned: `BundledTemplateRegistry` (v1, reads from `src/assets/buddies/`), `RemoteTemplateRegistry` (v2, fetches from remote registry + local cache), and a future `HybridTemplateRegistry`. v1 ships with bundled only.
- **Why:** Templates bundled in the binary require a new app release for every new species. A port/adapter design lets v2 serve templates from a remote registry (GitHub repo + raw URLs) with zero domain changes — same pattern as the AIProvider swap. Building the remote adapter now would block Phase 1 with infrastructure that has zero users; the port alone is 10 lines.
- **Alternatives considered:** Always bundled (no extensibility); remote-only from day one (blocks shipping, requires infra); plugin loader (overkill).
- **Consequences:** `TemplateRegistry` is a first-class domain port alongside `AIProvider` and `BuddyRepository`. `main.ts` wires `BundledTemplateRegistry` in v1. Adding new species in v1 still requires a release — acceptable until there are real users requesting community templates.

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
