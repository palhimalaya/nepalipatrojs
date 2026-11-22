# System overview

## Current dependency map (Stage 2.4)

```
index.ts (public facade)
├── core/types, core/calendar-data
├── core/converters/* , core/calendar
├── i18n/format, i18n/localization
└── ui/NepaliDatePicker
      ├── core/ (getDaysInMonth, converters, MIN/MAX_BS_YEAR, types)
      └── i18n/ (format, localize*, patterns)
      (no barrel import; no BS_CALENDAR_DATA)

core/ ──✕──► i18n/, ui/, document, window
i18n/ ──► core/ (types, weekday index, NEPALI_DIGITS)
i18n/ ──✕──► ui/, document, window
```

**Remaining structural issues**

1. ~~Circular `index` ↔ datepicker~~ **Resolved Stage 2.1.**
2. ~~Datepicker raw `BS_CALENDAR_DATA`~~ **Resolved Stage 2.2.**
3. ~~`helpers.ts` mixes core/i18n~~ **Resolved Stage 2.3**; physical folders **Stage 2.4**.
4. Fuller automated boundary enforcement — **Stage 2.5 / ISS-018**.
5. Legacy `Date` APIs remain local-field (intentional); date-only path is TZ-safe.
6. UI still monolithic (~645 lines) — Phase 3 (`datepicker/` modularization).

**Known co-location exceptions (not silent refactors)**

- `NEPALI_DIGITS` lives in `core/calendar-data.ts` (i18n data next to calendar table).
- Locale name enums + picker options live in `core/types.ts` (mixed types file).
- Datepicker remains under `ui/` (not renamed to `datepicker/` — Phase 3).

Full assessment: [phase2-assessment.md](phase2-assessment.md).

## Public API inventory (v1)

### Default / named class `NepaliPatro`

| Member | Role |
|--------|------|
| `MIN_YEAR`, `MAX_YEAR`, `MIN_AD_YEAR` | Range constants |
| `convertADToBS(Date \| number[])` | AD → BS |
| `convertBSToAD(NepaliDate \| number[])` | BS → AD (`Date`) |
| `getCurrentBSDate()` / `now()` | Today in BS |
| `formatBS(date, format?, options?)` | Format BS date |
| `getDaysInMonth(year, month)` | Month length |
| `toNepaliDigits` / `nepaliDigitsToEnglish` | Digit scripts |
| `getDateFormatPatterns()` | Parsing patterns (also used by UI) |

### Named exports

Types/enums: `NepaliDate`, `NepaliMonth`, `NepaliMonthNepali`, `NepaliWeekDay`, `NepaliWeekDayNepali`, `NepaliPatroOptions`, `NepaliDatePickerOptions`, `DateFormatPattern`

Functions: `convertADToBS`, `convertBSToAD`, `getCurrentBSDate`, `formatBSDate`, `toNepaliDigits`, `nepaliDigitsToEnglish`, `getDateFormatPatterns`, `getDaysInMonth`

UI: `NepaliDatePicker` (+ `window.NepaliDatePicker` in browsers)

### Not present (gaps for v2)

- Date-only structured AD type (year/month/day without `Date`) — *partially present as `AdDate` / date-only converters*
- Explicit validation API returning results (not only throws)
- Min/max / disabled dates on picker
- Controlled React component
- Dual calendar mode (AD view ↔ BS view)
- Events beyond input `change`
- Documented error codes

## Proposed v2 layout (single package)

Not a multi-package monorepo on day one. Internal modules only. **Stage 2.4 established `core/` + `i18n/` + `ui/`**; Phase 3 splits the datepicker further.

```
src/
├── core/                     # No DOM, no React, no i18n imports
│   ├── calendar-data.ts
│   ├── types.ts
│   ├── calendar.ts
│   ├── gregorian.ts
│   ├── validations.ts
│   └── converters/
├── i18n/
│   ├── localization.ts
│   └── format.ts
├── ui/                       # Vanilla DOM only (Phase 3 → datepicker/)
│   ├── NepaliDatePicker.ts
│   └── styles.css
└── index.ts                  # public barrel (no circular UI imports)
```

## Package strategy

| Option | Verdict |
|--------|---------|
| Multi-package monorepo (`@nepalipatrojs/core`, …) now | **Rejected for v2 start** — overhead without independent release need |
| Single package + internal modules + export map | **Recommended** |
| Later extract `@nepalipatrojs/react` if needed | Optional after API stabilizes |

See [ADR-001](../decisions/ADR-001-core-architecture.md).
