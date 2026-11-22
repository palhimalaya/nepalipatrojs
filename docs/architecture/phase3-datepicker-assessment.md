# Phase 3 Step 3.0 — Datepicker behavior assessment & redesign specification

**Date:** 2026-11-22  
**Authorization:** Assessment and documentation only — **no production implementation**  
**Source audited:** `src/ui/NepaliDatePicker.ts` (~651 lines), `src/ui/styles.css`, `src/ui/types.ts`, UI tests, ADR-004  
**Depends on:** Phase 2 complete (core/i18n boundaries; picker already consumes `getDaysInMonth` + i18n)

---

## 1. Existing behavior inventory

Status key: **Works** · **Incomplete** · **Missing** · **Defect**

| Area | Current behavior | Status | Notes |
|------|------------------|--------|-------|
| Construction | `new NepaliDatePicker(input, options?)`; registers in static `Set`; calls `init()` | Works | Requires `HTMLInputElement` |
| Options | `format`, `theme` (`light`/`dark`), `language` (`en`/`np`), `zIndex?` | Works | No other options |
| Initialization | Defaults: format `YYYY-MM-DD`, theme `light`, language `en`; view date = `getCurrentBSDate()` | Works | Conflates “view month” with “selected day” until parse/select |
| Input binding | Click on input toggles popup | Works | No focus-open; no icon trigger API |
| Value parsing | On open: parse input via Nepali→English digits, month-name patterns, then `getDateFormatPatterns()` | Incomplete | Ambiguous DD-MM vs MM-DD (ISS-007); invalid → warn + keep prior view |
| AD handling | BS→AD only for first-of-month weekday via `convertBSToAD` + `Date.getDay()` | Incomplete | No AD input/view mode; weekday path is host-TZ-sensitive |
| BS handling | View/select is BS-only; month lengths via `getDaysInMonth` | Works | Correct core consumption (Stage 2.2+) |
| Month navigation | Prev/next buttons; month `<select>` | Works | Crosses year boundary |
| Year navigation | Year `<select>` spanning `MIN_BS_YEAR`–`MAX_BS_YEAR` | Works | |
| Selected date | `currentBSYear/Month/Day`; CSS `nepali-selected` | Incomplete | No separate “today” marker; other-month cells selectable |
| Current / today | Initial state from `getCurrentBSDate()`; no “Today” control; no today styling | Missing | |
| Min / max dates | None | Missing | |
| Disabled dates / callbacks | None | Missing | |
| Selection | Click day → format into input → `change` event → close | Works | Only native `change`; no `onSelect` API |
| Formatting | `formatBS` + `language` | Works | Same tokens as library formatter |
| Localization | Month names + digits via i18n helpers; weekday abbreviations hardcoded in HTML | Incomplete | `ne` alias not supported (ISS-005); weekday labels not from `i18n/names` |
| Nepali / English digits | `localizeDigits` in grid/selects; parse via `nepaliDigitsToEnglish` | Works | |
| Calendar grid | 42-cell grid; prev/current/next month padding; `daysInBsMonth` fallback outside range | Works | Fallback documented (UI padding only) |
| Popup positioning | Absolute under input; flip above / shift left if clipped | Incomplete | No viewport clamp for scroll containers; no `position: fixed` mode |
| Dismissal | Outside click; open closes other instances | Incomplete | No Escape; destroy incomplete (see cleanup) |
| Keyboard | None beyond native `<select>` / button focus | Missing | No arrows, Enter, Home/End, page nav |
| Focus management | None | Missing | No trap; focus not moved into popup; not restored on close |
| Accessibility | No `role`, ARIA, live regions, or labeled controls beyond implicit buttons | Missing | Days are `<div>`s, not buttons |
| Theme | `nepali-datepicker-light` / `-dark` CSS classes | Incomplete | System font stack; heavy shadow; not tokenized for consumer override |
| Responsive | Fixed `width: 320px` | Incomplete | No mobile sheet / full-width behavior |
| Destruction | `destroy()`: close popup, remove document click listener, delete from `Set` | Defect | **Does not remove input `click` listener** → leak / zombie toggles |
| Z-index | Optional `zIndex` / `setZIndex`; else ancestor + modal selectors + **`querySelectorAll('*')`** | Defect | Full-DOM scan (ADR-004 forbids for v2) |
| Rendering safety | `innerHTML` for entire calendar | Defect | Prefer `createElement` / text (ADR-004) |
| Multi-instance | Static registry; opening one closes others | Works | |
| Public methods | `setZIndex(n)`, `destroy()` | Works | No `open`/`close`/`setDate`/`getDate` API |

---

## 2. Compatibility contract (freeze)

