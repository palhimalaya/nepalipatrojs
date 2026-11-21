# System overview

## Current (v1) dependency map

```
NepaliPatro (index.ts)
├── converters/ad-to-bs ──► validations, helpers.getDaysInMonth, calendar-data
├── converters/bs-to-ad ──► validations, helpers.parseDateInput, calendar-data
├── formatters/date-formatter ──► bs-to-ad (for weekday), calendar-data digits, types enums
├── utils/helpers ──► calendar-data, types
├── utils/validations ──► calendar-data
└── ui/NepaliDatePicker ──► index (CIRCULAR), helpers, calendar-data, styles.css
```

**Critical problems**

1. `NepaliDatePicker` imports from `../index` while `index` exports the picker → **circular dependency**.
2. Business logic for month lengths is duplicated across helpers, validations (incorrectly), and the datepicker.
3. Core conversion uses local `Date` constructors/getters → **timezone-sensitive**.
4. UI owns parsing, rendering, positioning, and z-index scanning in one ~645-line class.

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

- Date-only structured AD type (year/month/day without `Date`)
- Explicit validation API returning results (not only throws)
- Min/max / disabled dates on picker
- Controlled React component
- Dual calendar mode (AD view ↔ BS view)
- Events beyond input `change`
- Documented error codes

## Proposed v2 layout (single package)

Not a multi-package monorepo on day one. Internal modules only:

```
src/
├── core/                     # No DOM, no React
│   ├── calendar-data.ts      # Preserved dataset + refs
│   ├── types.ts              # CalendarDate, BSDate, ADDate (date-only)
│   ├── converters/
│   ├── validation/
│   ├── arithmetic/
│   └── index.ts
├── i18n/
│   ├── locales/
│   ├── digits.ts
│   ├── format.ts
│   └── index.ts
├── datepicker/               # Vanilla DOM only
│   ├── state/
│   ├── parse/
│   ├── calendar-view/
│   ├── navigation/
│   ├── positioning/
│   ├── a11y/
│   ├── styles/
│   └── NepaliDatePicker.ts   # thin orchestrator
├── react/                    # Optional; depends on core + datepicker or headless core
│   └── NepaliDatePicker.tsx
└── index.ts                  # public barrel (no circular UI imports)
```

**Apps (later phases, may live in-repo):**

```
apps/playground/          # Phase 6
apps/documentation/       # Phase 6 (or Mintlify/VitePress site)
```

**Tests (reorganized in Phase 1+):**

```
tests/ or src/**/__tests__/
  conversion/
  validation/
  timezone/
  formatting/
  datepicker/
  packaging/   # smoke after pack
```

## Package strategy

| Option | Verdict |
|--------|---------|
| Multi-package monorepo (`@nepalipatrojs/core`, …) now | **Rejected for v2 start** — overhead without independent release need |
| Single package + internal modules + export map | **Recommended** |
| Later extract `@nepalipatrojs/react` if needed | Optional after API stabilizes |

See [ADR-001](../decisions/ADR-001-core-architecture.md).
