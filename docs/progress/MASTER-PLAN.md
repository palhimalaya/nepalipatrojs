# Master plan — NepaliPatroJS 2.0

Overall status: **IN PROGRESS** (Phases 0–3 CLOSED; Phase 4 **assessment COMPLETED** — impl not authorized)

## Phase overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Repository audit & documentation bootstrap | **COMPLETED** / CLOSED |
| 1 | Core correctness | **COMPLETED** / CLOSED |
| 2 | Architecture / module boundaries | **COMPLETED** / CLOSED |
| 3 | Datepicker redesign | **COMPLETED** / CLOSED (2026-11-22) |
| 4 | Integration & quality hardening | **Assessment DONE** — impl stages await auth |
| 5 | Build, packaging, CI | NOT STARTED (after 4.x evidence / maintainer call) |
| 6 | Documentation site & playground | NOT STARTED |
| 7 | Final verification | NOT STARTED |
| — | Framework integration (React) | Deferred — revisit after hardening |

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

**Status:** IN PROGRESS  
**Authorized:** 2026-11-21  
**Objective:** Establish baseline, fix critical correctness bugs, prove conversion against unchanged dataset, introduce date-only APIs — **before** optimization/refactor deep cuts.

### Authorized sequence

1. ~~`npm ci` + baseline tests/build/typecheck → TEST-RESULTS~~ **DONE 2026-11-21**
2. ~~Fix ISS-001 (BS validation) + independent month-length regressions~~ **DONE 2026-11-21**
3. ~~Fix ISS-006 (formatter token corruption)~~ **DONE 2026-11-21**
4. ~~Golden fixtures, integrity, round-trips~~ **DONE 2026-11-21** (discovered ISS-019; converters not rewritten)
5. ~~Fix ISS-019 `daysBetweenBS`~~ **DONE 2026-11-21** (absolute day index; 36525/36525 round-trips)
6. ~~Timezone verification~~ **DONE 2026-11-21** (date-only TZ matrix + legacy local semantics)
7. ~~Algorithm assessment~~ **DONE 2026-11-21**
8. ~~ISS-003 prefix AD→BS~~ **DONE 2026-11-21** (approved; benchmark caveat documented)
9. ~~Phase 2 architecture assessment~~ **DONE 2026-11-21**
10. ~~Phase 2 Stage 2.0 API inventory~~ **DONE 2026-11-21** (ISS-017)
11. ~~Phase 2 Stage 2.1 break cycle~~ **DONE 2026-11-21** (ISS-020)
12. ~~Phase 2 Stage 2.2 datepicker core APIs only~~ **DONE 2026-11-22** (ISS-021)
13. ~~Phase 2 Stage 2.3 split core / i18n helpers~~ **DONE 2026-11-22**
14. ~~Phase 2 Stage 2.4 physical `core/` + `i18n/` folders~~ **DONE 2026-11-22**
15. ~~Phase 2 Stage 2.5 architecture boundary enforcement (ISS-018)~~ **DONE 2026-11-22**
16. ~~Phase 2 Stage 2.6 ownership cleanup~~ **DONE 2026-11-22**
17. ~~Phase 3 Step 3.0 datepicker assessment & redesign spec~~ **DONE 2026-11-22**
18. ~~Phase 3 Stage 3.1 state/grid extract + destroy fix~~ **DONE 2026-11-22** (ISS-022)
19. ~~Phase 3 Stage 3.2 safe DOM render (ISS-014)~~ **DONE 2026-11-22**
20. ~~Phase 3 Stage 3.3 Escape / keyboard / focus / ARIA~~ **DONE 2026-11-22**
21. ~~Phase 3 Stage 3.4 Positioning / z-index (ISS-012)~~ **DONE 2026-11-22**
22. ~~Phase 3 Stage 3.5 Today / constraints / disabled dates~~ **DONE 2026-11-22**
23. ~~Phase 3 Stage 3.6 Dual AD/BS display~~ **DONE 2026-11-22**
24. ~~Phase 3 Stage 3.7 Visual redesign / theme tokens~~ **DONE 2026-11-22**
25. ~~Phase 3 close-out~~ **CLOSED 2026-11-22** (maintainer approved)
26. ~~Phase 4 assessment~~ **DONE 2026-11-22** → [phase4-hardening-assessment.md](../architecture/phase4-hardening-assessment.md)
27. ~~Phase 4.1 docs sync + ISS-016 honesty~~ **DONE 2026-11-22**
28. ~~Phase 4.2 browser smoke B1–B8~~ **DONE 2026-11-22** → [phase4-browser-smoke-results.md](../architecture/phase4-browser-smoke-results.md)
29. ~~Phase 4.3 manual accessibility~~ **DONE 2026-11-22** → [phase4-accessibility-results.md](../architecture/phase4-accessibility-results.md)
30. ~~Phase 4.4 mobile sizing + ISS-026/027 contrast~~ **DONE / CLOSED 2026-11-22**
31. ~~ISS-025 nested-scroll positioning~~ **RESOLVED 2026-11-22**
32. Phase 5 packaging/CI assessment ← **recommended next**; not authorized

