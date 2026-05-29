# Pitfalls & Known Gotchas

<!-- Each entry: what the trap is, why it happens, how to avoid it.
     Add an entry whenever you hit an unexpected problem — future sessions
     will read this to avoid repeating the same mistake. -->

## blessed screen not restored on crash
- **What happens:** If the process exits without calling `screen.destroy()`, the terminal is left in raw mode — cursor hidden, no echo, broken shell.
- **Why it happens:** neo-blessed holds the terminal in raw mode until explicitly released.
- **How to avoid:** Always register `process.on('exit', () => screen.destroy())` AND `process.on('SIGINT', ...)` and `process.on('SIGTERM', ...)`. Do this before rendering anything.
- **Discovered:** Known neo-blessed gotcha; document before first coding session.

---

## JSON storage partial write on force-quit
- **What happens:** `data.json` becomes corrupt (truncated JSON), crashing the next startup.
- **Why it happens:** `fs.writeFile` is not atomic — if the process is killed mid-write, the file is left in a partial state.
- **How to avoid:** Write to `data.json.tmp` first, then use `fs.rename()` (atomic on POSIX). Keep `data.json.bak` as a one-generation backup.
- **Discovered:** Standard Node.js filesystem pitfall; documented at init.

---

## `@` path alias not resolved at runtime
- **What happens:** `Cannot find module '@/domain/buddy'` at runtime even though TypeScript compiles fine.
- **Why it happens:** `tsconfig` path aliases are a TypeScript-only concept — Node.js doesn't know about them. `tsc` strips them but doesn't rewrite imports.
- **How to avoid:** Use `tsconfig-paths/register` in the entry point for dev (`tsx` handles this automatically), and `tsc-alias` as a post-build step for production.
- **Discovered:** Classic TypeScript path alias trap; document before first import.

---

## Gemini API silently truncates very long system prompts
- **What happens:** The buddy's personality seems flat or ignores the `buddyTalent` field.
- **Why it happens:** Gemini's free tier has a token limit per request; an overly verbose system prompt may be truncated without error.
- **How to avoid:** Keep the system prompt under 500 tokens. Use template substitution for personality fields rather than large static blocks. Verify prompt length in `GeminiAdapter`.
- **Discovered:** Expected behavior from LLM APIs; note it before writing the prompt.

---

## Animation flicker on fast terminals
- **What happens:** ASCII frames flash/flicker during animation, especially on resize.
- **Why it happens:** blessed re-renders the full screen diff on each frame. If the diff is large (e.g. a full-screen repaint after resize), the intermediate state is visible.
- **How to avoid:** Use `screen.cleanLine()` selectively; debounce resize events 150ms before re-rendering; keep animation regions small and bounded by a fixed-size Box.
- **Discovered:** Common blessed animation issue; document before building the animation loop.

---

## Terminal too narrow breaks the layout
- **What happens:** ASCII buddy art overflows or wraps, destroying the visual.
- **Why it happens:** `process.stdout.columns` can be as low as 40 in split panes or CI terminals.
- **How to avoid:** Check `screen.width` before rendering. If `< 50`, switch to compact mode (buddy only, no speech bubble). Minimum supported width: 40 columns.
- **Discovered:** Anticipated from TUI development experience; document before building layout.
