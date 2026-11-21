# Core calendar engine

## Current behavior (verified after ISS-019)

### Dataset

- File: `src/constants/calendar-data.ts`
- Years **2000–2099**, contiguous (100 entries) — structural tests enforce this
- Entry: `[number[12] /* days per month */, number /* total days */]`
- Year totals equal `sum(month lengths)` for every year
- SHA-256 fingerprint (serialized table): `f9c4b277303e8f909532f95312f7eaaf929b37a7ff0c124f9fe494cd6f7bb29f`
- **Provenance:** unknown (ISS-016) — no upstream citation in git/docs

### Reference epoch

```
REF_BS = { year: 2000, month: 1, day: 1 }
REF_AD = new Date(1943, 3, 14)  // local timezone constructor — ISS-002
```

Documented: **2000-01-01 BS == 1943-04-14 AD**.

### Algorithms and assumptions

**AD → BS** (`converters/ad-to-bs.ts`)

1. Normalize to Y/M/D via **local** `Date` getters or `[y,m,d]` (1-based month).
2. `validateAdDate` (min AD year 1943).
3. Day delta vs `REF_AD` using `Math.round((t2-t1)/86400000)`.
4. Walk forward/backward **one BS day at a time** using `getDaysInMonth`.

Assumptions: local civil fields; table covers the walked years; ms-based day diff matches calendar days when both `Date`s are local midnights.

**Status:** Golden AD→BS fixtures (New Years, leap day, REF) **match** dataset-implied / agreeing public sources.

**BS → AD** (`converters/bs-to-ad.ts`)

1. Parse object/array; `validateBsDate`.
2. `daysBetweenBS(REF_BS, target)` via absolute day indices (see below).
3. `new Date(REF_AD)` then `setDate(getDate() + daysDiff)`.

**`daysBetweenBS` (ISS-019 corrected)**

```
daysFromRefBs(date) =
  sum(year totals for y in [REF_BS.year .. date.year))
  + sum(month lengths for m in [1 .. date.month))
  + (date.day - REF_BS.day)

daysBetweenBS(a, b) = daysFromRefBs(b) - daysFromRefBs(a)
```

Semantics: exclusive day difference (`b − a`). Same calendar day → 0; adjacent days → 1. No month-cursor rollover; no full-month over-count past month 12.

Assumptions: local `setDate` preserves civil arithmetic (timezone matrix still Step 5 / ISS-002).

**Status:** Goldens pass; exhaustive BS→AD→BS **36525 / 36525** zero failures.

### Correctness layers (do not conflate)

| Layer | Meaning | After ISS-019 |
|-------|---------|---------------|
| Structural integrity | Table internally consistent | Pass |
| Golden accuracy | Matches sourced civil pairs | AD→BS + BS→AD pass (dataset-implied / agreeing sources) |
| Round-trip consistency | Invertible on this table | **36525 / 36525** |

Round-trips ≠ historical proof of the table (ADR-003). ISS-016 provenance remains open — one-day disagreements with some public New Year tables stay documented, not silently “verified.”

### Verified correctness issues

| ID | Issue | Status |
|----|-------|--------|
| ISS-001 | Wrong validation index into calendar tuple | **Resolved** |
| ISS-002 | Local `Date` / timezone sensitivity | Open (Step 5) |
| ISS-003 | AD→BS O(days) walk | Open (Step 6; after Step 5) |
| ISS-004 | No max AD bound tied to BS 2099 | Open |
| ISS-016 | Dataset provenance unknown | Open (investigated) |
| ISS-019 | `daysBetweenBS` over-count | **Resolved** |

## Accepted v2 core responsibilities (ADR-002, ADR-003)

1. **Date-only types** — `CalendarDate` `{ year, month, day }`.
2. **Converters** — pure functions over date-only inputs.
3. **Legacy `Date` adapters** — v1 local-field semantics; explicit UTC API only if added deliberately.
4. **Validation** — correct month-length lookup.
5. **Arithmetic** — correct day counts (**ISS-019 fixed**).
6. **Integrity** — checksum + structural tests; provenance honest.

## Non-negotiables

- Do not replace/extend dataset without approval.
- Do not optimize (prefix sums) until timezone verification (Step 5) is complete and goldens remain green.
- Fail loudly on unsupported inputs.
