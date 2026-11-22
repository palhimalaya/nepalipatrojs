# Public API inventory (Stage 2.0 / ISS-017)

**Date:** 2026-11-21  
**Source of truth:** `src/index.ts`, `package.json`, Rollup config, built `dist/` artifacts, README / QUICK_START  
**Status:** Frozen for Stage 2.1 planning — **no removals/additions authorized by this doc alone**  
**Production changes:** None (assessment only)

Compatibility classes:

| Class | Meaning |
|-------|---------|
| **C1 — Contractual** | Documented or clearly consumer-facing; must keep working through Stage 2.1+ unless separately deprecated |
| **C2 — Compatibility** | Supported today; keep unless ADR-005 deprecation path approved |
| **C3 — Accidental / ambiguous** | Exported but undocumented or inconsistent with docs; **do not remove** without explicit decision |
| **C4 — Internal** | Not part of package public surface (even if importable via deep paths — deep paths are **unsupported**) |

---

## 1. Package entry points (verified)

| Field | Value | On disk after `npm run build` | Class |
|-------|-------|-------------------------------|-------|
| `name` | `nepalipatrojs` | — | C1 |
| `main` | `dist/nepali-patro-js.umd.js` | **exists** | C1 |
| `module` | `dist/nepali-patro-js.esm.js` | **exists** | C1 |
| `types` | `dist/index.d.ts` | **exists after build** (not in `.gitignore` allowlist; may be absent from git) | C1 intent / packaging risk |
| `exports["."].import` | `./dist/nepali-patro-js.esm.js` | exists | C1 |
| `exports["."].require` | `./dist/nepali-patro-js.umd.js` | exists | C1 |
| `exports["."].types` | `./dist/index.d.ts` | exists after build | C1 intent |
| `exports["./css"]` | `./dist/nepali-patro-js.css` | **exists** | C1 |
| `exports["./styles"]` | `./dist/only-styles.css` | **MISSING** | C3 / broken (ISS-009) |
| CDN path (docs) | `…/dist/nepali-patro-js.css` | exists | C1 |
| CDN path (docs) | `…/dist/nepali-patro-js.umd.js` | exists | C1 |
| UMD global name | `NepaliPatro` (Rollup `output.name`) | verified in bundle | C1 |
| Browser side effect | `window.NepaliDatePicker = NepaliDatePicker` | present in source/bundle | C1 |
| `nepalipatrojs/core` | — | **not defined** (and not to be added now) | — |

`.gitignore` currently allows only `dist/nepali-patro-js.{css,umd.js,esm.js}` — declarations and maps may not be published from git; `prepublishOnly` builds locally before publish (Phase 5 concern).

**No `nepalipatrojs/core` deep export** — confirmed decision for now.

---

## 2. Supported import styles (must keep working)

### ESM default + named

```ts
import NepaliPatro from 'nepalipatrojs';
import { NepaliDatePicker, convertADToBS, formatBSDate } from 'nepalipatrojs';
```

### CJS / require

```js
const NepaliPatro = require('nepalipatrojs').default;
// or destructure named exports from the UMD/CJS interop object
```

### UMD / CDN

```html
<script src="…/nepali-patro-js.umd.js"></script>
<script>
  // Global facade
  NepaliPatro.convertADToBS([2022, 1, 1]);
  // Global picker (window assignment)
  new NepaliDatePicker(input, { format: 'YYYY-MM-DD' });
</script>
```

### CSS

```js
import 'nepalipatrojs/css';           // → nepali-patro-js.css (works)
// import 'nepalipatrojs/styles';    // → only-styles.css (BROKEN — missing file)
```

```html
<link rel="stylesheet" href="…/dist/nepali-patro-js.css" />
```

---

## 3. Runtime named exports (verified from ESM keys)

