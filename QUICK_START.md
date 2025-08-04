# Quick Start Guide

## Installation

```bash
npm install nepalipatrojs
```

## Basic Usage

### Date Picker Component

```html
<!-- Include CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nepalipatrojs/dist/nepali-patro-js.css">

<!-- Input element -->
<input id="datePicker" placeholder="Select Nepali Date">

<!-- Include JS -->
<script src="https://cdn.jsdelivr.net/npm/nepalipatrojs/dist/nepali-patro-js.umd.js"></script>

<script>
  const input = document.getElementById('datePicker');
  const picker = new NepaliDatePicker(input, {
    format: 'YYYY-MM-DD',
    theme: 'light', // or 'dark'
    language: 'en'  // or 'np'
  });
</script>
```

### Date Conversion

```javascript
import NepaliPatro from 'nepalipatrojs';

// AD to BS
const bsDate = NepaliPatro.convertADToBS(new Date(2024, 0, 1));
console.log(bsDate); // { year: 2080, month: 9, day: 17 }

// BS to AD
const adDate = NepaliPatro.convertBSToAD({ year: 2081, month: 1, day: 15 });
console.log(adDate); // Date object

// Current Nepali date
const today = NepaliPatro.getCurrentBSDate();
console.log(today); // Current BS date
```

### Date Formatting

```javascript
const bsDate = { year: 2081, month: 1, day: 15 };

// Different formats
NepaliPatro.formatBS(bsDate, 'YYYY-MM-DD');    // 2081-01-15
NepaliPatro.formatBS(bsDate, 'MMMM D, YYYY');  // Baisakh 15, 2081
NepaliPatro.formatBS(bsDate, 'DD/MM/YY');      // 15/01/81

// Nepali language
NepaliPatro.formatBS(bsDate, 'MMMM D, YYYY', { language: 'ne' });
// बैशाख १५, २०८१
```

## Format Tokens

- `YYYY` - 4-digit year (2081)
- `YY` - 2-digit year (81)
- `MM` - 2-digit month (01)
- `M` - 1-digit month (1)
- `MMMM` - Month name (Baisakh)
- `DD` - 2-digit day (15)
- `D` - 1-digit day (15)

## Options

### NepaliDatePicker Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| format | string | 'MMMM D, YYYY' | Date format |
| theme | 'light' \| 'dark' | 'light' | UI theme |
| language | 'en' \| 'np' | 'en' | Display language |

### Formatting Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| language | 'en' \| 'ne' | 'en' | Output language |

## Examples

### React Integration

```jsx
import { useEffect, useRef } from 'react';
import { NepaliDatePicker } from 'nepalipatrojs';

function DatePickerComponent() {
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (inputRef.current) {
      const picker = new NepaliDatePicker(inputRef.current, {
        format: 'YYYY-MM-DD',
        theme: 'light'
      });
      
      return () => picker.destroy();
    }
  }, []);
  
  return <input ref={inputRef} placeholder="Select Date" />;
}
```

### Vue Integration

```vue
<template>
  <input ref="datePicker" placeholder="Select Date" />
</template>

<script>
import { NepaliDatePicker } from 'nepalipatrojs';

export default {
  mounted() {
    this.picker = new NepaliDatePicker(this.$refs.datePicker, {
      format: 'YYYY-MM-DD',
      theme: 'dark'
    });
  },
  beforeUnmount() {
    if (this.picker) {
      this.picker.destroy();
    }
  }
}
</script>
```

### Angular Integration

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { NepaliDatePicker } from 'nepalipatrojs';

@Component({
  selector: 'app-date-picker',
  template: '<input #datePicker placeholder="Select Date">'
})
export class DatePickerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('datePicker') datePickerRef!: ElementRef;
  private picker?: NepaliDatePicker;

  ngAfterViewInit() {
    this.picker = new NepaliDatePicker(this.datePickerRef.nativeElement, {
      format: 'YYYY-MM-DD'
    });
  }

  ngOnDestroy() {
    this.picker?.destroy();
  }
}
```
