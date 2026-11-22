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
| `minDate` | `NepaliDate` | — | **Inclusive** minimum selectable BS date |
| `maxDate` | `NepaliDate` | — | **Inclusive** maximum selectable BS date |
| `disabledDates` | `NepaliDate[]` | — | Exact BS dates that cannot be selected |
| `isDateDisabled` | `(date: NepaliDate) => boolean` | — | `true` → not selectable |

Constraint options are additive. Malformed dates are ignored (console warning). If `minDate > maxDate`, both bounds are ignored.

### Events

Selecting a date (click / Enter / Space / Today) writes the formatted value and dispatches bubbling `change`.

**Clear** sets `input.value` to `""`, clears internal selection, dispatches `change`, and **keeps the popup open**.

### Today

Uses the BS “today” snapshot from `getCurrentBSDate()` at construction. If today is outside min/max or otherwise disabled, the Today control is disabled and does not select anything.