| Export | Kind | Notes | Class |
|--------|------|-------|-------|
| `default` / `NepaliPatro` | class (static-only) | Same object (`NepaliPatro === default`) | C1 |
| `NepaliDatePicker` | class | Constructor + `setZIndex` + `destroy` | C1 |
| `convertADToBS` | function | Legacy Date / `[y,m,d]` | C1 |
| `convertBSToAD` | function | Returns `Date` | C1 |
| `convertAdToBs` | function | Date-only; added Phase 1 | **C2** (new; treat as keep) |
| `convertBsToAd` | function | Date-only; returns civil AD | **C2** |
| `getBsWeekdayIndex` | function | Date-only weekday 1–7 | **C2** |
| `getCurrentBSDate` | function | Local “today” | C1 |
| `formatBSDate` | function | Named export of formatter (`formatBS` internally) | C1 |
| `toNepaliDigits` | function | | C1 |
| `nepaliDigitsToEnglish` | function | | C1 |
| `getDateFormatPatterns` | function | Used by picker | C1 |
| `getDaysInMonth` | function | BS month length | C1 |
| `REF_AD_YMD` | const | `{1943,4,14}` | **C2** (Phase 1) |
| `REF_BS` | const | `{2000,1,1}` | **C2** |
| `NepaliMonth` | enum | English names | C1 |
| `NepaliMonthNepali` | enum | Devanagari | C1 |
| `NepaliWeekDay` | enum | | C1 |
| `NepaliWeekDayNepali` | enum | | C1 |

### Type-only exports (erased at runtime; present in `.d.ts` / TS)

| Export | Class |
|--------|-------|
| `CalendarDate`, `AdDate`, `BsDate`, `NepaliDate` | C2 (Phase 1 types) / C1 for `NepaliDate` |
| `NepaliPatroOptions`, `NepaliDatePickerOptions`, `DateFormatPattern` | C1 |

### Imported by `index.ts` but **not** re-exported (non-public)

| Symbol | Class |
|--------|-------|
| `BS_CALENDAR_DATA`, `MIN_BS_YEAR`, `MAX_BS_YEAR`, `MIN_AD_YEAR` | **C4** via package entry (facade exposes `MIN_YEAR` / `MAX_YEAR` / `MIN_AD_YEAR` instead) |

Deep imports like `nepalipatrojs/dist/...` or source paths are **unsupported**.

---

## 4. `NepaliPatro` static facade (C1)

| Member | Signature / shape | Defaults | Observable behavior |
|--------|-------------------|----------|---------------------|
| `MIN_YEAR` | `number` (= 2000) | — | BS min year |
| `MAX_YEAR` | `number` (= 2099) | — | BS max year |
| `MIN_AD_YEAR` | `number` (= 1943) | — | AD min year |
| `convertADToBS` | `(date: Date \| number[]) => NepaliDate` | — | `Date` → **local** fields; array = civil `[y,m,d]` 1-based month; throws on invalid/out of range |
| `convertBSToAD` | `(bs: NepaliDate \| number[]) => Date` | — | Returns **local-midnight** `Date`; throws if invalid BS |
| `convertAdToBs` | `(ad: CalendarDate) => NepaliDate` | — | Date-only; TZ-independent |
| `convertBsToAd` | `(bs: CalendarDate) => AdDate` | — | Date-only civil AD (not `Date`) |
| `getCurrentBSDate` | `() => NepaliDate` | — | Host local “now” |
| `now` | `() => NepaliDate` | — | Alias of `getCurrentBSDate` |
| `formatBS` | `(date, format?, options?) => string` | `format='YYYY-MM-DD'`, `options={}` | Tokens; `language: 'en'\|'np'` (docs often say `'ne'` — ISS-005) |
| `getDaysInMonth` | `(year, month) => number` | — | Throws if year/month invalid |
| `toNepaliDigits` | `(num: number\|string) => string` | — | |
| `nepaliDigitsToEnglish` | `(text: string) => string` | — | |
| `getDateFormatPatterns` | `() => DateFormatPattern[]` | — | Regex patterns for parsing |

**Naming dual:** facade method is `formatBS`; named export is `formatBSDate`. Both must remain (C1). There is **no** named export `formatBS`.

---

## 5. `NepaliDatePicker` (C1)

```ts
constructor(inputElement: HTMLInputElement, options?: NepaliDatePickerOptions)
setZIndex(zIndex: number): void
destroy(): void
```

`NepaliDatePickerOptions`:

| Option | Type | Code default | Docs discrepancy |
|--------|------|--------------|------------------|
| `format` | string | `'YYYY-MM-DD'` | QUICK_START table says `'MMMM D, YYYY'` |
| `theme` | `'light'\|'dark'` | `'light'` | OK |
| `language` | `'en'\|'np'` | `'en'` | Docs sometimes `'ne'` |
| `zIndex` | number | computed | OK |

Observable behavior (contractual for Stage 2.1):

