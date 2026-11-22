# API — Datepicker

## Public constructor

```ts
new NepaliDatePicker(input: HTMLInputElement, options?: NepaliDatePickerOptions)
picker.destroy()
picker.setZIndex(n)
```

### Options

| Option | Type | Default | Notes |
|--------|------|---------|-------|
| `format` | `string` | `"YYYY-MM-DD"` | BS format for input value |
| `theme` | `"light" \| "dark"` | `"light"` | CSS theme class |
| `language` | `"en" \| "np"` | `"en"` | Digits / month labels |
| `zIndex` | `number` | `999999` | Sticky; see Stage 3.4 precedence |
| `minDate` | `NepaliDate` | — | **Inclusive** minimum; **copied** at construction |
| `maxDate` | `NepaliDate` | — | **Inclusive** maximum; **copied** at construction |
| `disabledDates` | `NepaliDate[]` | — | Exact BS dates; **array + entries snapshotted** at construction |
| `isDateDisabled` | `(date: NepaliDate) => boolean` | — | `true` → not selectable; **retained by reference**, evaluated **dynamically** on each check |

Constraint options are additive. Malformed dates are ignored (console warning). If `minDate > maxDate`, both bounds are ignored.

**Mutability:** Changing the caller's `disabledDates` array (or mutating its objects) after `new NepaliDatePicker(...)` does not affect the instance. Changing what `isDateDisabled` returns on later calls does — the predicate is invoked on every availability check (render, click, keyboard, Today).

### Events

Selecting a date (click / Enter / Space / Today) writes the formatted value and dispatches bubbling `change`.

**Clear** sets `input.value` to `""`, clears internal selection, dispatches `change`, and **keeps the popup open**.

### Today

Uses the BS “today” snapshot from `getCurrentBSDate()` at construction. If today is outside min/max or otherwise disabled, the Today control is disabled and does not select anything.

### Dual AD/BS display (Stage 3.6)

- **Authoritative calendar:** BS (selection, navigation, constraints).
- **AD presentation:** secondary only — each day cell shows a compact AD day-of-month; a footer shows the full AD civil date for the **focused** BS date.
- **Footer sync:** updates on keyboard focus moves and month re-renders; removed when the popup closes (Today / day selection). Mouse hover does not update the footer (ISS-024).
- **Conversion:** core `convertBsToAd` (date-only, timezone-independent).
- **Not included:** AD month grid, AD navigation, or calendar-mode switching.

### Theme tokens (Stage 3.7)

Existing `theme: "light" | "dark"` applies `.nepali-datepicker-light` / `.nepali-datepicker-dark`.

Consumers may override CSS variables on the popup root (or a parent that wraps the mounted popup). No new JS theme API.

| Variable | Role (light default) |
|----------|----------------------|
| `--np-surface` | Popup background |
| `--np-surface-muted` / `--np-surface-emphasis` | Hover / muted fills |
| `--np-text` / `--np-text-muted` / `--np-text-subtle` | Text hierarchy |
| `--np-border` | Borders / separators |
| `--np-accent` / `--np-accent-strong` | Accent / selected border |
| `--np-selected-bg` / `--np-selected-text` | Selected day |
| `--np-today-bg` / `--np-today-text` | Today highlight |
| `--np-focus-ring` | `:focus-visible` outline |
| `--np-radius` / `--np-radius-sm` | Corner radii |
| `--np-space-*` | Spacing scale |
| `--np-font` / `--np-font-size*` | Typography |
| `--np-day-size` / `--np-popup-width` | Sizing |
| `--np-shadow` | Elevation |
| `--np-disabled-opacity` / `--np-ad-opacity` | Disabled / AD subtitle |

Dark theme reassigns the same tokens on `.nepali-datepicker-dark`.
