# Project status

**Last updated:** 2026-11-21  
**Current published version:** 1.0.5  
**Target version:** 2.0.0  
**Current phase:** Phase 1 — Core correctness — **IN PROGRESS**  
**Phase 0:** CLOSED  

## Completion

| Phase / step | Status |
|--------------|--------|
| Phase 0 | COMPLETED |
| Phase 1 Step 1 — Baseline | COMPLETED |
| Phase 1 Step 2 — ISS-001 | COMPLETED (approved) |
| Phase 1 Step 3 — ISS-006 | COMPLETED (approved) |
| Phase 1 Step 4 — Conversion correctness baseline | COMPLETED (accepted with finding ISS-019) |
| Phase 1 — ISS-019 fix (BS→AD arithmetic) | **COMPLETED** (await maintainer review) |
| Phase 1 Step 5 — Timezone verification | NOT STARTED ← next (after ISS-019 acceptance) |
| Phase 1 Step 6 — Algorithm assessment | NOT STARTED (blocked until Step 5 done / authorized) |

## Latest verification (after ISS-019)

| Check | Result |
|-------|--------|
| Conversion integrity / goldens / round-trip | **PASS** — 36525/36525 zero failures; no `.failing` gates |
| Focused arithmetic + goldens | PASS |
| `npm test -- --runInBand` | PASS — **131/131** (~24–33s) |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |

## Critical discovery resolved

**ISS-019:** `daysBetweenBS` over-count fixed via absolute day-index arithmetic. BS→AD goldens and exhaustive round-trips green. Dataset / REF / public API unchanged.

**Still open:** ISS-016 (dataset provenance unknown) — do not treat dataset-implied New Years as independently verified when external sources disagree.

## Next exact task

**Phase 1 Step 5 — Timezone verification** (await authorization). Do not start until ISS-019 is accepted.
