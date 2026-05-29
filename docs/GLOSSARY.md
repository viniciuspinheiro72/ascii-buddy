# Domain Glossary

<!-- One entry per significant domain concept.
     Covers all aggregates, entities, value objects, ports, and key enums.
     Bounded context: "companion" (single context — no subdomain split in v1). -->

---

## Buddy
- **Definition:** The core domain entity — a named, persistent ASCII companion with a unique personality, dev specialization, and mood state. A Buddy is the aggregate root of the companion context.
- **NOT:** A generic "user" or "character." It is not a game avatar with stats or evolution mechanics (v1). It is not a session object — it outlives any terminal session.
- **Synonyms to avoid:** `companion`, `pet`, `character`, `avatar`, `tamagotchi` — all replaced by `Buddy` in code and docs.
- **Bounded context:** companion
- **Code name:** `Buddy` (class/interface), `BuddyRecord` (storage shape), `buddy` (variable)
- **Related terms:** BuddyTemplate, Mood, Talent, Species, Active Buddy
- **Example:** "The Buddy named 'Nullref' has the talent 'GC survivor' and is currently in IDLE mood."

---

## BuddyTemplate
- **Definition:** A value object that defines the visual design of a species — the set of ASCII art frame arrays for each mood state. It is stateless and shared across all Buddy instances of the same species.
- **NOT:** A Buddy instance. A BuddyTemplate has no name, no personality, no persistence. It is purely visual specification.
- **Synonyms to avoid:** `skin`, `avatar`, `design`, `sprite` — use `BuddyTemplate` in code.
- **Bounded context:** companion
- **Code name:** `BuddyTemplate` (type/interface), stored in `src/assets/buddies/`
- **Related terms:** Species, Mood, MoodState, Frame
- **Example:** "The `crash` BuddyTemplate defines 2 idle frames, 2 talking frames, and 1 sleeping frame."

---

## Species
- **Definition:** The identifier that links a Buddy to its BuddyTemplate. It is the visual "type" of the buddy — which pre-designed ASCII art set it uses. Not a biological concept.
- **NOT:** A class in an inheritance hierarchy. Not a personality type. Not related to the buddy's talent or name.
- **Synonyms to avoid:** `type`, `class`, `kind`, `race`, `skin` — use `species` in code and docs.
- **Bounded context:** companion
- **Code name:** `species: string` field on `Buddy`; valid values: `"crash"`, `"generic-dev"` (extensible)
- **Related terms:** BuddyTemplate, Buddy
- **Example:** "Buddy 'Crash' has `species: 'crash'`, so the TUI loads the `crash` BuddyTemplate for rendering."

---

## Mood
- **Definition:** The current animation and display state of a Buddy. Determines which frame array from the BuddyTemplate is played. In v1, mood transitions are driven by app logic (phrase generation, time of day) — not by a complex emotional model.
- **NOT:** A persistent emotional score or stat. It is transient — it resets on startup and is not stored in `data.json`.
- **Synonyms to avoid:** `emotion`, `state`, `status`, `feeling` — use `mood` in code and docs.
- **Bounded context:** companion
- **Code name:** `Mood` (enum): `IDLE | HAPPY | SAD | TALKING | SLEEPING`; `mood: Mood` field on `Buddy`
- **Related terms:** MoodState, BuddyTemplate, AnimationLoop
- **Example:** "When a phrase is being generated, the Buddy's Mood transitions from IDLE to TALKING."

---

## MoodState
- **Definition:** The lowercase string key used to index animation frames in a BuddyTemplate. Mirrors the `Mood` enum but is used as an object key rather than an enum value.
- **NOT:** The same as `Mood` — `Mood` is the runtime enum; `MoodState` is the template key type.
- **Synonyms to avoid:** Do not conflate with `Mood`. Use `MoodState` only when referring to template frame keys.
- **Bounded context:** companion
- **Code name:** `MoodState` (type): `"idle" | "happy" | "sad" | "talking" | "sleeping"`
- **Related terms:** Mood, BuddyTemplate
- **Example:** `template.frames["talking"]` uses a `MoodState` key to retrieve the talking frame array.

---

## Talent
- **Definition:** A short, AI-generated string describing the Buddy's dev specialization. Always developer-related and specific (e.g. "Rust borrow checker whisperer", "vim escape artist"). It personalizes phrase generation — the AIProvider references it in the system prompt.
- **NOT:** A game mechanic, stat, or skill level. It is purely descriptive and used for personality flavor.
- **Synonyms to avoid:** `skill`, `specialty`, `role`, `class` — use `talent` in code and docs.
- **Bounded context:** companion
- **Code name:** `talent: string` field on `Buddy` and `BuddyMetadata`
- **Related terms:** BuddyMetadata, AIProvider, PhraseContext
- **Example:** "The Buddy's talent is 'TypeScript purist', so the Gemini adapter includes it in the system prompt to generate type-system jokes."

---

## Phrase
- **Definition:** A single line of text that the Buddy "says" — displayed in the speech bubble. Either AI-generated (via AIProvider) or pulled from the fallback store when offline. Always dev-themed, always ≤ 120 characters.
- **NOT:** A conversation, a multi-turn dialogue, or a stored message thread. Each phrase is independent and stateless.
- **Synonyms to avoid:** `message`, `quote`, `response`, `text` — use `phrase` in code and docs.
- **Bounded context:** companion
- **Code name:** `phrase: string` (in use cases and TUI); `phraseHistory: string[]` on `BuddyRecord`
- **Related terms:** PhraseContext, PhraseType, AIProvider, SpeechBubble
- **Example:** "The Buddy's latest phrase: 'Your undefined is not a function. My undefined is a lifestyle.'"

