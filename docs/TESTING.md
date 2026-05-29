# Testing Strategy

## Testing Philosophy
Test behavior, not implementation. The domain layer (pure functions, value objects, use cases) is the highest-value test target — it has no I/O and tests run in microseconds. Infrastructure adapters are tested with integration tests against real storage and mocked AI responses. The TUI layer is not unit-tested; manual smoke testing covers it.

## Scope
### In Scope
- Domain entities and value objects (Buddy, BuddyTemplate, Mood transitions)
- Application use cases (LoadBuddy, CreateBuddy, GeneratePhrase, ListBuddies)
- Infrastructure adapters: LocalStorageAdapter (real filesystem, temp dir)
- AIProvider contract: GeminiAdapter tested with mocked HTTP responses
- CLI flag parsing and bootstrap logic

### Out of Scope
- neo-blessed rendering (terminal rendering is not testable in CI)
- Animation frame timing (depends on `setInterval`, flaky in test environments)
- Gemini API live calls (mocked at the HTTP layer)
- OS-specific terminal behavior

## Test Types & Tools
| Type        | Tool       | Notes |
|-------------|------------|-------|
| Unit        | Vitest     | Domain layer; fast, no I/O |
| Integration | Vitest     | Storage adapter with real temp dir; AI adapter with msw mocks |
| E2E         | Manual     | Run `npm start` and verify screens; no automated E2E |
| Performance | Manual     | Measure cold start time with `time npm start` |
| Security    | —          | No auth surfaces; API key handling reviewed in code review |

## Entry Criteria
- Domain model is stable (Buddy, Mood, ports defined)
- Storage schema is finalized
- CI pipeline runs on every PR

## Exit Criteria
- All unit tests pass
- Integration tests pass with temp storage dir
- Cold start measured < 3s on a mid-range machine
- Manual TUI smoke test passes on macOS and Linux

## Test Environment
| Environment | Purpose              | Storage         | External APIs |
|-------------|----------------------|-----------------|---------------|
| local       | Dev + unit tests     | Temp dir (`/tmp/ascii-buddy-test-*`) | mocked via msw |
| CI          | Gate on every PR     | Temp dir        | mocked via msw |

## Unit Test Patterns
- One `*.test.ts` file per domain file, co-located: `src/domain/buddy.test.ts`
- No mocks in pure domain tests — domain has no dependencies
- Use `describe` blocks matching the class/function name
- Test names: `"should <behavior> when <condition>"`
- Test factory helpers in `src/__tests__/factories/` for creating test Buddy instances

## Integration Test Scope
- `LocalStorageAdapter`: write → read → atomic overwrite → corruption recovery
- `GeminiAdapter`: mocked HTTP; verify correct prompt construction + response parsing
- `CreateBuddyUseCase`: full flow with mocked AI and real (temp) storage

## E2E Scenarios (Critical Paths)
- Cold start with no existing data → prompts for API key → creates first buddy
- Cold start with existing active buddy → buddy renders in < 3s
- `--list` flag with 3+ buddies → picker opens → arrow navigation → Enter selects
- `--new` flag → AI generates metadata → buddy saved → TUI opens with new buddy
- No network (API key set, Gemini unreachable) → fallback phrase shown, no crash

## Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| Flaky tests from filesystem side effects | Each test suite creates a unique temp dir; cleaned up in `afterEach` |
| msw HTTP mocks diverging from real Gemini API | Version-pin the Gemini SDK; re-verify mocks on SDK update |

## CI/CD Integration
- Runs on every PR via GitHub Actions
- Unit + integration tests are blocking
- Manual TUI test is documented in PR checklist (not blocking CI)

## How to Run Tests Locally
```bash
# Run all tests:
npm test

# Run unit tests only:
npm run test:unit

# Run with coverage report:
npm run test:coverage

# Run integration tests:
npm run test:integration
```
