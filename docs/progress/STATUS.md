# Project status

**Last updated:** 2026-11-22  
**Current published version:** 1.0.5  
**Target version:** 2.0.0  
**Current phase:** Phase 2 — Stage 2.3 **COMPLETED** (await review)  
**Phase 0 / 1:** CLOSED  

## Completion

| Phase / step | Status |
|--------------|--------|
| Phase 2 Stages 2.0–2.2 | COMPLETED |
| Phase 2 Stage 2.3 — Split core / i18n helpers | **COMPLETED** (await review) |
| Stage 2.4 — Physical module restructuring | NOT STARTED ← next |
| Stage 2.5 — Architecture boundary tests | NOT STARTED |
| Phase 5 packaging | Deferred |

## Latest verification (Stage 2.3)

| Check | Result |
|-------|--------|
| Full Jest | **176/176** (~33s) |
| `tsc --noEmit` | PASS |
| `npm run build` | PASS |
| Core (`calendar.ts`) ↛ i18n/DOM | PASS |
| `localization.ts` ↛ calendar helpers / DOM | PASS |
| Public API compat | PASS |
| Round-trips (36,525) | PASS |

## Next exact task

**Phase 2 Stage 2.4 — physical `core/` + `i18n/` module restructuring** — await authorization.  
Do not start automatically.
