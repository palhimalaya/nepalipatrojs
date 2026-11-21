# API — Conversion

## Date-only (preferred, ADR-002)

Timezone-independent. Accept/return civil `{ year, month, day }` only.

```ts
import { convertAdToBs, convertBsToAd, CalendarDate } from 'nepalipatrojs';

convertAdToBs(ad: CalendarDate): BsDate   // NepaliDate
convertBsToAd(bs: BsDate): AdDate         // CalendarDate — not a JS Date
```

Also: `REF_AD_YMD`, `REF_BS`, `getBsWeekdayIndex(bs)`.

## Legacy v1 wrappers (local-field `Date` semantics)

```ts
NepaliPatro.convertADToBS(date: Date | number[]): NepaliDate
NepaliPatro.convertBSToAD(bsDate: NepaliDate | number[]): Date
NepaliPatro.getCurrentBSDate(): NepaliDate
NepaliPatro.now(): NepaliDate
```

| Input | Semantics |
|-------|-----------|
| `Date` | Local `getFullYear` / `getMonth()+1` / `getDate` — **TZ-sensitive** for the same instant |
| `[year, month, day]` | 1-based month civil triple — TZ-independent (delegates to date-only) |
| Return `Date` from `convertBSToAD` | Local midnight of the civil AD date — Y/M/D stable; timestamp varies by TZ |

### Parsing

Core converters accept **objects** or **`[y,m,d]` arrays** only. They do **not** parse `YYYY-MM-DD` strings (avoids ISO UTC-midnight shifts). Datepicker uses regex digit extraction separately.

### Proposed (not implemented)

Explicit UTC Date wrapper, e.g. `convertAdDateUtcToBs(date: Date): BsDate` using `getUTCFullYear` / `getUTCMonth` / `getUTCDate`. Requires design note before shipping.

See ADR-002 and migration guide.
