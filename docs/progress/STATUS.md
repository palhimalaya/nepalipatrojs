# Project status

**Last updated:** 2026-11-21  
**Current published version:** 1.0.5  
**Target version:** 2.0.0  
**Current phase:** Phase 0 — COMPLETED (ADRs accepted)  
**Overall:** Architecture approved; **Phase 1 not started** — awaiting explicit maintainer authorization to implement

## Completion (task-based, not LOC estimates)

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Audit + docs + ADR acceptance | COMPLETED | Docs only; all five ADRs Accepted |
| 1 Core correctness | NOT STARTED | Unblocked architecturally; needs formal go-ahead |
| 2 Architecture | NOT STARTED | |
| 3 Datepicker | NOT STARTED | |
| 4 React | NOT STARTED | |
| 5 Packaging/CI | NOT STARTED | |
| 6 Docs site / playground | NOT STARTED | |
| 7 Final verification | NOT STARTED | |

Rough overall modernization progress: **~10%** (Phase 0 fully closed including ADR acceptance; no implementation).

## In progress

- None. Documentation amendment session closed.

## Blocked

| Blocker | Needed |
|---------|--------|
| Phase 1 code | Explicit maintainer authorization to begin implementation sequence |

## ADR status

| ADR | Status |
|-----|--------|
| 001 Core architecture | Accepted |
| 002 Date-only / timezone | Accepted (amended) |
| 003 Calendar dataset | Accepted (amended) |
| 004 Datepicker | Accepted |
| 005 Public API | Accepted (amended) |

## Outstanding issues

See [ISSUES.md](ISSUES.md). New from ADR amendments: **ISS-016** (dataset provenance unknown), **ISS-017** (v1 API inventory freeze), **ISS-018** (module boundary enforcement).

Critical implementation targets remain: ISS-001, ISS-006, ISS-008, ISS-009, ISS-010.

## Latest verification

Unchanged from Phase 0 audit — no new test runs this amendment session.

| Check | Result |
|-------|--------|
| Unit tests | NOT RUN (`node_modules` absent) |
| Implementation files | Unchanged (docs-only session) |

## Next recommended actions (after authorization)

1. `npm ci` — baseline tests, build, typecheck; record in TEST-RESULTS  
2. Fix ISS-001 (validation) + independent month-length regressions  
3. Fix ISS-006 (formatter tokens)  
4. Golden fixtures, round-trips, timezone tests for date-only APIs  
5. Only then begin core refactoring / optimization  

## Documentation updated this milestone

- All five ADRs → Accepted (+ amendments)
- `DECISIONS.md`, `STATUS.md`, `MASTER-PLAN.md`, `ISSUES.md`, `CHANGELOG.md`
- `PROJECT_CONTEXT.md`, architecture notes, session log
