/**
 * Date selection constraints (Phase 3 Stage 3.5).
 * Pure BS date-only comparisons — no DOM, no timezone APIs.
 *
 * Semantics:
 * - `minDate` / `maxDate` are **inclusive** and **snapshotted** at normalize/construct
 *   (copied civil triples — later mutation of the caller's objects is ignored).
 * - `disabledDates` is **snapshotted** into a new array of copied triples at
 *   normalize/construct — mutating or replacing the caller's array afterward
 *   does not change picker behavior.
 * - `isDateDisabled` is retained by **reference** and evaluated **dynamically**
 *   on every availability check (render, click, keyboard, Today).
 * - A date is disabled if outside [min, max], listed in the snapshotted
 *   `disabledDates`, or `isDateDisabled(date)` returns true.
 * - Contradictory min > max → both bounds ignored (with warning at normalize time).
 * - Malformed dates (invalid month/day) → that constraint ignored.
 */

import { getDaysInMonth } from '../core/calendar';
import { NepaliDate } from '../core/types';

export interface DateConstraintsInput {
  minDate?: NepaliDate;
  maxDate?: NepaliDate;
  disabledDates?: NepaliDate[];
  isDateDisabled?: (date: NepaliDate) => boolean;
}

export interface DateConstraints {
  minDate: NepaliDate | null;
  maxDate: NepaliDate | null;
  disabledDates: NepaliDate[];
  isDateDisabled: ((date: NepaliDate) => boolean) | null;
}

export function compareBsDates(a: NepaliDate, b: NepaliDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function sameBsDate(a: NepaliDate, b: NepaliDate): boolean {
  return compareBsDates(a, b) === 0;
}

export function isValidBsCivilDate(date: NepaliDate): boolean {
  if (
    !date ||
    !Number.isFinite(date.year) ||
    !Number.isFinite(date.month) ||
    !Number.isFinite(date.day)
  ) {
    return false;
  }
  if (date.month < 1 || date.month > 12 || date.day < 1) {
    return false;
  }
  try {
    return date.day <= getDaysInMonth(date.year, date.month);
  } catch {
    return false;
  }
}

/**
 * Normalize constructor options into a safe constraint object.
 * Does not throw — invalid pieces are dropped and optionally warned.
 */
export function normalizeConstraints(
  input: DateConstraintsInput = {},
  warn: (message: string) => void = console.warn
): DateConstraints {
  let minDate: NepaliDate | null = null;
  let maxDate: NepaliDate | null = null;

  if (input.minDate !== undefined) {
    if (isValidBsCivilDate(input.minDate)) {
      minDate = { ...input.minDate };
    } else {
      warn(
        '[NepaliDatePicker] Ignoring invalid minDate; expected a valid BS { year, month, day }.'
      );
    }
  }

  if (input.maxDate !== undefined) {
    if (isValidBsCivilDate(input.maxDate)) {
      maxDate = { ...input.maxDate };
    } else {
      warn(
        '[NepaliDatePicker] Ignoring invalid maxDate; expected a valid BS { year, month, day }.'
      );
    }
  }

  if (minDate && maxDate && compareBsDates(minDate, maxDate) > 0) {
    warn(
      '[NepaliDatePicker] minDate is after maxDate; ignoring both bounds.'
    );
    minDate = null;
    maxDate = null;
  }

  // Snapshot: new array + copied triples (caller's array/objects are not retained).
  const disabledDates: NepaliDate[] = [];
  if (input.disabledDates) {
    for (const d of input.disabledDates) {
      if (isValidBsCivilDate(d)) {
        disabledDates.push({ year: d.year, month: d.month, day: d.day });
      } else {
        warn(
          '[NepaliDatePicker] Ignoring invalid entry in disabledDates.'
        );
      }
    }
  }

  // Dynamic: keep the function reference; invoke on each availability check.
  const isDateDisabled =
    typeof input.isDateDisabled === 'function' ? input.isDateDisabled : null;

  return { minDate, maxDate, disabledDates, isDateDisabled };
}

export function isDateDisabledByConstraints(
  date: NepaliDate,
  constraints: DateConstraints
): boolean {
  if (!isValidBsCivilDate(date)) {
    return true;
  }
  if (constraints.minDate && compareBsDates(date, constraints.minDate) < 0) {
    return true;
  }
  if (constraints.maxDate && compareBsDates(date, constraints.maxDate) > 0) {
    return true;
  }
  if (constraints.disabledDates.some((d) => sameBsDate(d, date))) {
    return true;
  }
  if (constraints.isDateDisabled) {
    try {
      if (constraints.isDateDisabled(date)) {
        return true;
      }
    } catch {
      return true;
    }
  }
  return false;
}

export function isDateSelectable(
  date: NepaliDate,
  constraints: DateConstraints
): boolean {
  return !isDateDisabledByConstraints(date, constraints);
}

/** Empty / unconstrained defaults. */
export function emptyConstraints(): DateConstraints {
  return {
    minDate: null,
    maxDate: null,
    disabledDates: [],
    isDateDisabled: null,
  };
}
