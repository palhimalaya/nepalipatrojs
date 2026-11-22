/**
 * UI-specific option types (Stage 2.6 / 3.5).
 * Re-exported from src/index.ts for public API compatibility.
 */

import { NepaliDate } from '../core/types';

/**
 * Options for the Nepali DatePicker UI component.
 *
 * Constraint options (Stage 3.5) are additive and optional:
 * - `minDate` / `maxDate` — inclusive BS bounds
 * - `disabledDates` — exact BS dates that cannot be selected
 * - `isDateDisabled` — predicate; `true` means not selectable
 */
export interface NepaliDatePickerOptions {
  format?: string;
  theme?: 'light' | 'dark';
  language?: 'en' | 'np';
  zIndex?: number;
  /** Inclusive minimum selectable BS date. */
  minDate?: NepaliDate;
  /** Inclusive maximum selectable BS date. */
  maxDate?: NepaliDate;
  /** Exact BS dates that cannot be selected. */
  disabledDates?: NepaliDate[];
  /** Return true to disable a BS date (combined with min/max/list). */
  isDateDisabled?: (date: NepaliDate) => boolean;
}
