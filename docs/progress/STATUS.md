# Project status

**Last updated:** 2026-11-22  
**Current published version:** 1.0.5  
**Target version:** 2.0.0  
**Current phase:** Phase 2 — Stage 2.4 **COMPLETED** (await review)  
**Phase 0 / 1:** CLOSED  

## Completion

| Phase / step | Status |
|--------------|--------|
| Phase 2 Stages 2.0–2.3 | COMPLETED |
| Phase 2 Stage 2.4 — Physical core / i18n restructuring | **COMPLETED** (await review) |
| Stage 2.5 — Architecture boundary enforcement | NOT STARTED ← next (ISS-018) |
| Phase 5 packaging | Deferred |

## Latest verification (Stage 2.4)

| Check | Result |
|-------|--------|
| Full Jest | **178/178** (~29s) |
| `tsc --noEmit` | PASS |
| `npm run build` | PASS |
| Public API compat + UMD smoke | PASS |
| core/ ↛ i18n/ui/DOM | PASS |
| i18n/ ↛ ui/DOM | PASS |
| Round-trips (36,525) | PASS |
| TZ matrix (UTC / Asia/Kathmandu / America/Los_Angeles) | PASS |
| Package entry points unchanged | PASS |

## Next exact task

**Phase 2 Stage 2.5 — architecture boundary enforcement (ISS-018)** — await authorization.  
Do not start automatically.
