# NepaliPatroJS

A JavaScript/TypeScript library for **Bikram Sambat (BS)** ↔ Gregorian (**AD**) conversion, formatting, and a vanilla browser datepicker.

[![npm version](https://img.shields.io/npm/v/nepalipatrojs.svg)](https://www.npmjs.com/package/nepalipatrojs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Package version (repo):** `2.0.0` · **Last published on npm:** `1.0.5` (publish requires separate release authorization)

## Features

- Convert between BS and AD (date-only APIs preferred; legacy `Date` wrappers retained)
- Format BS dates (English or Nepali digits/names)
- Vanilla DOM datepicker: keyboard navigation, constraints, dual AD labels, light/dark theme tokens
- TypeScript types (`dist/index.d.ts` bundled on build)
- ESM + CJS + UMD bundles

## Supported range and data honesty

| Item | Value |
|------|--------|
| BS years in dataset | **2000–2099** (`NepaliPatro.MIN_YEAR` / `MAX_YEAR`) |
| Reference epoch | **2000-01-01 BS** ≡ **1943-04-14 AD** (`REF_BS` / `REF_AD_YMD`) |

The month-length table is treated as the library’s **civil working dataset**. It is covered by structural checks, a SHA-256 pin, golden fixtures, and exhaustive BS↔AD **round-trips**. Those prove **internal consistency**, not independent historical accuracy.

**Provenance of the table is currently unknown** (ISS-016). Do not treat this library as an authoritative historical almanac until an upstream source is cited and cross-checked. See [docs/architecture/core-engine.md](docs/architecture/core-engine.md).

## Installation

```bash
npm install nepalipatrojs
```

### CSS

```ts
import 'nepalipatrojs/css';
// alias also works:
import 'nepalipatrojs/styles';
// → dist/nepali-patro-js.css
```

CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nepalipatrojs/dist/nepali-patro-js.css" />
```

## Import

```ts
import NepaliPatro, {
  NepaliDatePicker,
  convertAdToBs,
  convertBsToAd,
  formatBSDate,
} from 'nepalipatrojs';

// CommonJS
const NepaliPatro = require('nepalipatrojs').default;
```

UMD / CDN: global facade `NepaliPatro`; datepicker also on `window.NepaliDatePicker`.

Detailed surface: [docs/api/public-api-inventory.md](docs/api/public-api-inventory.md).

---

## Date-only conversion (preferred)

Timezone-independent civil `{ year, month, day }` APIs (ADR-002):

```ts
import { convertAdToBs, convertBsToAd } from 'nepalipatrojs';

const bs = convertAdToBs({ year: 2022, month: 1, day: 1 });
// → { year: 2078, month: 9, day: 17 }

const ad = convertBsToAd({ year: 2078, month: 9, day: 17 });
// → { year: 2022, month: 1, day: 1 }  // civil AD, not a JS Date
```

Also on the facade: `NepaliPatro.convertAdToBs` / `convertBsToAd`.

### Legacy `Date` wrappers (v1 compatibility)

```ts
// Date → local calendar fields (TZ-sensitive for the same instant)
NepaliPatro.convertADToBS(new Date(2022, 0, 1));
NepaliPatro.convertADToBS([2022, 1, 1]); // [y,m,d] civil — TZ-independent

// Returns JS Date at local midnight of the civil AD day
NepaliPatro.convertBSToAD({ year: 2078, month: 9, day: 17 });
```

Prefer date-only APIs in new code. See [docs/api/conversion.md](docs/api/conversion.md).

### Current BS “today”

```ts
NepaliPatro.getCurrentBSDate(); // host local civil date
NepaliPatro.now();              // alias
```

### Format

```ts
import NepaliPatro, { formatBSDate } from 'nepalipatrojs';

const bs = { year: 2078, month: 1, day: 15 };

NepaliPatro.formatBS(bs);                        // 2078-01-15
NepaliPatro.formatBS(bs, 'MMMM D, YYYY');         // Baisakh 15, 2078
NepaliPatro.formatBS(bs, 'MMMM D, YYYY', { language: 'np' });
// बैशाख १५, २०७८

// Named export (same formatter):
formatBSDate(bs, 'DD/MM/YYYY');
```

**Locale codes (current runtime):** use **`en`** or **`np`**.  
`language: 'ne'` is **not** a supported synonym today (ISS-005): digits stay Western Arabic while month names may still switch — do not rely on `'ne'`. A future change may canonicalize `ne` with `np` as alias; that is **not** implemented yet.

### Month length

```ts
NepaliPatro.getDaysInMonth(2078, 2); // Jestha 2078 → 31 (dataset)
```

---

## Nepali datepicker

Vanilla DOM component. **BS is authoritative** for selection and constraints. Each day cell shows a secondary AD day-of-month; a footer shows the AD civil date for the **focused** BS day (not mouse hover — ISS-024).

### Browser / UMD

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nepalipatrojs/dist/nepali-patro-js.css" />
<script src="https://cdn.jsdelivr.net/npm/nepalipatrojs/dist/nepali-patro-js.umd.js"></script>
<input id="dateInput" placeholder="Select Nepali Date" />
<script>
  const input = document.getElementById('dateInput');
  const dp = new NepaliDatePicker(input, {
    format: 'YYYY-MM-DD',
    theme: 'light',
    language: 'en',
  });
</script>
```

### ESM

```ts
import { NepaliDatePicker } from 'nepalipatrojs';
import 'nepalipatrojs/css';

const input = document.getElementById('dateInput') as HTMLInputElement;
const dp = new NepaliDatePicker(input, {
  format: 'YYYY-MM-DD',
  theme: 'dark',
  language: 'np',
  minDate: { year: 2080, month: 1, day: 1 },
  maxDate: { year: 2085, month: 12, day: 30 },
  disabledDates: [{ year: 2081, month: 1, day: 1 }],
  isDateDisabled: (d) => d.month === 12 && d.day === 1,
});

dp.setZIndex(1000);
// …later
dp.destroy();
```

### Options

| Option | Type | Default | Notes |
|--------|------|---------|-------|
| `format` | `string` | `'YYYY-MM-DD'` | BS value written to the input |
| `theme` | `'light' \| 'dark'` | `'light'` | Adds `.nepali-datepicker-light` or `.nepali-datepicker-dark` |
| `language` | `'en' \| 'np'` | `'en'` | Digits / month labels / UI strings |
| `zIndex` | `number` | `999999` | Sticky; `setZIndex` updates open popup |
| `minDate` | `NepaliDate` | — | Inclusive; **copied** at construction |
| `maxDate` | `NepaliDate` | — | Inclusive; **copied** at construction |
| `disabledDates` | `NepaliDate[]` | — | Exact dates; **snapshotted** at construction |
| `isDateDisabled` | `(date) => boolean` | — | `true` = unavailable; kept by **reference**, evaluated dynamically |

**Today** uses the BS “today” snapshot from construction; disabled if outside constraints. **Clear** empties the input, clears selection, fires `change`, and **keeps the popup open**. Day selection / Today closes the popup and fires `change`.

### Keyboard (summary)

Arrow keys move focus among available days; Home/End, PageUp/PageDown; Enter/Space select; Escape closes and restores focus. Not a substitute for real assistive-technology testing (ISS-013).

### Theming

Override CSS variables on `.nepali-datepicker` (or a parent). Examples: `--np-accent`, `--np-day-size`, `--np-popup-width`, `--np-surface`. Full list: [docs/api/datepicker.md](docs/api/datepicker.md).

---

## Format tokens

| Token | Meaning | Example |
|-------|---------|---------|
| `YYYY` | 4-digit year | 2078 |
| `YY` | 2-digit year | 78 |
| `MMMM` / `MMM` | Month name / short | Baisakh / Bai |
| `MM` / `M` | Month number | 01 / 1 |
| `DD` / `D` | Day of month | 15 / 15 |
| `dddd` / `ddd` | Weekday name / short | (from BS weekday index) |
| `d` | Weekday index | 1–7 |
| `[text]` | Literal | |

## Types (shape)

```ts
interface NepaliDate {
  year: number;
  month: number; // 1–12
  day: number;
}

// NepaliPatroOptions.language is 'en' | 'np' (not 'ne')
```

## Documentation map

| Doc | Purpose |
|-----|---------|
| [QUICK_START.md](QUICK_START.md) | Short recipes |
| [docs/api/](docs/api/) | API reference |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Contributor / AI session bootstrap |
| [docs/progress/STATUS.md](docs/progress/STATUS.md) | Current phase |

## Browser & bundlers

Works in modern browsers, Node.js, and common bundlers (Rollup, Webpack, Vite, …). Real-browser smoke coverage is planned (Phase 4.2); current automated UI tests use jsdom.

## Contributing

Issues and PRs welcome. Follow `PROJECT_CONTEXT.md` and `docs/progress/MASTER-PLAN.md` for staged work.

## License

MIT