Do **not** silently remove existing public surface. Deprecate with migration notes when replacing.

### 2.1 Runtime vs type-only public surface (inventory note)

Package consumers receive both **runtime** values and **TypeScript types** from the facade. Stage 2.6 moved ownership of definitions; the **compatibility inventory must keep distinguishing**:

| Kind | Examples | Remains after Phase 3? |
|------|----------|------------------------|
| **Runtime class / functions** | `NepaliDatePicker`, `destroy`, `setZIndex`, `formatBSDate`, converters | Yes — behavior may extend; signatures stable unless versioned break |
| **Runtime enums** | `NepaliMonth`, `NepaliMonthNepali`, `NepaliWeekDay`, `NepaliWeekDayNepali` | Yes — values used at runtime in apps/tests |
| **Type-only interfaces** | `NepaliDatePickerOptions`, `NepaliPatroOptions`, `DateFormatPattern`, `NepaliDate` | Yes — may gain optional fields; do not remove existing fields without deprecation |
| **Unpublished** | `BS_CALENDAR_DATA`, internal modules | Stay internal |

Moving a TypeScript interface file does **not** change runtime bundles by itself. Changing enum members or constructor options **does**.

### 2.2 Contract table

| Existing behavior | Public option / method | Expected v2 | Compatibility | Proposed improvement | Required test |
|-------------------|------------------------|-------------|---------------|----------------------|---------------|
| Construct on `HTMLInputElement` | `constructor(input, options?)` | Same entry | **Preserve** | Optional factory later; keep ctor | construct + open |
| Default format `YYYY-MM-DD` | `options.format` | Same default | **Preserve** | Document tokens | format option |
| Light/dark theme class | `options.theme` | Same values + CSS variables | **Preserve** values; skin may change (breaking for CSS selectors — document) | Tokenized theme | theme class present |
| Language `en` \| `np` | `options.language` | Keep `np`; add `ne` alias | **Preserve** `np`; alias `ne` (ISS-005) | Canonical `ne` | locale digits/names |
| Custom z-index | `options.zIndex`, `setZIndex` | Preserve API; change algorithm | **Preserve** API | No full-DOM scan; default constant / stacking context | setZIndex + open in “modal” fixture |
| Click input toggles | (implicit) | Preserve | **Preserve** | Optional `openOnFocus` | toggle / outside close |
| Outside click closes | (implicit) | Preserve | **Preserve** | + Escape | outside click; Escape |
| Parse input on open | (implicit) | Preserve best-effort parse | **Preserve** intent | Prefer configured `format`; fix DD/MM ambiguity | parse fixtures |
| Write value + `change` | (implicit) | Preserve | **Preserve** | Add optional `onSelect` / `onChange` without removing `change` | select day → value + event |
| Month/year nav | (UI) | Preserve | **Preserve** | Keyboard parity | prev/next; year boundary |
| Year span MIN–MAX BS | (UI) | Preserve | **Preserve** | Optionally clamp by min/max date | year options count |
| `destroy()` | `destroy()` | Must fully cleanup | **Preserve** + **fix** | Remove all listeners; clear registry | destroy removes input listener too |
| UMD `window.NepaliDatePicker` | facade side effect | Preserve | **Preserve** | Unchanged in Phase 3 | UMD smoke |
| CSS class names (`.nepali-datepicker`, …) | CSS | Prefer preserve class roots | Soft break if redesigned | Migration guide for skin | visual / snapshot optional |
| — | — | `minDate` / `maxDate` | **Additive** | New options | clamp nav + disable cells |
| — | — | `isDateDisabled` / `disabledDates` | **Additive** | Callback + list | cannot select disabled |
| — | — | Today / Clear | **Additive** | Header actions | jump to today; clear input |
| — | — | Dual AD/BS display | **Additive** | Footer or subtitle | shows AD equivalent |
| — | — | Keyboard / ARIA | **Additive** (ADR-004 required) | Spec §5 | a11y suite |
| — | `open()` / `close()` / `getDate()` / `setDate()` | **Additive** | Programmatic control | API unit tests |

---

## 3. Usability & architectural problems

### 3.1 Functional defects (fix in Phase 3 implementation)

| ID | Problem | Severity |
|----|---------|----------|
| D1 | `destroy()` does not remove input `click` listener | High |
| D2 | Full-document `querySelectorAll('*')` z-index scan | High (perf + ADR-004) |
| D3 | Calendar built with `innerHTML` | High (safety) |
| D4 | First weekday via `Date.getDay()` after local `Date` construction | Medium (TZ edge cases) |
| D5 | DD-MM-YYYY vs MM-DD-YYYY pattern ambiguity | Medium (ISS-007) |
| D6 | Selected vs today undifferentiated; initial “selection” is today even if input empty | Low–Medium |
| D7 | Other-month days selectable without navigating first (surprising UX) | Low |

