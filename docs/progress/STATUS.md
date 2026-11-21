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
| Phase 1 Steps 1–5 | COMPLETED (approved) |
| Phase 1 — ISS-019 | COMPLETED (approved) |
| Phase 1 Step 5 — Timezone | COMPLETED (approved) |
| Phase 1 Step 6 — Algorithm assessment | **COMPLETED** (await review; **no code change**) |
| ISS-003 implementation (prefix Ad→Bs) | NOT STARTED — needs separate authorization |

## Latest verification (Step 6)

| Check | Result |
|-------|--------|
| Assessment doc | [algorithm-assessment-step6.md](./algorithm-assessment-step6.md) |
| Bench command | `node scripts/bench-conversion.mjs` |
| Production converters | **unchanged** |
| Recommendation | Optimize AD→BS with prefix sums (B/C); keep BS→AD; do not implement yet |

## Still open

- **ISS-016** dataset provenance
- **ISS-003** implementation (assessed; awaiting auth)
- Packaging / datepicker / React — later phases

## Next exact task

Await maintainer decision on ISS-003 implementation.  
If approved: implement prefix-sum AD→BS only.  
If deferred: Phase 2 architecture (or next authorized item). **Do not implement without authorization.**
