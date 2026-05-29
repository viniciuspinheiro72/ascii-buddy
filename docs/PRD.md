# Product Requirements Document (PRD)

## Overview & Purpose
ascii-buddy is a terminal-native animated ASCII companion that generates developer-personality-driven phrases via AI and persists across sessions.

## Problem Statement
Developers lack a persistent, personality-driven companion that lives in the terminal, speaks developer language, and provides a moment of levity without leaving the CLI.

## Target Users & Personas

**Persona 1 — "The Terminal Hermit" (Alex, Senior Backend Dev)**
- Lives in tmux + neovim all day
- Appreciates dry humor and sarcasm
- Wants a companion that roasts their bad commit messages
- Frustration: all "fun" CLI tools are one-shot jokes with no memory

**Persona 2 — "The Stream Personality" (Jordan, Dev Streamer)**
- Records terminal sessions for YouTube/Twitch
- Wants a charming, animated visual element on screen
- Needs it to look good and be configurable
- Frustration: nothing fun in the terminal looks professional enough for content

## Goals & Success Metrics
| Goal | Metric | Target |
|------|--------|--------|
| Adoption | GitHub stars | 500 in 3 months |
| Performance | Cold start time | < 3 seconds |
| Engagement | Return users (run > 3 times) | 60% of installers |
| Quality | Crash rate | < 0.1% of sessions |

## Scope

### MVP Features — P0 (must-have for launch)
- Animated ASCII buddy with at least 2 species (Crash Bandicoot + 1 generic dev mascot)
- Mood states: idle, happy, sad, talking, sleeping — each with ≥ 2 animation frames
- AI phrase generation via Gemini API (dev-themed, personality-aware)
- Persistent storage: buddy state survives terminal restarts
- Auto-load last active buddy on startup
- `--list` flag: interactive TUI buddy picker with animation preview + keyboard nav
- `--new` flag: create a new buddy (AI generates name, description, talent)
- Phrase display: speech bubble attached to buddy, auto-clears after N seconds
- Graceful fallback: if no API key, show hardcoded fallback phrases

### Important Features — P1 (ship soon after launch)
- `--delete <id>` flag: remove a buddy with confirmation prompt
- Phrase history: last 10 phrases stored per buddy
- Mood transitions: buddy reacts to time of day (sleepy late at night, energetic morning)
- Config file: `~/.ascii-buddy/config.json` for API key, phrase interval, default buddy
- Multiple AI provider support: add `--provider` flag (Gemini default)

### Nice-to-have — P2 (future, not committed)
- Custom ASCII art import (user-supplied buddy templates)
- `--watch` mode: buddy reacts to git commits in current repo
- Shell integration snippet (auto-launch in .zshrc/.bashrc)
- Community buddy template registry

## Functional Requirements
- The system MUST load within 3 seconds on cold start
- The system MUST not crash if Gemini API is unreachable — use cached/fallback phrases
- The system MUST write storage atomically to prevent corruption on force-quit
- The system MUST handle terminal resize events and re-render correctly
- The system MUST run on macOS, Linux, and WSL2
- The buddy picker MUST be navigable via arrow keys + Enter; ESC exits without selection
- New buddy creation MUST call AI to generate name, description, and talent
- All AI-generated metadata MUST be dev-themed (programming languages, tools, paradigms)

## Non-Functional Requirements
| Attribute     | Requirement | Notes |
|---------------|-------------|-------|
| Performance   | < 3s cold start | Including storage read + first render |
| Scalability   | Support 50+ buddies in picker | Virtual scrolling if needed |
| Availability  | Offline mode with fallback phrases | No hard dependency on network |
| Security      | API key stored in config, never in data.json | Warn if key found in storage |
| Accessibility | Full keyboard navigation, no mouse required | Color optional (graceful mono fallback) |

## User Stories & Acceptance Criteria

**US-001 — Auto-load last buddy**
As a developer, I want my last active buddy to appear when I open the TUI so that I don't have to re-select every time.
- Given: a buddy was previously active and saved
- When: I run `ascii-buddy` with no flags
- Then: the last active buddy renders immediately with its idle animation

**US-002 — Create a new buddy**
As a developer, I want to generate a new AI-designed buddy so that I can have a fresh companion with a unique personality.
- Given: I run `ascii-buddy --new`
- When: the AI call succeeds
- Then: a new buddy is created with AI-generated name, description, and talent; it becomes the active buddy; it is saved to storage

**US-003 — Browse and pick a buddy**
As a developer, I want to browse all my buddies and switch to one so that I can choose my companion for the session.
- Given: I run `ascii-buddy --list`
- When: the picker opens
- Then: I see all buddies listed with name + talent; hovering shows the buddy's animation on the right; pressing Enter sets that buddy as active

**US-004 — Receive a dev phrase**
As a developer, I want my buddy to say something relevant to dev work so that I get a moment of humor or wisdom.
- Given: the buddy is in talking mood
- When: a phrase is displayed
- Then: it appears in a speech bubble near the buddy; it is dev-themed and references the buddy's talent; it clears after 8 seconds

**US-005 — Graceful offline fallback**
As a developer, I want the app to still work without internet so that a network issue doesn't break my terminal session.
- Given: Gemini API is unreachable
- When: a phrase would be generated
- Then: a hardcoded fallback phrase is shown; no crash; a subtle indicator shows "offline mode"

## Design & UX Considerations
- Full UX flows and ASCII frame designs live in `docs/UX_DESIGN.md`
- Terminal width < 40 columns: compact mode (buddy only, no speech bubble)
- All interaction via keyboard; mouse support is optional

## Technical Considerations
- Domain layer must be AI-provider-agnostic (port/adapter pattern)
- blessed screen must be properly destroyed on exit to restore terminal state
- Path alias `@` maps to `src/` in tsconfig and at runtime (tsconfig-paths or similar)

## Milestones & Releases
- **Phase 1 — Foundation:** repo setup, domain model, storage adapter, blessed PoC
- **Phase 2 — Core TUI:** main companion screen, animation loop, speech bubble
- **Phase 3 — AI Integration:** Gemini adapter, system prompt, phrase generation
- **Phase 4 — Buddy Lifecycle:** `--new`, `--list` picker, `--delete`
- **Phase 5 — Polish:** fallback phrases, mood transitions, config file, release

## Assumptions & Constraints
- Users have Node.js ≥ 18 installed
- Users have a terminal emulator that supports 256 colors (graceful fallback for mono)
- API key is provided by the user — no bundled key in the package

## Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| neo-blessed maintenance status | Medium | High | Evaluate `blessed` fork health at start; have `ink` as fallback |
| Gemini API breaking changes | Low | High | Version-pin SDK; abstract behind AIProvider port |
| ASCII art looks bad on some fonts | Medium | Medium | Test on JetBrains Mono, Fira Code, default macOS Terminal font |

## Open Questions
- Should buddies have a "hunger" or "happiness" stat that degrades over time? (P1 candidate)
- Should phrase interval be configurable or fixed at 30s?
- Do we want a `--daemon` mode that runs in background and sends phrases as OS notifications?
