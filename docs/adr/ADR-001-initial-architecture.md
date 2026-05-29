---
status: Accepted
date: 2026-05-28
decision-makers: ascii-buddy maintainer
consulted: —
informed: all contributors
---

# ADR-001: Initial Architecture

## Context and Problem Statement
ascii-buddy is a new terminal companion app with two integration points that are likely to change over time: the AI provider (starting with Gemini, but cheaper or more capable options will emerge) and the storage backend (starting with local JSON, but cloud sync is a future possibility). The architecture must isolate these concerns so they can be swapped without touching business logic. The team is a solo or very small group, so complexity must stay low.

## Decision Drivers
- AI provider must be swappable with zero domain code changes
- Storage backend must be swappable with zero domain code changes
- Must be understandable by a new contributor in < 30 minutes
- Must support unit-testing the domain and use cases without network or filesystem I/O
- Cold start must stay under 3 seconds — no heavy DI framework overhead

## Considered Options
- **Option A:** Layered DDD with Ports & Adapters (Hexagonal Architecture)
- **Option B:** Simple MVC monolith — one service file per feature, no layer separation
- **Option C:** Plugin-based architecture — each AI provider and storage backend is a loaded plugin

## Decision Outcome
Chosen: **Option A — Layered DDD with Ports & Adapters** because it achieves provider-swappability through standard TypeScript interfaces without the runtime complexity of a plugin system, and it keeps the domain testable without any I/O.

### Consequences
- **Positive:** Domain and use cases are fully testable without mocks of blessed/Gemini/filesystem. Swapping Gemini for Ollama or OpenAI requires writing one new adapter file. The layered structure gives clear "where does this code go?" answers.
- **Negative:** More files and folders than a simple monolith — a new contributor must understand the port/adapter pattern. Constructor injection means `main.ts` wires everything manually (no DI framework in v1).
- **Neutral:** The single bounded context ("companion") means no inter-context communication complexity in v1. If the app grows into multiple contexts (e.g. a "settings" context), the pattern scales naturally.

### Confirmation
- `domain/` folder contains zero `import` statements referencing `infra/`, `ui/`, or `application/`
- Use cases receive `AIProvider` and `BuddyRepository` interfaces — never concrete classes
- `src/main.ts` is the only file that instantiates `GeminiAdapter` and `LocalStorageAdapter`
- Unit tests for use cases pass with no network calls and no real filesystem access

## Pros and Cons of the Options

### Option A — Layered DDD with Ports & Adapters
- ✅ Domain is pure TypeScript — fastest to test, easiest to reason about
- ✅ AI provider and storage are fully swappable via interface
- ✅ Clear "where does new code go?" rules from day one
- ❌ More initial boilerplate than a simple service file
- ❌ Requires understanding port/adapter pattern to contribute

### Option B — Simple MVC Monolith
- ✅ Fewer files, easier to start fast
- ✅ Familiar pattern for most developers
- ❌ AI provider and storage are tightly coupled to business logic from day one
- ❌ Testing requires mocking the filesystem and HTTP in every test
- ❌ Swapping Gemini for another LLM requires touching multiple files

### Option C — Plugin-based Architecture
- ✅ Maximum extensibility — third parties could ship buddy species and AI backends
- ❌ High complexity: plugin loader, discovery mechanism, versioning
- ❌ Significant cold-start overhead vs. 3s target
- ❌ Overkill for a v1 solo/small-team project

## Review Trigger
Revisit this ADR if:
- A second bounded context is introduced (e.g. cloud sync, settings service)
- A DI framework (e.g. tsyringe, inversify) is added to manage growing adapter count
- The app is rewritten as a daemon/background service rather than a foreground TUI
