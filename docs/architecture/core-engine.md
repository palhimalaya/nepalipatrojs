# Core calendar engine

## Current behavior (verified)

### Dataset

- File: `src/constants/calendar-data.ts`
- Years **2000–2099**, contiguous (100 entries)
- Entry: `[number[12] /* days per month */, number /* total days */]`
- Spot-check: year totals equal sum of month days (e.g. 2000 → 365, 2081 → 366)

### Reference epoch

```
REF_BS = { year: 2000, month: 1, day: 1 }
REF_AD = new Date(1943, 3, 14)  // local timezone constructor — risk
```

Documented pair matches code comments: **2000-01-01 BS == 1943-04-14 AD**.

### Algorithms

**AD → BS** (`converters/ad-to-bs.ts`)

1. Normalize input to Y/M/D (from `Date` local getters or `[y,m,d]`).
2. `validateAdDate`.
3. Day difference vs `REF_AD` using ms / 86400000 (rounded).
4. Walk forward/backward **one BS day at a time** using `getDaysInMonth`.

**BS → AD** (`converters/bs-to-ad.ts`)

1. Parse object or array; `validateBsDate`.
2. Count days between `REF_BS` and target via month lengths.
3. `new Date(REF_AD)` then `setDate(getDate() + daysDiff)`.

### Verified correctness issues

| ID | Issue |
|----|-------|
| ISS-001 | `validateBsDate` indexes `BS_CALENDAR_DATA[year][month-1]` instead of `[year][0][month-1]`. For month 1, value is the **array**; for month 2, value is **year total (365/366)**. Tests repeat the same wrong indexing → false confidence. |
| ISS-002 | Local `Date` usage for calendar arithmetic and `REF_AD` construction → results can shift across timezones. |
| ISS-003 | AD→BS day-walk is O(days from epoch); acceptable for range but not ideal; must not change results when optimizing. |
| ISS-004 | No max AD year bound symmetric to BS 2099 end. |

## Accepted v2 core responsibilities (ADR-002, ADR-003)

1. **Date-only types** — `CalendarDate` `{ year, month, day }` for both calendars; no wall-clock time.
2. **Converters** — pure functions over date-only inputs.
3. **Legacy `Date` adapters** — preserve **v1 local-calendar-field** semantics; document; optional **explicit** UTC API later — never a silent local→UTC switch.
4. **Validation** — correct month-length lookup; structured errors.
5. **Arithmetic** — add/subtract days, month boundaries, using dataset.
6. **Calendar info** — days in month, year length, supported range queries.
7. **Integrity** — checksum + structural tests; provenance documented (currently unknown).

## Non-negotiables

- Keep the existing month-length dataset unless separately approved replacements exist.
- Keep the documented reference pair unless proven wrong with citations.
- Round-trip: algorithmic consistency with this dataset — **not** proof of historical accuracy.
- Date-only APIs: identical results under varying `TZ`.
- Fail loudly on unsupported inputs — never invent dates.
- Do not optimize (prefix sums, etc.) until goldens/round-trips pass.
