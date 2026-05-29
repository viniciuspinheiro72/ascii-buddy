# Technical Design Document

## Tech Stack
| Layer          | Technology        | Version   | Reason for Choice |
|----------------|-------------------|-----------|-------------------|
| Language       | TypeScript        | 5.x       | Type safety + DDD modeling; strict mode enforced |
| Runtime        | Node.js           | ≥ 18      | Native fetch, stable ESM, wide install base |
| TUI Framework  | neo-blessed       | latest    | Full terminal control, box/text primitives, resize events |
| AI SDK         | @google/generative-ai | latest | Official Gemini SDK; wrapped behind AIProvider port |
| Storage        | Local JSON file   | —         | Zero-dependency; `~/.ascii-buddy/data.json` |
| Config         | Local JSON file   | —         | `~/.ascii-buddy/config.json`; never committed |
| Build          | tsc + tsx         | —         | tsx for dev (no compile step); tsc for production build |
| Path Aliases   | tsconfig-paths    | —         | Resolves `@/*` → `src/*` at runtime |
| Package Manager| npm               | —         | Default; lockfile committed |

> Stack summary is repeated in `AGENTS.md` for quick AI reference. When the stack changes, update both files.

## Goals
- Buddy data outlives any terminal session
- AI backend is swappable with zero domain code changes
- TUI renders cleanly on resize and terminal exit restores shell state
- Cold start under 3 seconds including storage read + first render
- Works fully offline with fallback phrases

## Non-Goals
- GUI, web, or mobile interface
- Real-time multiplayer or cloud sync
- Buddy evolution / inventory mechanics (v1)
- Automated shell profile injection

## Architecture Overview
Layered DDD (Domain-Driven Design) with Ports & Adapters (Hexagonal):

```
┌─────────────────────────────────────────────┐
│              CLI Entry Point                │  src/main.ts
│         (flag parsing, bootstrap)           │
├─────────────────────────────────────────────┤
│              Application Layer              │  src/application/
│   (use cases: LoadBuddy, CreateBuddy,       │
│    GeneratePhrase, ListBuddies)             │
├──────────────┬──────────────────────────────┤
│  Domain Layer│                              │  src/domain/
│  (pure, no   │  Buddy, BuddyTemplate,       │
│   deps)      │  Mood, AIProvider port,      │
│              │  BuddyRepository port)       │
├──────────────┴──────────────────────────────┤
│           Infrastructure Layer              │  src/infra/
│  GeminiAdapter, LocalStorageAdapter,        │
│  fallback phrase store                      │
├─────────────────────────────────────────────┤
│                 TUI Layer                   │  src/ui/
│   (neo-blessed screens, animation loop,     │
│    speech bubble, buddy picker)             │
└─────────────────────────────────────────────┘
```

## Directory Structure
See `docs/ARCHITECTURE.md` for the full folder map and naming conventions.

## MCP Servers
| Server | Purpose | Config File | Notes |
|--------|---------|-------------|-------|
| — | None configured at init | — | Add if project tooling expands |

## Environment Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Authenticates requests to Gemini API | Yes (can also be set in config.json) |
| `ASCII_BUDDY_DATA_DIR` | Override default `~/.ascii-buddy/` storage path | No |
| `ASCII_BUDDY_LOG_LEVEL` | Log verbosity: `silent` \| `error` \| `debug` | No (default: `error`) |

> API key resolution order: `GEMINI_API_KEY` env var → `~/.ascii-buddy/config.json` → prompt user on first run.

## Database Schema
No relational DB. Local JSON schema at `~/.ascii-buddy/data.json`:

```ts
interface StorageSchema {
  version: number;           // schema version for migrations
  activeBuddyId: string | null;
  buddies: BuddyRecord[];
}

interface BuddyRecord {
  id: string;                // uuid
  name: string;              // AI-generated
  description: string;       // AI-generated, 1-2 sentences
  talent: string;            // AI-generated, e.g. "Rust borrow checker whisperer"
  species: string;           // template id, e.g. "crash" | "generic-dev"
  mood: Mood;                // current mood state
  createdAt: string;         // ISO 8601
  lastSeenAt: string;        // ISO 8601
  phraseHistory: string[];   // last 10 phrases
}
```

Config at `~/.ascii-buddy/config.json`:
```ts
interface ConfigSchema {
  apiKey?: string;           // stored here if not using env var
  provider: "gemini";        // AI provider id — extend as needed
  phraseIntervalSeconds: number;  // default: 30
  defaultBuddyId?: string;
}
```

## API Endpoints
N/A — this is a CLI/TUI application with no HTTP server.

## Component Architecture

