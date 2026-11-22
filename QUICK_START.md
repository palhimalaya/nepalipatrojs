# Quick Start Guide

## Installation

```bash
npm install nepalipatrojs
```

Import CSS via the working export:

```ts
import 'nepalipatrojs/css';
```

Or CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nepalipatrojs/dist/nepali-patro-js.css">
```

Do **not** use `nepalipatrojs/styles` until packaging is fixed (missing `only-styles.css`, ISS-009).

## Date picker

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nepalipatrojs/dist/nepali-patro-js.css">
<input id="datePicker" placeholder="Select Nepali Date">
<script src="https://cdn.jsdelivr.net/npm/nepalipatrojs/dist/nepali-patro-js.umd.js"></script>
<script>
  const input = document.getElementById('datePicker');
  const picker = new NepaliDatePicker(input, {
    format: 'YYYY-MM-DD', // default
    theme: 'light',       // or 'dark'
    language: 'en',       // or 'np' (not 'ne')
  });
</script>
```

### With constraints

```js
import { NepaliDatePicker } from 'nepalipatrojs';
import 'nepalipatrojs/css';

const picker = new NepaliDatePicker(input, {
  format: 'MMMM D, YYYY',
  language: 'np',
  minDate: { year: 2080, month: 1, day: 1 },
  maxDate: { year: 2085, month: 12, day: 30 },
  disabledDates: [{ year: 2081, month: 5, day: 15 }],
  isDateDisabled: (d) => d.day === 1, // dynamic
});

picker.destroy(); // remove listeners + popup
```

**Behavior notes**

- Grid is **BS-primary**; each cell shows a secondary AD day; footer shows AD for the **focused** BS date.
- **Today** / day select closes the popup and fires `change`.
- **Clear** empties the input, fires `change`, keeps the popup open.
- `minDate` / `maxDate` / `disabledDates` are snapshotted at construction; `isDateDisabled` is evaluated dynamically.

Full options: [docs/api/datepicker.md](docs/api/datepicker.md).

## Conversion

Prefer **date-only** APIs (timezone-independent):

```js
import NepaliPatro, { convertAdToBs, convertBsToAd } from 'nepalipatrojs';

convertAdToBs({ year: 2022, month: 1, day: 1 });
// { year: 2078, month: 9, day: 17 }

convertBsToAd({ year: 2078, month: 9, day: 17 });
// { year: 2022, month: 1, day: 1 }

// Legacy Date wrappers (Date uses local Y/M/D):
NepaliPatro.convertADToBS([2024, 1, 1]);
// { year: 2080, month: 9, day: 16 }

NepaliPatro.getCurrentBSDate(); // local “today” in BS
```

Supported BS years: **2000–2099**. Dataset provenance is **unknown** (ISS-016) — round-trips prove consistency, not historical authority. See [README.md](README.md#supported-range-and-data-honesty).

## Formatting

```js
const bsDate = { year: 2081, month: 1, day: 15 };

NepaliPatro.formatBS(bsDate, 'YYYY-MM-DD');                 // 2081-01-15
NepaliPatro.formatBS(bsDate, 'MMMM D, YYYY');               // Baisakh 15, 2081
NepaliPatro.formatBS(bsDate, 'MMMM D, YYYY', { language: 'np' });
// बैशाख १५, २०८१
```

Use `language: 'np'` for Nepali digits and names. **`ne` is not supported** as a locale id today (ISS-005).

### Format tokens

| Token | Example |
|-------|---------|
| `YYYY` / `YY` | 2081 / 81 |
| `MMMM` / `MMM` | Baisakh / Bai |
| `MM` / `M` | 01 / 1 |
| `DD` / `D` | 15 / 15 |
| `dddd` / `ddd` / `d` | Weekday name / short / index |
| `[text]` | Literal text |

## Options reference

### `NepaliDatePickerOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | string | `'YYYY-MM-DD'` | Input value format |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme class |
| `language` | `'en' \| 'np'` | `'en'` | UI + digits |
| `zIndex` | number | `999999` | Popup stacking |
| `minDate` / `maxDate` | `NepaliDate` | — | Inclusive BS bounds (copied) |
| `disabledDates` | `NepaliDate[]` | — | Snapshotted disabled list |
| `isDateDisabled` | `(d) => boolean` | — | Dynamic disable predicate |

### Formatting options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `language` | `'en' \| 'np'` | `'en'` | Digits and localized names |

## Using the vanilla picker inside frameworks

There is **no first-party React/Vue package yet** (deferred). You can mount the vanilla class and call `destroy()` on unmount:

### React (vanilla wrapper)

```jsx
import { useEffect, useRef } from 'react';
import { NepaliDatePicker } from 'nepalipatrojs';
import 'nepalipatrojs/css';

function DatePickerComponent() {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const picker = new NepaliDatePicker(inputRef.current, {
      format: 'YYYY-MM-DD',
      theme: 'light',
    });
    return () => picker.destroy();
  }, []);

  return <input ref={inputRef} placeholder="Select Date" />;
}
```

### Vue (vanilla wrapper)

```vue
<template>
  <input ref="datePicker" placeholder="Select Date" />
</template>

<script>
import { NepaliDatePicker } from 'nepalipatrojs';
import 'nepalipatrojs/css';

export default {
  mounted() {
    this.picker = new NepaliDatePicker(this.$refs.datePicker, {
      format: 'YYYY-MM-DD',
      theme: 'dark',
    });
  },
  beforeUnmount() {
    this.picker?.destroy();
  },
};
</script>
```

### Angular (vanilla wrapper)

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { NepaliDatePicker } from 'nepalipatrojs';

@Component({
  selector: 'app-date-picker',
  template: '<input #datePicker placeholder="Select Date">',
})
export class DatePickerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('datePicker') datePickerRef!: ElementRef<HTMLInputElement>;
  private picker?: NepaliDatePicker;

  ngAfterViewInit() {
    this.picker = new NepaliDatePicker(this.datePickerRef.nativeElement, {
      format: 'YYYY-MM-DD',
    });
  }

  ngOnDestroy() {
    this.picker?.destroy();
  }
}
```

Remember to include `nepalipatrojs/css` in global styles for framework apps.
