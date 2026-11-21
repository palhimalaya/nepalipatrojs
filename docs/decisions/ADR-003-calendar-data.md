# ADR-003: Calendar dataset and reference epoch

- **Date:** 2026-11-21
- **Status:** Accepted
- **Phase:** 0
- **Accepted:** 2026-11-21 (after amendment: provenance, integrity, test depth, accuracy caveat)

## Context

BS is not a fixed leap rule like Gregorian; libraries rely on published month-length tables. This repo embeds 2000–2099 with reference `2000-01-01 BS = 1943-04-14 AD`. Existing conversion tests assert known pairs (e.g. 2022-01-01 AD → 2078-09-17 BS).

**Accuracy caveat:** Round-trip and structural tests prove **algorithmic consistency with this dataset**. They do **not** independently prove that the table is historically authoritative.

## Decision history

1. **Proposed (2026-11-21):** Preserve dataset and reference; integrity tests; optimize only after goldens.
2. **Amended & accepted (2026-11-21):** Add provenance documentation (if known), checksum/integrity mechanism, exhaustive structural + round-trip + range tests; no replace/extend/regenerate in Phase 1 without separate approval.

## Decision (accepted)

1. **Preserve** the existing `BS_CALENDAR_DATA` and reference pair:
   - `2000-01-01 BS` = `1943-04-14 AD`
2. **Do not** replace, extend, or regenerate the dataset during Phase 1 without separate maintainer approval.
3. Document **dataset provenance and source** if discoverable (git history, upstream libs, government tables). If unknown, record **“provenance unknown”** explicitly and track as an open issue — do not invent a source.
4. Add a **checksum or equivalent integrity mechanism** (e.g. hash of serialized month lengths + reference pair) verified in tests.
5. **Structural validation** for every year in range:
   - Contiguous years matching `MIN_BS_YEAR`…`MAX_BS_YEAR`
   - Exactly 12 month lengths per year
   - `totalDays === sum(monthLengths)`
6. **Golden conversion fixtures** for known pairs (including reference epoch).
7. **Exhaustive round-trip tests** over the supported range (or a clearly justified dense sample strategy if full exhaustiveness is too slow — document the choice; prefer full exhaustiveness when feasible).
8. Tests for **first and last supported dates** and **explicit unsupported-range behavior** (throw / documented error — never invent dates).
9. Optimization (prefix sums / day indexes) is allowed **only after** goldens and round-trips pass against the **unchanged** dataset.

## Provenance (current knowledge)

| Item | Status |
|------|--------|
| Embedded table `src/constants/calendar-data.ts` | Present; 2000–2099 |
| Authoritative external citation in repo | **Not found** as of 2026-11-21 |
| Recorded status | **Provenance unknown** — see ISS-016 |

## Alternatives considered

| Alternative | Notes |
|-------------|-------|
| Replace with another library’s table | Risk of silent date shifts; requires separate approval + proof |
| Generate from astronomical model | Out of scope; civil BS tables are conventional |
| Extend beyond 2099 in Phase 1 | Rejected without separate data project approval |

## Consequences

- Phase 1 trusts and tests this dataset; it does not “validate history.”
- Extending the range or swapping tables is a separate decision with its own ADR/approval.
- Integrity checksum protects against accidental edits during refactors.
