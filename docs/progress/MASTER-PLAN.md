# Master plan — NepaliPatroJS 2.0

Overall status: **IN PROGRESS** (Phase 0 completed; ADRs Accepted; Phase 1 awaiting authorization)

## Phase overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Repository audit & documentation bootstrap | **COMPLETED** (incl. ADR acceptance 2026-11-21) |
| 1 | Core correctness | NOT STARTED (architecturally unblocked) |
| 2 | Architecture / module boundaries | NOT STARTED |
| 3 | Datepicker redesign | NOT STARTED |
| 4 | Framework integration (React) | NOT STARTED |
| 5 | Build, packaging, CI | NOT STARTED |
| 6 | Documentation site & playground | NOT STARTED |
| 7 | Final verification | NOT STARTED |

---

## Phase 0 — Repository audit & documentation bootstrap

**Status:** COMPLETED  
**Objective:** Verify the repo; propose architecture; bootstrap permanent docs. **No production code changes.**

### Tasks

- [x] Inventory source, tests, package, CI, dist, examples
- [x] Verify calendar range and reference epoch against dataset
- [x] Verify packaging/types/CSS mismatches
- [x] Document public API and dependency map
- [x] Record verified bugs in ISSUES.md
- [x] Propose ADRs 001–005
- [x] Create PROJECT_CONTEXT + docs tree
- [x] Write STATUS, MASTER-PLAN, session log
- [x] Maintainer ADR review → amend 002/003/005; accept all five ADRs

### Acceptance criteria

- [x] Audit written and linked from PROJECT_CONTEXT
- [x] Proposed architecture recorded (single package modular)
- [x] Roadmap with acceptance criteria exists
- [x] No silent source refactors in this phase (only `.gitignore` exception for docs logs)
- [x] All five ADRs Accepted with amendments recorded

### Documentation requirements

- [x] PROJECT_CONTEXT.md, architecture/*, decisions/*, progress/*

---

## Phase 1 — Core correctness

**Status:** NOT STARTED  
**Depends on:** Explicit maintainer authorization to implement (ADRs Accepted 2026-11-21)  
**Objective:** Establish baseline, fix critical correctness bugs, prove conversion against unchanged dataset, introduce date-only APIs — **before** optimization/refactor deep cuts.

### Authorized sequence (when Phase 1 starts)

1. `npm ci` + baseline tests/build/typecheck → TEST-RESULTS  
2. Fix ISS-001 (BS validation) + independent month-length regressions  
3. Fix ISS-006 (formatter token corruption)  
4. Golden fixtures, boundaries, round-trips, timezone tests (date-only)  
5. Begin core refactoring only after baseline correctness is understood  

### Tasks

- [ ] Capture baseline verification (ISS-015)
- [ ] Document complete v1 public API inventory (ISS-017) before any export removals
- [ ] Record dataset provenance status / checksum plan (ISS-016; ADR-003)
- [ ] Add golden conversion fixtures (reference + month/year boundaries) **before** algorithm changes
- [ ] Structural dataset tests (12 months, totals, contiguous years, checksum)
- [ ] Fix `validateBsDate` calendar-data indexing (ISS-001); fix tests that encode the bug
- [ ] Introduce `CalendarDate` / date-only AD/BS types; store REF_AD as plain YMD
- [ ] Date-only conversion identical under multiple `TZ` values
- [ ] Preserve legacy `Date` APIs with **local** calendar-field semantics (ADR-002); document; optional explicit UTC API later
- [ ] Fix formatter token expansion (ISS-006); unify locale `ne`/`np` (ISS-005)
- [ ] Exhaustive (or documented dense) round-trips; first/last supported dates; unsupported-range errors
- [ ] Optional: prefix-sum day index — **only if** goldens pass; separate approval not required if dataset unchanged, but do not start until goldens exist

### Acceptance criteria

- Baseline failures recorded honestly before fixes
- All new/updated conversion + validation + format tests pass
- Date-only APIs identical under at least `UTC`, `Asia/Kathmandu`, and one US timezone
- Legacy `Date` local-field semantics preserved and documented
- No calendar dataset changes (ADR-003)
- Round-trip consistency treated as algorithmic proof only — not historical accuracy claim
- ISS-001, ISS-006 fixed; ISS-005 addressed; ISS-002 partially addressed via date-only path
- Build + typecheck green (or failures documented if tooling still broken — packaging may span Phase 5)

### Testing requirements

- Conversion goldens; round-trips; invalid dates; range edges; leap Gregorian Feb 29
- Timezone matrix for **date-only** APIs
- Formatter regression for Mangsir + Budhabar token cases
- Dataset structural + checksum tests

### Documentation requirements

- Update core-engine.md, localization.md, ISSUES, TEST-RESULTS, STATUS, session log, CHANGELOG

---

## Phase 2 — Architecture

**Status:** NOT STARTED  
**Depends on:** Phase 1  
**Objective:** Restructure modules; remove circular deps; stabilize internal boundaries without breaking public API surface unnecessarily.

### Tasks

- [ ] Move core/i18n into module folders
- [ ] Stop datepicker importing from barrel `index`
- [ ] Deduplicate month-length / validation helpers
- [ ] Tighten exports (public vs internal)
- [ ] Keep repo buildable throughout

### Acceptance criteria

- No circular dependencies in module graph
- Core has zero DOM/React imports
- Existing public imports still work via compatibility barrel
- Tests reorganized or updated and passing

---

## Phase 3 — Datepicker redesign

**Status:** NOT STARTED  
**Depends on:** Phase 2 + ADR-004 approval  
**Objective:** Modular, accessible, modern dual-calendar UI.

### Tasks

- [ ] Split modules (state, parse, grid, render, position, a11y, theme)
- [ ] New light/dark visual design
- [ ] Dual AD/BS viewing; today/clear; min/max/disabled
- [ ] Keyboard + ARIA; Escape; multi-instance; destroy safety
- [ ] Configurable z-index / positioning — **no** full-DOM scan
- [ ] Prefer safe DOM construction

### Acceptance criteria

- Feature checklist in ADR-004 / architecture doc met
- Datepicker tests cover selection, constraints, keyboard, cleanup
- Visual review signed off by maintainer

---

## Phase 4 — React integration

**Status:** NOT STARTED  
**Depends on:** Phase 3 APIs stable  
**Objective:** First-class React component without coupling core to React.

### Acceptance criteria

- Controlled/uncontrolled, onChange, locale, theme, calendar system, min/max, disabled
- Core remains React-free
- Basic React tests (Testing Library) pass

---

## Phase 5 — Build, packaging, CI

**Status:** NOT STARTED  
**Objective:** Correct exports, real `.d.ts`, failing CI on errors, pack smoke test.

### Acceptance criteria

- ISS-008, ISS-009, ISS-010 resolved
- `continue-on-error` removed from critical jobs
- `npm pack` install smoke verifies exports
- Publish workflow only ships verified artifacts

---

## Phase 6 — Documentation & playground

**Status:** NOT STARTED  
**Objective:** User docs, migration guide completion, interactive playground.

---

## Phase 7 — Final verification

**Status:** NOT STARTED  
**Objective:** Full suite, typecheck, build, smoke, compatibility pass; release readiness checklist.

---

## Out of scope (unless reopened)

- Replacing BS dataset wholesale
- Festival/tithi/holiday calendars
- Vue integration (deferred)
- Multi-package npm publish graph