**Maintainer locks:** packaging changes → Phase 5; no `nepalipatrojs/core` deep export; no React / no CSS sizing without separate auth.

---

## Phase 2 — Architecture / module boundaries

**Status:** Stages 2.0–2.6 COMPLETED (Phase 2 architecture complete)  
**Docs:** [phase2-assessment.md](../architecture/phase2-assessment.md), [boundary-rules.md](../architecture/boundary-rules.md), [public-api-inventory.md](../api/public-api-inventory.md)

### Assessment / inventory

- [x] Module inventory and responsibilities
- [x] Import/dependency map + cycles
- [x] ADR-001–005 gap analysis
- [x] Violations, target structure, mapping, sequence, risks
- [x] Public API inventory frozen (ISS-017 / Stage 2.0)

### Implementation sequence

- [x] Stage 2.1 Break `index` ↔ `NepaliDatePicker` cycle (no public API change)
- [x] Stage 2.2 Datepicker uses core APIs only (no raw calendar-data)
- [x] Stage 2.3 Split helpers (core vs i18n) — `calendar.ts` / `localization.ts`; `helpers.ts` re-export shim
- [x] Stage 2.4 Physical `core/` + `i18n/` folders; `helpers.ts` removed; `ui/` retained
- [x] Stage 2.5 Boundary enforcement (ISS-018) — Jest graph/DOM/export checks + negative fixtures
- [x] Stage 2.6 Ownership cleanup — digits/names/i18n+ui types; facade re-exports
- [ ] Packaging/CI → **Phase 5**

### Tasks

- [x] Capture baseline verification (ISS-015) — recorded; suite green but bugs confirmed manually
- [x] Fix `validateBsDate` calendar-data indexing (ISS-001); replace incorrect tests with independent 12-month regressions
- [x] Fix formatter token expansion (ISS-006) via longest-first tokenization + `[literal]` escapes
- [x] Structural dataset tests + SHA-256 pin; provenance investigated → still unknown (ISS-016)
- [x] Golden conversion fixtures with sourced expectations; AD→BS matches; BS→AD gated by ISS-019
- [x] Exhaustive BS→AD→BS round-trips (~36.5k dates, ~22–32s); ~3090 failures documented (ISS-019)
- [x] **Fix ISS-019** `daysBetweenBS` — absolute day indices; goldens + 36525/36525; `.failing` removed
- [x] Introduce `CalendarDate` / date-only AD/BS APIs; `REF_AD_YMD`; pure Gregorian day numbers
- [x] Date-only conversion identical under `UTC`, `Asia/Kathmandu`, `America/Los_Angeles`
- [x] Preserve legacy `Date` APIs with **local** calendar-field semantics (ADR-002)
- [x] Algorithm assessment + benches (`scripts/bench-conversion.mjs`); recommend Option B/C for Ad→Bs
- [x] **ISS-003:** prefix-sum AD→BS (`bs-prefix.ts`); exhaustive oracle parity 36525; BS→AD untouched
- [ ] Unify locale `ne`/`np` (ISS-005) — deferred
- [ ] Document complete v1 public API inventory (ISS-017)

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

**Status:** **COMPLETED / CLOSED** (maintainer approved 2026-11-22)  
**Depends on:** Phase 2 + ADR-004; assessment review  
**Objective:** Modular, accessible, modern dual-calendar UI.  
**Spec:** [phase3-datepicker-assessment.md](../architecture/phase3-datepicker-assessment.md)