---

## PhraseContext
- **Definition:** A value object passed to `AIProvider.generatePhrase()`. Contains everything the AI needs to generate a contextually appropriate phrase: the buddy's name, talent, description, and the requested phrase type.
- **NOT:** A session context or application context. It is scoped entirely to a single phrase generation request.
- **Bounded context:** companion
- **Code name:** `PhraseContext` (interface/type): `{ buddyName, buddyTalent, buddyDescription, phraseType }`
- **Related terms:** AIProvider, PhraseType, Phrase, Talent
- **Example:** `{ buddyName: "Crash", buddyTalent: "null pointer survivor", phraseType: PhraseType.SARCASTIC }`

---

## PhraseType
- **Definition:** An enum that tells the AI what tone to use when generating a phrase. Rotates across the set to provide variety.
- **Bounded context:** companion
- **Code name:** `PhraseType` (enum): `MOTIVATIONAL | SARCASTIC | WISE | FUNNY | ROAST`
- **Related terms:** PhraseContext, AIProvider
- **Example:** `PhraseType.ROAST` produces phrases like "That's not spaghetti code, that's lasagna — layers of bad decisions."

---

## BuddyMetadata
- **Definition:** A value object returned by `AIProvider.generateBuddyMetadata()`. Contains the AI-generated `name`, `description`, and `talent` for a newly created Buddy. It is ephemeral — used once during `CreateBuddyUseCase` and then written into the Buddy entity.
- **NOT:** A Buddy record. It has no id, no mood, no persistence.
- **Bounded context:** companion
- **Code name:** `BuddyMetadata` (interface/type): `{ name: string, description: string, talent: string }`
- **Related terms:** AIProvider, Buddy, CreateBuddyUseCase
- **Example:** `{ name: "Segfault", description: "A grizzled C++ veteran who has seen things.", talent: "manual memory management" }`

---

## Active Buddy
- **Definition:** The single Buddy currently designated as the TUI session's companion. Stored as `activeBuddyId` in `data.json`. On startup, the active buddy is auto-loaded. Only one buddy can be active at a time.
- **NOT:** A "currently running" or "online" buddy — the concept is persistent, not session-scoped.
- **Synonyms to avoid:** `current buddy`, `selected buddy`, `default buddy` — use "active buddy" in docs, `activeBuddyId` in code.
- **Bounded context:** companion
- **Code name:** `activeBuddyId: string | null` in storage; `getActive()` / `setActive()` on `BuddyRepository`
- **Related terms:** Buddy, BuddyRepository
- **Example:** "Running `ascii-buddy --list` and pressing Enter sets the highlighted buddy as the new active buddy."

---

## AIProvider
- **Definition:** The domain port (interface) for all AI operations. Defines the contract that any AI backend must implement: `generatePhrase(ctx)` and `generateBuddyMetadata()`. The domain never imports a concrete adapter.
- **NOT:** The Gemini SDK, an HTTP client, or any concrete implementation. It is a pure TypeScript interface in the domain layer.
- **Synonyms to avoid:** `LLMClient`, `GeminiClient`, `AIService` — use `AIProvider` for the port, `GeminiAdapter` for the concrete implementation.
- **Bounded context:** companion
- **Code name:** `AIProvider` (interface in `src/domain/ports/ai-provider.ts`)
- **Related terms:** GeminiAdapter, PhraseContext, BuddyMetadata
- **Example:** "The `CreateBuddyUseCase` depends on `AIProvider`, not `GeminiAdapter` — swapping the AI backend requires zero domain changes."

---

## BuddyRepository
- **Definition:** The domain port (interface) for Buddy persistence. Defines storage operations: `save`, `findById`, `findAll`, `setActive`, `getActive`. The domain never imports a concrete adapter.
- **NOT:** A database ORM, a file system module, or any concrete implementation.
- **Synonyms to avoid:** `BuddyStore`, `BuddyDAO`, `BuddyStorage` — use `BuddyRepository` for the port, `LocalStorageAdapter` for the concrete implementation.
- **Bounded context:** companion
- **Code name:** `BuddyRepository` (interface in `src/domain/ports/buddy-repository.ts`)
- **Related terms:** LocalStorageAdapter, Buddy, Active Buddy
- **Example:** "The `LoadBuddyUseCase` calls `buddyRepository.getActive()` — it has no knowledge of JSON files."

---

## Frame
- **Definition:** A single string representing one rendered state of a buddy's ASCII art. Frames are played in sequence by the AnimationLoop to produce animation. Each frame is a multi-line string (newline-separated rows).
- **NOT:** A video frame or a UI component frame (no relation to web/app "frame" concepts).
- **Bounded context:** companion
- **Code name:** `frame: string` element in `BuddyTemplate.frames[moodState]: string[]`
- **Related terms:** BuddyTemplate, MoodState, AnimationLoop
- **Example:** The `crash` template's `idle` array has 2 frames: eyes-open and blink.

---

## AnimationLoop
- **Definition:** The TUI-layer mechanism (a `setInterval` wrapper) that steps through a BuddyTemplate's frame array for the current Mood and re-renders the buddy box on each tick.
- **NOT:** A domain concept — it lives in `src/ui/`. Listed here because it is referenced across layers.
- **Bounded context:** companion (UI layer)
- **Code name:** `AnimationLoop` (class in `src/ui/animation-loop.ts`)
- **Related terms:** Frame, Mood, BuddyTemplate, CompanionScreen
- **Example:** "The AnimationLoop runs at 1 fps in IDLE mood and steps up to 4 fps when Mood is TALKING."