### 3.2 Design / product gaps (improvements)

| ID | Gap |
|----|-----|
| G1 | No dual AD/BS presentation or calendar-system toggle |
| G2 | No min/max / disabled dates |
| G3 | No Today / Clear |
| G4 | No keyboard navigation or Escape |
| G5 | No ARIA / focus management |
| G6 | Visual system dated (generic system fonts, heavy shadow, fixed width) |
| G7 | Weekday labels duplicated in UI instead of i18n module |
| G8 | No programmatic open/close/get/set API |

### 3.3 Architectural smells (structure)

| Smell | Detail |
|-------|--------|
| Monolith | One class owns state, parse, grid math, HTML, events, position, z-index |
| State blur | `currentBS*` = view month **and** selected day |
| DOM coupling | Hard to unit-test grid without jsdom HTML parsing |
| Positioning + modal heuristics | Fragile selector lists for frameworks |
| Theme coupling | Class names + hardcoded colors in CSS; weak override story |

**Already fixed (do not re-litigate):** raw `BS_CALENDAR_DATA` in UI; barrel import cycle; helper/i18n ownership (Phase 2).

---

## 4. Proposed modular architecture

### 4.1 Principles

1. Vanilla DOM remains first-class (ADR-004).
2. Consume **core** + **i18n** only — no calendar arithmetic in UI.
3. Prefer **pure** grid/state modules (testable without DOM).
4. Prefer **`createElement` / textContent** over `innerHTML`.
5. Smallest maintainable split — merge modules that would only be pass-throughs.

### 4.2 Recommended decomposition (not a blind copy of every folder)

```
src/datepicker/                    # rename from ui/ during implementation (or keep ui/ until cutover)
  NepaliDatePicker.ts              # thin orchestrator (public class)
  types.ts                         # NepaliDatePickerOptions (+ new additive options)
  state.ts                         # viewMonth, selected, open, today snapshot
  parse.ts                         # input → BS date (uses i18n patterns/digits)
  grid.ts                          # pure: build Cell[] for a BS month (uses getDaysInMonth, weekday from core)
  render.ts                        # DOM from Cell[] + header/footer (no innerHTML strings of dates)
  navigation.ts                    # prev/next/month/year/today helpers on state
  position.ts                      # place popup; z-index strategy WITHOUT full-DOM scan
  events.ts                        # wire listeners; destroy registry
  a11y.ts                          # roles, labels, focus trap, keyboard map
  theme.ts                         # theme class / CSS variable application
  styles/                          # CSS (variables); keep package CSS entry compatible
```

**Collapsed vs earlier brainstorm:** `parser`→`parse.ts`; `calendar-view/grid+render`→`grid.ts`+`render.ts`; no separate `accessibility/` tree until file size warrants it.

**Explicit non-goals for this structure:** React hooks, framework adapters (Phase 4).

### 4.3 Dependency rules (unchanged)

```
datepicker → core, i18n
datepicker ✕→ index barrel
core ✕→ datepicker / i18n / DOM
```

Weekday for grid should prefer **date-only** `getBsWeekdayIndex` (or equivalent) instead of `convertBSToAD().getDay()`.

### 4.4 Proposed file migration sequence (implementation — future approval)

| Step | Work | Risk |
|------|------|------|
| 3.1 | Extract `state` + `grid` (pure) behind existing class | Low |
| 3.2 | Replace `innerHTML` with `render` | Medium |
| 3.3 | Fix `destroy` + Escape + basic a11y | Medium |
| 3.4 | Replace z-index/position strategy | Medium |
| 3.5 | Additive options: min/max, disabled, today/clear | Medium |
| 3.6 | Dual AD/BS display + optional calendar toggle | Higher UX |
| 3.7 | Visual redesign (CSS variables) + migration notes | Visual break |
| 3.8 | Rename `ui/` → `datepicker/` if desired | Import churn (internal only) |

Each step keeps public ctor/options/`destroy`/`setZIndex` green.

---

## 5. v2 UX specification

### 5.1 Visual direction

- Modern minimal light/dark using **CSS variables** (colors, radius, elevation).
- Clear **today** (outline/dot) vs **selected** (filled) vs **disabled** (muted, non-interactive).
- Restrained motion (open/close opacity/translate ≤150ms; respect `prefers-reduced-motion`).
- Desktop: anchored popover (~320–360px). Mobile: optional full-width bottom sheet (implementation detail in 3.7).
- Brand-agnostic default; consumers can override variables without forking JS.

