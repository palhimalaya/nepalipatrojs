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
  /** Inclusive minimum selectable BS date (copied at construction). */
  minDate?: NepaliDate;
  /** Inclusive maximum selectable BS date (copied at construction). */
  maxDate?: NepaliDate;
  /**
   * Exact BS dates that cannot be selected.
   * Snapshotted at construction (array + entries copied).
   */
  disabledDates?: NepaliDate[];
  /**
   * Return true to disable a BS date (combined with min/max/list).
   * Retained by reference and evaluated dynamically on each check.
   */
  isDateDisabled?: (date: NepaliDate) => boolean;
}
