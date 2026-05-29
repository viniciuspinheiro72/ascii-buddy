# Research Document

---

## Part 1 — Market Research

### Problem Statement
Developers spend 8+ hours a day in the terminal with zero personality or emotional feedback from their tooling. The few "fun" terminal tools that exist (cowsay, fortune) are static and dumb — no persistence, no personality, no AI. There is no terminal companion that knows it's talking to a developer, remembers context, and animates.

### Target Users
**Primary:** Solo or indie developers (any stack) who live in the terminal and have a taste for humor and nostalgia. They remember Tamagotchi, enjoy ASCII art, and appreciate tools with personality.
**Secondary:** Dev streamers and content creators who want a charming background element in screen recordings.

### Competitor / Prior Art Analysis
| Name | Strengths | Weaknesses | URL |
|------|-----------|------------|-----|
| cowsay | Universal, simple, funny | Static, no personality, no persistence | `man cowsay` |
| fortune | Classic, endless quotes | Not dev-specific, no AI, no visuals | `man fortune` |
| nyancat (terminal) | Animated, charming | Purely visual, no interaction | github.com/klange/nyancat |
| Tamagotchi (concept) | Emotional attachment, persistence, needs | No terminal version, no AI | — |
| GitHub Copilot CLI | AI in the terminal | No personality, not a companion | github.com/github/gh-copilot |

### Market Opportunity
LLM APIs are now cheap and fast enough for sub-second short phrase generation. ASCII art has a nostalgia revival (see: ASCII art generators, retro terminal aesthetics on Twitter/X). No one has combined persistent AI companion + ASCII animation + terminal-native UX. The timing is right.

### Go / No-Go Decision
**Go.** Low technical risk (known stack), high creative differentiation, zero competitors in the exact niche. Worst case it's a fun personal tool; best case it becomes a beloved open-source project.

---

## Part 2 — Technical Research

### Technical Feasibility
**Yes — high confidence.** TypeScript + neo-blessed is a proven stack for rich TUI apps (see: `blessed-contrib` dashboards). Gemini API has a free tier sufficient for development and light use. Local JSON storage is trivially implementable. The main unknown is animation frame rate smoothness in blessed — needs a quick PoC.

### Third-Party Services & APIs
| Service | Purpose | Pricing Model | Risk |
|---------|---------|---------------|------|
| Google Gemini API | AI phrase generation + buddy metadata | Free tier (60 req/min), then pay-per-token | API key requirement is a UX friction point for new users |
| npm registry | Package distribution | Free | Low |

### Key Technical Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| blessed animation flicker on resize | Medium | High | Use `screen.cleanLine()` + double-buffer; test on multiple terminal emulators |
| Gemini API rate limit hit in heavy use | Low | Medium | Add local phrase cache; don't call on every tick |
| JSON storage corruption on force-quit | Low | High | Write to temp file then `fs.rename()` (atomic swap) |
| AI generates off-brand phrases | Medium | Medium | Strong system prompt + temperature ≤ 0.8; add phrase type enum |
| Terminal size too small for buddy | Medium | Medium | Detect `process.stdout.columns` < 40 and show compact mode |

### Proof of Concept Needed?
**Yes — one spike before writing domain code:** render a multi-frame ASCII animation loop in neo-blessed at 2 fps with a live resize handler. If this works cleanly, the rest is straightforward. Estimated time: 2 hours.
