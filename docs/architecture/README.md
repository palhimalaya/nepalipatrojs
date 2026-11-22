# Architecture

## Documents

| Doc | Status | Description |
|-----|--------|-------------|
| [system-overview.md](system-overview.md) | Phase 0 | Current v1 map + proposed v2 layout |
| [phase2-assessment.md](phase2-assessment.md) | Phase 2 | Module boundaries assessment + Stage 2.x progress |
| [boundary-rules.md](boundary-rules.md) | Stage 2.5 | Enforceable dependency rules + commands |
| [exceptions-stage25.md](exceptions-stage25.md) | Stage 2.5 | Ownership exceptions (proposed moves, not applied) |
| [core-engine.md](core-engine.md) | Phase 0–2 | Conversion, validation, date-only model, helper split |
| [datepicker-architecture.md](datepicker-architecture.md) | Phase 0 | Modular UI plan (high level) |
| [phase3-datepicker-assessment.md](phase3-datepicker-assessment.md) | Phase 3.0 | Behavior inventory, contract, UX + module spec |
| [phase4-hardening-assessment.md](phase4-hardening-assessment.md) | Phase 4 | Integration & quality hardening assessment (no code) |
| [phase4-browser-smoke-results.md](phase4-browser-smoke-results.md) | Phase 4.2 | Real-browser smoke B1–B8 + geometry measurements |
| [phase4-accessibility-results.md](phase4-accessibility-results.md) | Phase 4.3 | Manual a11y — keyboard/ARIA; SR speech gaps |
| [localization.md](localization.md) | Phase 0 | Locales, digits, formatting |
| [packaging.md](packaging.md) | Phase 0 | Build, exports, types, CI |

## Guiding decision (Accepted)

**Modular single package** (`nepalipatrojs`) with clear internal modules and optional export path `nepalipatrojs/react`. Defer a multi-package monorepo until multiple independently versioned packages are needed.

Core: date-only APIs, no DOM/React. Legacy `Date` wrappers keep v1 local-field semantics (ADR-002). Dataset preserved (ADR-003).

See [ADR-001](../decisions/ADR-001-core-architecture.md) and [DECISIONS.md](../progress/DECISIONS.md).