### 5.2 Calendar systems & localization

| Mode | Behavior |
|------|----------|
| Default | BS month grid (v1 parity) |
| Dual display | Show AD equivalent for hovered/selected day (subtitle/footer) |
| Optional toggle (v2.1 if scoped) | Switch grid to AD month — **only if** approved; not required for first ship |
| Language | `en` / `np` preserved; accept `ne` → `np`/`ne` canonical per ADR-005 |
| Digits | Follow language unless later `digits: 'latn' \| 'deva'` option added |

### 5.3 Interaction flows

1. **Open:** click input (and optionally focus) → parse value → render view month of selected or today → move focus to dialog.
2. **Navigate:** prev/next month; month/year selects; PageUp/PageDown; Alt+Page for year (proposed).
3. **Select:** Enter/Space/click on enabled day → write formatted value → fire `change` (+ optional `onSelect`) → close → restore focus to input.
4. **Today:** button sets selection to today (if enabled by min/max/disabled) and optionally commits.
5. **Clear:** clears input, clears selection, fires `change`, closes or stays open (decide in implementation; default: clear + keep open).
6. **Dismiss:** Escape, outside click, or select.

### 5.4 Constraints

- `minDate` / `maxDate`: `NepaliDate` or ISO-like BS triple; disable out-of-range cells; clamp navigation.
- `isDateDisabled?(date: NepaliDate): boolean` and/or `disabledDates: NepaliDate[]`.
- Disabled days not selectable; announce via ARIA.

### 5.5 Accessibility requirements (ADR-004)

- Popup: `role="dialog"` + `aria-modal="true"` + label (e.g. “Choose date”).
- Grid: `role="grid"`; days `role="gridcell"`; buttons or `tabindex` management.
- Arrow keys move day focus; Home/End; Escape closes.
- Visible focus ring; do not rely on color alone for selected/today.

### 5.6 Component responsibilities

| Module | Responsibility |
|--------|----------------|
| state | Single source of truth for open/view/selected |
| grid | Pure cells from core month lengths + weekday index |
| render | DOM only |
| parse | String ↔ BS date using i18n |
| position | Geometry + z-index policy |
| a11y | Keyboard + ARIA + focus |
| NepaliDatePicker | Wire options, public methods, lifecycle |

---

## 6. Testing strategy

| Layer | Coverage |
|-------|----------|
| Pure `grid` | Days in month, leap-like 32-day months, year boundaries, weekday of 1st (TZ matrix for date-only path) |
| Pure `parse` | Format tokens, Nepali digits, month names, invalid input, ISS-007 cases once policy chosen |
| Navigation | Prev/next across Chaitra→Baisakh; year select span |
| Constraints | min/max clamp; disabled cannot select |
| Selection / events | Input value; `change` bubbles; optional `onSelect` |
| Keyboard / a11y | Escape; arrows; focus return (jsdom + limited checks) |
| Lifecycle | `destroy` removes **all** listeners; multi-instance close |
| Position / z-index | Custom `zIndex` applied; **no** `querySelectorAll('*')` in source (architecture test) |
| Compatibility | Existing UI + public-api-compat + UMD smoke |
| Visual | Manual / optional screenshot review for light/dark |

Architecture boundary tests from Phase 2 remain green (datepicker → core/i18n only).

---

## 7. Risks & unresolved decisions

| # | Decision needed before / during implementation | Options |
|---|-----------------------------------------------|---------|
| R1 | CSS class / visual break policy | Soft-break with migration guide vs keep class names pixel-different |
| R2 | Dual calendar scope for first Phase 3 ship | Footer AD equivalent only vs full AD grid toggle |
| R3 | Locale id | Keep `np` only vs add `ne` alias now (ISS-005) |
| R4 | Parse ambiguity DD/MM vs MM/DD | Prefer `format` option; drop duplicate pattern; or locale-based order |
| R5 | Other-month day click | Navigate-only vs select-and-commit (v1 selects) |
| R6 | Folder rename `ui/` → `datepicker/` | During Phase 3 vs leave path stable |
| R7 | Programmatic API (`open`/`close`/`getDate`/`setDate`) | Ship in 3.x first release or follow-up |
| R8 | Mobile sheet | In scope vs deferred |

**Screenshot note:** An uploaded employment-experience form image was **not** treated as a datepicker design reference.

---

## 8. Completion gate (Step 3.0)

This document is the deliverable for assessment-only authorization.

**Not authorized yet:** production datepicker rewrite, CSS redesign implementation, React, public API removals.

**Next:** Maintainer review of this spec → separate authorization for Phase 3 implementation (recommended start: Step 3.1 extract pure `state`/`grid` + fix `destroy`).