### Domain Ports (interfaces)
```
AIProvider          generatePhrase(ctx: PhraseContext): Promise<string>
                    generateBuddyMetadata(): Promise<BuddyMetadata>

BuddyRepository     save(buddy: Buddy): Promise<void>
                    findById(id: string): Promise<Buddy | null>
                    findAll(): Promise<Buddy[]>
                    setActive(id: string): Promise<void>
                    getActive(): Promise<Buddy | null>
```

### Infrastructure Adapters
```
GeminiAdapter       implements AIProvider — calls @google/generative-ai
LocalStorageAdapter implements BuddyRepository — atomic JSON read/write
FallbackPhraseStore static array of 50+ hardcoded dev phrases (offline mode)
```

### Application Use Cases
```
LoadBuddyUseCase    reads active buddy from repo, loads template, starts TUI
CreateBuddyUseCase  calls AIProvider.generateBuddyMetadata(), saves, sets active
GeneratePhraseUseCase  calls AIProvider.generatePhrase(), falls back if offline
ListBuddiesUseCase  reads all buddies, opens TUI picker
```

### TUI Components (neo-blessed)
```
CompanionScreen     main screen: buddy animation + speech bubble
BuddyPickerScreen   full-screen list + animation preview panel
SpeechBubble        blessed Box with auto-clear timer
AnimationLoop       setInterval-based frame stepper
```

## Gemini System Prompt

The system prompt is the heart of the personality layer. Stored in `src/infra/ai/gemini-system-prompt.ts`:

```
You are {buddyName}, a terminal companion for software developers.
Your personality: {buddyDescription}
Your specialty: {buddyTalent}

You speak exclusively in short, punchy phrases (1–2 sentences max).
Your tone rotates between: motivational, sarcastic, wise, and absurdly funny.
Every phrase must be directly relevant to software development — 
reference real tools, paradigms, patterns, or the daily struggle of coding.

Rules:
- NEVER break the fourth wall (don't mention you are an AI)
- NEVER repeat the same phrase twice in a session
- ALWAYS sound like someone who has shipped production code at 2am
- Reference the developer's specialty ({buddyTalent}) at least 30% of the time
- Keep it under 120 characters so it fits in the speech bubble

Phrase type requested: {phraseType}
(Types: motivational | sarcastic | wise | funny | roast)
```

## Error Handling Strategy
- **Error classification:** `DomainError` | `InfrastructureError` | `ConfigError`
- **AI errors:** catch, log at debug level, return fallback phrase — never crash
- **Storage errors:** log, attempt recovery read from `.backup.json`; if corrupt, start fresh with warning
- **TUI errors:** blessed screen is destroyed in a `process.on('exit')` handler to always restore terminal
- **Logging:** only `error` level to stderr in production; `debug` available via `ASCII_BUDDY_LOG_LEVEL=debug`; never log the API key

## Security Considerations
- **API key:** never stored in `data.json`; only in env var or `config.json` (which is in `.gitignore`)
- **Data at rest:** local JSON, no encryption needed (no sensitive data beyond API key)
- **Data in transit:** HTTPS only via Gemini SDK
- **Input sanitization:** AI-generated content is rendered as plain text in blessed — no HTML injection risk
- **No network listeners:** this app never opens a port

## Performance Considerations
- **SLA:** < 3s cold start; < 1s phrase display after request
- **Animation:** 2 fps idle, 4 fps talking — minimal CPU; `setInterval` cleared on pause
- **AI calls:** debounced; cached last phrase per buddy; no call on every frame tick
- **Storage:** full read on startup only; incremental writes on state change
- **Resize:** debounced 150ms before re-render to avoid thrash

## Key Technical Decisions & Rationale
- **neo-blessed over ink:** ink is React-based (more abstraction overhead); blessed gives direct terminal control needed for pixel-precise ASCII art animation. See `docs/adr/ADR-001-initial-architecture.md`.
- **JSON over SQLite:** zero native dependency, no build step, sufficient for ≤ 50 buddies. If buddy count grows past 100, migrate to SQLite via the BuddyRepository port.
- **Atomic writes:** `fs.writeFile` to `.tmp`, then `fs.rename` — avoids partial writes on force-quit.
- **Port/Adapter for AI:** AIProvider interface in domain means switching from Gemini to OpenAI, Ollama, or any LLM is one new adapter file — no domain code changes.

## Known Technical Debt
- `tsconfig-paths` adds a runtime dependency; consider `tsc-alias` at build time for the published binary
- No schema migration strategy for `data.json` beyond `version` field — implement before v1.1
- Fallback phrase list is hardcoded; ideally loaded from a JSON asset file for easier updates