### Tasks

- [x] Step 3.0 — Behavior inventory, compatibility contract, UX + module spec
- [x] Stage 3.1 — Pure `state` + `grid`; destroy listener fix (ISS-022); date-only weekday
- [x] Stage 3.2 — Replace `innerHTML` with safe DOM construction (ISS-014)
- [x] Stage 3.3 — Escape, keyboard, focus, ARIA
- [x] Stage 3.4 — Positioning / z-index (no full-DOM scan) (ISS-012)
- [x] Stage 3.5 — Today, min/max, disabled dates
- [x] Stage 3.6 — Dual AD/BS display (equivalent AD; no AD grid)
- [x] Stage 3.7 — Visual design / theme tokens (`--np-*`)
- [x] Maintainer close-out review — all stages approved
- [ ] Rename `ui/` → `datepicker/` when appropriate (**deferred** — structural cleanup)

### Acceptance criteria

- [x] Feature checklist in ADR-004 / Phase 3.0 spec met (within agreed scope)
- [x] Datepicker tests cover selection, constraints, keyboard, cleanup
- [x] Visual review signed off by maintainer (Stage 3.7)
- [x] Public ctor / options / `destroy` / `setZIndex` compatibility preserved

### Carry-forward (not Phase 3 blockers)

- ISS-013 — keep open until real AT testing
- ISS-016 — dataset provenance before historical-accuracy claims
- ISS-024 — accepted (footer = focus, not hover)
- Real-browser visual / smoke verification — later testing stage
- Full AD grid / mode switch — explicitly out of Phase 3 scope

---

## Phase 4 — Integration and quality hardening

**Status:** **Assessment COMPLETED** (2026-11-22) — implementation stages **not authorized**  
**Depends on:** Phase 3 CLOSED  
**Doc:** [phase4-hardening-assessment.md](../architecture/phase4-hardening-assessment.md)  
**Objective:** Close release-readiness gaps (browser evidence, AT, docs, then packaging) without React or feature creep.

### Assessment deliverables

- [x] Prioritized report + risk register
- [x] Real-browser strategy + test matrix (B1–B8)
- [x] AT plan (A1–A4)
- [x] API/docs consistency gaps
- [x] ISS-016 provenance risks
- [x] Package/CI inspection (no code changes)
- [x] Five responsive/hit-target checks documented
- [x] Recommended implementation sequence 4.1 → 5.x

### Implementation stages

- [x] **4.1** Consumer docs sync (README/QUICK_START) + ISS-016 honesty — docs only (**DONE 2026-11-22**)
- [x] **4.2** Browser smoke B1–B8 + responsive measures (**DONE 2026-11-22**)
- [x] **4.3** Manual accessibility — keyboard/ARIA-DOM; SR speech NOT TESTED (**DONE 2026-11-22**)
- [x] **4.4** Mobile sizing + ISS-026/027 contrast (**DONE 2026-11-22**) — desktop 42 keep; mobile 44; popup 344; AD/selected contrast fixed
- [x] ISS-025 nested scroll reposition (**RESOLVED 2026-11-22**)
- [ ] Human SR session (NVDA/VoiceOver) before accessibility release claims (ISS-013)
- [ ] Hand off packaging fixes → **Phase 5** (ISS-008/009/010)

### Responsive / hit-target (4.2 → 4.4)

| Check | 4.2 | 4.4 |
|-------|-----|-----|
| Desktop day | 42×42 | **42×42** (unchanged) |
| Mobile day | 38×38 | **44×44** |
| Weekday | 10px | **12px** |
| AD subtitle | 9px mobile | **11px** |
| Mobile popup | 292 | **344** (required for 44px grid; fits 390; `max-width: calc(100vw - 16px)`) |

### Explicit non-goals until authorized

- No React; no packaging/CI code changes; no dataset replacement; no AD grid; no `ui/` rename; no CSS until 4.4 auth

### Deferred: React integration

Revisit only after vanilla package + public API are stable. Core must remain React-free.

---

## Phase 5 — Build, packaging, CI

**Status:** NOT STARTED (priority subject to Phase 4 assessment)  
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
