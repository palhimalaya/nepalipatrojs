# NepaliPatroJS 🇳🇵📅

A JavaScript/TypeScript library for Nepali date conversion and calendar utilities.

[![npm version](https://img.shields.io/npm/v/nepalipatrojs.svg)](https://www.npmjs.com/package/nepalipatrojs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🔄 Convert dates between Bikram Sambat (BS) and Gregorian calendar (AD)
- 📆 Get current date in Nepali calendar
- 🎨 Format Nepali dates with various format options
- 🈂️ Support for both English and Nepali (Devanagari) language output
- 📊 Get days in a month for any year in the BS calendar
- 📝 TypeScript support with full type definitions

## 📦 Installation

```bash
npm install nepalipatrojs
```

Or with yarn:

```bash
yarn add nepalipatrojs
```


## 🚀 Usage

### Import (Node, Bundlers, or TypeScript)

```typescript
// ES6 import
import NepaliPatro from 'nepalipatrojs';

// CommonJS require
const NepaliPatro = require('nepalipatrojs').default;
```

---

## 🖼️ Nepali Datepicker UI Component

The library provides a ready-to-use Nepali datepicker UI for web apps.

### Usage (Browser/UMD)

1. Include the CSS and JS in your HTML:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nepalipatrojs/dist/nepali-patro-js.css" />
<script src="https://cdn.jsdelivr.net/npm/nepalipatrojs/dist/nepali-patro-js.umd.js"></script>
```

2. Add an input element:

```html
<input id="dateInput" placeholder="Select Nepali Date" />
```

3. Initialize the datepicker:

```js
// For UMD build, NepaliDatePicker is available globally
const input = document.getElementById('dateInput');
const dp = new NepaliDatePicker(input, {
  format: 'YYYY/MM/DD', // or 'MMMM D, YYYY', etc.
  theme: 'dark',        // 'light' (default) or 'dark'
  language: 'en',       // 'en' (default) or 'np'
});
```

### Usage (ESM/TypeScript)

```typescript
import { NepaliDatePicker } from 'nepalipatrojs';

const input = document.getElementById('dateInput');
const dp = new NepaliDatePicker(input, {
  format: 'YYYY/MM/DD',
  theme: 'dark',
  language: 'np',
});
```

#### Options

| Option   | Type                | Default           | Description                                 |
|----------|---------------------|-------------------|---------------------------------------------|
| format   | string              | 'MMMM D, YYYY'    | Date format string                          |
| theme    | 'light' \| 'dark'   | 'light'           | Calendar theme                              |
| language | 'en' \| 'np'        | 'en'              | Language for month/digits                   |

#### Theming

The datepicker supports both light and dark themes. You can customize the CSS for `.nepali-datepicker-light` and `.nepali-datepicker-dark` classes.

---

### Convert AD to BS

```typescript
// Using Date object
const adDate = new Date(2022, 0, 1); // January 1, 2022
const bsDate = NepaliPatro.convertADToBS(adDate);
console.log(bsDate);
// Output: { year: 2078, month: 9, day: 17 }

// Using array [year, month, day]
const bsDate2 = NepaliPatro.convertADToBS([2022, 1, 1]); // January 1, 2022
console.log(bsDate2);
// Output: { year: 2078, month: 9, day: 17 }
```

### Convert BS to AD

```typescript
// Using object
const bsDate = { year: 2078, month: 9, day: 17 };
const adDate = NepaliPatro.convertBSToAD(bsDate);
console.log(adDate);
// Output: Date object representing January 1, 2022

// Using array [year, month, day]
const adDate2 = NepaliPatro.convertBSToAD([2078, 9, 17]);
console.log(adDate2);
// Output: Date object representing January 1, 2022
```

### Get Current BS Date

```typescript
const today = NepaliPatro.getCurrentBSDate();

//or use

const today = NepaliPatro.now()
console.log(today);
// Output: { year: 2081, month: 1, day: 28 } (if today is May 10, 2025)
```

### Format BS Date

```typescript
const bsDate = { year: 2078, month: 1, day: 15 };

// Default format (YYYY-MM-DD)
const formatted = NepaliPatro.formatBS(bsDate);
console.log(formatted); // Output: 2078-01-15

// Custom format
const customFormatted = NepaliPatro.formatBS(bsDate, 'DD/MM/YYYY');
console.log(customFormatted); // Output: 15/01/2078

// With month name
const withMonthName = NepaliPatro.formatBS(bsDate, 'MMMM D, YYYY');
console.log(withMonthName); // Output: Baisakh 15, 2078

// In Nepali language
const inNepali = NepaliPatro.formatBS(bsDate, 'MMMM D, YYYY', { language: 'ne' });
console.log(inNepali); // Output: बैशाख 15, 2078
```

### Get Days in Month

```typescript
// Get total days in Jestha 2078 BS
const daysInMonth = NepaliPatro.getDaysInMonth(2078, 2);
console.log(daysInMonth); // Output: 32
```

### Convert to Nepali Digits

```typescript
// Convert numbers to Nepali digits
const nepaliNumber = NepaliPatro.toNepaliDigits(2078);
console.log(nepaliNumber); // Output: २०७८
```

## 📚 API Reference

### `convertADToBS(date: Date | number[]): NepaliDate`

Converts a Gregorian date (AD) to Bikram Sambat date (BS).

### `convertBSToAD(bsDate: NepaliDate | number[]): Date`

Converts a Bikram Sambat date (BS) to Gregorian date (AD).

### `getCurrentBSDate(): NepaliDate`

Returns the current date in BS calendar.

### `formatBS(date: NepaliDate, format?: string, options?: NepaliPatroOptions): string`

Formats a BS date according to the given format string.

### `getDaysInMonth(year: number, month: number): number`

Returns the number of days in a given month and year in BS calendar.

### `toNepaliDigits(num: number | string): string`

Converts English digits to Nepali digits.

## 🧩 Types

```typescript
interface NepaliDate {
  year: number;
  month: number;
  day: number;
}

interface NepaliPatroOptions {
  language?: 'en' | 'ne';
  format?: string;
  returnType?: 'string' | 'object';
}
```

## 🔤 Format Tokens

| Token | Description | Example |
|-------|-------------|---------|
| YYYY | 4-digit year | 2078 |
| YY | 2-digit year | 78 |
| MM | 2-digit month | 01 |
| M | 1-digit month | 1 |
| MMMM | Month name | Baisakh |
| DD | 2-digit day | 02 |
| D | 1-digit day | 2 |


## 🌐 Browser & Bundler Compatibility

This library works in all modern browsers, Node.js, and with bundlers like Rollup, Webpack, Vite, etc.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License