- Attaches to input; toggles popup calendar; writes formatted value; dispatches `change`.
- Outside click closes; `destroy()` removes listeners/DOM.
- Uses `getCurrentBSDate`, `convertBSToAD`, `formatBSDate` via **`../index` today** (cycle).

---

## 6. Options / unused fields

| Field | Status |
|-------|--------|
| `NepaliPatroOptions.returnType` | Declared; **not observed** in `formatBS` implementation — C3 |
| Locale `'ne'` in docs | **Not accepted** by formatter today (`'np'` only) — ISS-005; C3 docs vs C1 runtime |

---

## 7. Circular dependency vs public API (Stage 2.1 impact)

```
Consumer ──import──► src/index.ts ──import──► ui/NepaliDatePicker.ts
                         ▲                         │
                         └────── import ../index ───┘
```

**Affected public paths (must keep working after 2.1):**

1. `import NepaliPatro from 'nepalipatrojs'` / named `NepaliPatro`
2. `import { NepaliDatePicker } from 'nepalipatrojs'`
3. UMD global `NepaliPatro` + `window.NepaliDatePicker`
4. Picker still able to convert/format/current-date (via **non-barrel** imports internally)

Stage 2.1 changes **only internal import edges**. No signature/export list changes.

---

## 8. Proposed Stage 2.1 compatibility tests

Add (when 2.1 authorized) — not implemented now:

1. **ESM smoke:** default `NepaliPatro` === named `NepaliPatro`; `convertADToBS([2022,1,1])` stable; `formatBSDate` / `NepaliPatro.formatBS` agree.
2. **Named picker:** `new NepaliDatePicker(input)` constructs; `destroy()` cleans up (existing UI tests).
3. **UMD/global:** evaluate UMD in jsdom/vm; assert `NepaliPatro.convertBSToAD` and `global.NepaliDatePicker` / `window.NepaliDatePicker`.
4. **CSS export:** `exports['./css']` resolves to existing file ( `./styles` remains known-fail until Phase 5).
5. **Full Jest** + typecheck + build after cycle break.
6. **No export snapshot change:** compare `Object.keys(esm)` before/after 2.1 (allow only if intentionally unchanged).

---

## 9. Ambiguities — decisions (2026-11-21)

| # | Topic | Decision |
|---|-------|----------|
| 1 | Phase 1 date-only exports | Remain **C2**, but document as **supported intentional v2 APIs** in migration guide. C2 ≠ experimental; still get compatibility tests. |
| 2 | `NepaliPatroOptions.returnType` | **Defer removal.** Document accurately as unused/unresolved legacy; do not imply it works. |
| 3 | Docs `ne` vs runtime `np` | **Leave** — ISS-005; no locale change in Stage 2.1. |
| 4 | QUICK_START format default | **Docs defect** — fix in documentation cleanup, not this refactor. |
| 5 | Publish `BS_CALENDAR_DATA`? | **No** — stays **C4** unpublished. |
| 6 | Collapse ISS-011 into ISS-020? | **Not yet** — keep separate until root causes/acceptance confirmed identical. |

---

## 10. Explicit non-goals of this inventory

- No export removals/additions authorized by inventory alone.
- No `nepalipatrojs/core` deep public export.
- Packaging/CSS/`types` publish fixes → **Phase 5**.

## 11. Stages 2.1–2.4 datepicker / internal layout (implemented)

**Stage 2.1:** `NepaliDatePicker.ts` no longer imports `../index` (cycle removed).

**Stage 2.2:** No `BS_CALENDAR_DATA`; uses `getDaysInMonth` + `MIN`/`MAX_BS_YEAR`.

**Stage 2.3–2.4:** Physical modules; datepicker imports:

- `../core/converters/ad-to-bs` (`getCurrentBSDate`)
- `../core/converters/bs-to-ad` (`convertBSToAD`)
- `../core/calendar` (`getDaysInMonth`)
- `../core/calendar-data` (`MIN_BS_YEAR`, `MAX_BS_YEAR` only)
- `../core/types`
- `../i18n/format` (`formatBS` as `formatBSDate`)
- `../i18n/localization` (`localizeDigits`, `localizeMonth`, `nepaliDigitsToEnglish`, `getDateFormatPatterns`)

Public barrel still imports and re-exports the picker; UMD/`window.NepaliDatePicker` unchanged. **Export list unchanged.** No public deep export `nepalipatrojs/core`.
