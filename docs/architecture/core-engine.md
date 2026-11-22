# Core calendar engine

## Current behavior (verified after Phase 1 Step 5)

### Dataset

- File: `src/core/calendar-data.ts`
- Years **2000–2099**, contiguous (100 entries) — structural tests enforce this
- Entry: `[number[12] /* days per month */, number /* total days */]`
- Year totals equal `sum(month lengths)` for every year
- SHA-256 fingerprint (serialized table): `f9c4b277303e8f909532f95312f7eaaf929b37a7ff0c124f9fe494cd6f7bb29f`
- **Provenance:** unknown (ISS-016) — no upstream citation in git/docs

### Reference epoch

```
REF_BS     = { year: 2000, month: 1, day: 1 }          // date-only
REF_AD_YMD = { year: 1943, month: 4, day: 14 }         // date-only (canonical)
REF_AD     = new Date(1943, 3, 14)                     // legacy local midnight
REF_AD_JS_WEEKDAY = 3                                  // Wednesday (for weekday math)
```

Documented: **2000-01-01 BS == 1943-04-14 AD**.

### Date API audit (Step 5)

| Location | API | Role |
|----------|-----|------|
| `REF_AD` | `new Date(y,m-1,d)` | Legacy instant at local midnight of epoch — **calendar fields** used only as compatibility mirror of `REF_AD_YMD` |
| `convertADToBS(Date)` | `getFullYear` / `getMonth` / `getDate` | **Legacy:** extract local civil fields → date-only convert |
| `convertADToBS([y,m,d])` | array | **Civil date-only** (TZ-independent) |
| `convertAdToBs` / `convertBsToAd` | `CalendarDate` | **Date-only** — pure arithmetic, no `Date` |
| `convertBSToAD` | `new Date(y,m-1,d)` return | **Legacy wrapper:** civil result as local midnight `Date` |
| `getCurrentBSDate` / `now` | `new Date()` | **Instant → local civil** (inherently TZ-sensitive) |
| `formatBS` weekday | `getBsWeekdayIndex` | **Date-only** (no `Date.getDay`) |
| `validateAdDate` | `daysInGregorianMonth` | **Date-only** (no `new Date(y,m,0)`) |
| `daysBetweenAD` (removed) | was `getTime()/86400000` | Replaced by Gregorian day numbers |
| Datepicker grid | `getBsWeekdayIndex` (Phase 3) | Date-only weekday; no `Date.getDay()` for grid |
| Core converters | no ISO string parse | Objects / `[y,m,d]` only — avoids `YYYY-MM-DD` → UTC midnight shift |
| Datepicker input | regex `getDateFormatPatterns` | Parses digit groups to Y/M/D integers (not `Date.parse`) |

**Calendar date** = `{year,month,day}` civil triple. **Instant** = JavaScript `Date` timestamp.

### Algorithms

**Date-only AD → BS** (`convertAdToBs` + `bs-prefix.ts`, ISS-003)

1. Validate AD YMD (pure Gregorian month lengths).
2. `daysDiff = gregorianDayNumber(ad) − gregorianDayNumber(REF_AD_YMD)`.
3. If `daysDiff < 0` or past supported span → same `Year out of range` error as before.
4. Else `bsDateFromDayIndex(daysDiff)`:
   - **yearStart[101]** — cumulative days at each BS year start (+ total span)
   - **monthStart / monthLength** — 100×12 tables from `BS_CALENDAR_DATA`
   - Binary search year, then scan ≤12 months for day

**Complexity:** O(log years + months). **Memory:** ~5–6 KiB typed arrays (module init).  
**Perf (Step 7):** bulk 36,525 Ad→Bs ~9 ms (was ~22.9 s); late median ~0.15 µs (was ~1.26 ms). Distance sensitivity flat.

**Date-only BS → AD** (`convertBsToAd`) — **unchanged** (Step 7 scope)

1. Validate BS YMD.
2. `daysDiff = daysBetweenBS(REF_BS, bs)` (absolute BS day index — ISS-019).
3. `addGregorianDays(REF_AD_YMD, daysDiff)`.

**Legacy wrappers**

- `convertADToBS`: Date → local fields → `convertAdToBs`; array → `convertAdToBs`.
- `convertBSToAD`: `convertBsToAd` then `new Date(y, m-1, d)` (local construction).

### Correctness layers

| Layer | After Step 5 |
|-------|--------------|
| Structural integrity | Pass |
| Golden accuracy | AD↔BS pass (dataset-implied / agreeing sources) |
| Round-trip consistency | **36525 / 36525** |
| Timezone (date-only) | Identical under UTC / Asia/Kathmandu / America/Los_Angeles |

Round-trips ≠ historical proof (ADR-003). ISS-016 remains open.

### Verified correctness issues

| ID | Issue | Status |
|----|-------|--------|
| ISS-001 | Wrong validation index into calendar tuple | **Resolved** |
| ISS-002 | Local `Date` / timezone sensitivity | **Resolved** (date-only path; legacy local by design) |
| ISS-003 | AD→BS O(days) walk | **Resolved** — prefix tables (Step 7) |
| ISS-004 | No max AD bound tied to BS 2099 | Open |
| ISS-016 | Dataset provenance unknown | Open (investigated) |
| ISS-019 | `daysBetweenBS` over-count | **Resolved** |

## Accepted v2 core responsibilities (ADR-002, ADR-003)

1. **Date-only types** — `CalendarDate` / `AdDate` / `BsDate`.
2. **Converters** — pure functions over date-only inputs.
3. **Legacy `Date` adapters** — v1 local-field semantics; explicit UTC API only if added deliberately.
4. **Validation** — correct month-length lookup (BS table + pure Gregorian).
5. **Arithmetic** — correct day counts (ISS-019) + Gregorian day numbers.
6. **Integrity** — checksum + structural tests; provenance honest.

## Module layout (Stage 2.4)

| Concern | Module |
|---------|--------|
| Dataset + REF (no digits) | `src/core/calendar-data.ts` |
| Civil date types only | `src/core/types.ts` |
| `getDaysInMonth`, `parseDateInput` | `src/core/calendar.ts` |
| Gregorian / validation / converters | `src/core/*` |
| Digits / names / i18n types | `src/i18n/digits.ts`, `names.ts`, `types.ts` |
| Localization helpers / format | `src/i18n/localization.ts`, `format.ts` |
| Picker options | `src/ui/types.ts` |

`core/` must not import `i18n/` or `ui/`, use DOM, or define localization/UI-only symbols.

## Non-negotiables

- Do not replace/extend dataset without approval.
- Do not silently change legacy `Date` local getters to UTC.
- Fail loudly on unsupported inputs.
