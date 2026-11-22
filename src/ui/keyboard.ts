/**
 * Pure BS calendar keyboard navigation (Phase 3 Stage 3.3).
 * Week starts on Sunday — matches grid weekday columns (0=Sunday … 6=Saturday).
 */

import { getDaysInMonth } from '../core/calendar';
import { MAX_BS_YEAR, MIN_BS_YEAR } from '../core/calendar-data';
import { getBsWeekdayIndex } from '../core/converters/date-only';
import { NepaliDate } from '../core/types';

export type CalendarNavKey =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown';

const NAV_KEYS = new Set<string>([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

export function isCalendarNavKey(key: string): key is CalendarNavKey {
  return NAV_KEYS.has(key);
}

/** Weekday 0=Sunday … 6=Saturday (same as `grid.ts`). */
export function bsWeekdayIndex0(date: NepaliDate): number {
  try {
    return getBsWeekdayIndex(date) - 1;
  } catch {
    return 0;
  }
}

function daysInMonthSafe(year: number, month: number): number {
  try {
    return getDaysInMonth(year, month);
  } catch {
    if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
      return 30;
    }
    throw new Error(`Invalid BS month ${year}-${month}`);
  }
}

export function clampDay(year: number, month: number, day: number): NepaliDate {
  const dim = daysInMonthSafe(year, month);
  const d = Math.min(Math.max(1, day), dim);
  return { year, month, day: d };
}

/** Add (possibly negative) civil days across BS month/year boundaries. */
export function addDaysBs(date: NepaliDate, delta: number): NepaliDate {
  let { year, month, day } = date;
  let remaining = delta;

  while (remaining !== 0) {
    if (remaining > 0) {
      const dim = daysInMonthSafe(year, month);
      if (day + remaining <= dim) {
        return { year, month, day: day + remaining };
      }
      remaining -= dim - day + 1;
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    } else {
      if (day + remaining >= 1) {
        return { year, month, day: day + remaining };
      }
      remaining += day;
      month -= 1;
      if (month < 1) {
        month = 12;
        year -= 1;
      }
      day = daysInMonthSafe(year, month);
    }
  }

  return { year, month, day };
}

export function startOfWeekBs(date: NepaliDate): NepaliDate {
  return addDaysBs(date, -bsWeekdayIndex0(date));
}

export function endOfWeekBs(date: NepaliDate): NepaliDate {
  return addDaysBs(date, 6 - bsWeekdayIndex0(date));
}

export function shiftMonthClamped(
  date: NepaliDate,
  deltaMonths: number
): NepaliDate {
  let year = date.year;
  let month = date.month + deltaMonths;
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  return clampDay(year, month, date.day);
}

/**
 * Move the focused date for a navigation key.
 * Week convention: Sunday start / Saturday end (matches rendered grid).
 */
export function navigateFocusedDate(
  focused: NepaliDate,
  key: CalendarNavKey
): NepaliDate {
  switch (key) {
    case 'ArrowLeft':
      return addDaysBs(focused, -1);
    case 'ArrowRight':
      return addDaysBs(focused, 1);
    case 'ArrowUp':
      return addDaysBs(focused, -7);
    case 'ArrowDown':
      return addDaysBs(focused, 7);
    case 'Home':
      return startOfWeekBs(focused);
    case 'End':
      return endOfWeekBs(focused);
    case 'PageUp':
      return shiftMonthClamped(focused, -1);
    case 'PageDown':
      return shiftMonthClamped(focused, 1);
    default:
      return focused;
  }
}

export type SelectablePredicate = (date: NepaliDate) => boolean;

function compareBs(a: NepaliDate, b: NepaliDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/** First selectable day at or after `start` stepping by `dir` (±1). */
export function findSelectableAlong(
  start: NepaliDate,
  dir: 1 | -1,
  isSelectable: SelectablePredicate,
  maxSteps = 800
): NepaliDate | null {
  let cur = start;
  for (let i = 0; i < maxSteps; i++) {
    if (isSelectable(cur)) return cur;
    cur = addDaysBs(cur, dir);
  }
  return null;
}

/** Nearest selectable day in the same BS month as `anchor`, or null. */
export function nearestSelectableInMonth(
  anchor: NepaliDate,
  isSelectable: SelectablePredicate
): NepaliDate | null {
  const dim = daysInMonthSafe(anchor.year, anchor.month);
  const clamped = clampDay(anchor.year, anchor.month, anchor.day);
  if (isSelectable(clamped)) return clamped;
  for (let dist = 1; dist < dim; dist++) {
    const before = clamped.day - dist;
    if (before >= 1) {
      const d = { year: anchor.year, month: anchor.month, day: before };
      if (isSelectable(d)) return d;
    }
    const after = clamped.day + dist;
    if (after <= dim) {
      const d = { year: anchor.year, month: anchor.month, day: after };
      if (isSelectable(d)) return d;
    }
  }
  return null;
}

/**
 * Keyboard navigation that skips disabled / out-of-range dates.
 * If no selectable date is found, returns the original `focused`.
 */
export function navigateFocusedDateSelectable(
  focused: NepaliDate,
  key: CalendarNavKey,
  isSelectable: SelectablePredicate
): NepaliDate {
  if (key === 'Home') {
    const start = startOfWeekBs(focused);
    const end = endOfWeekBs(focused);
    let cur = start;
    while (compareBs(cur, end) <= 0) {
      if (isSelectable(cur)) return cur;
      cur = addDaysBs(cur, 1);
    }
    return focused;
  }

  if (key === 'End') {
    const start = startOfWeekBs(focused);
    const end = endOfWeekBs(focused);
    let cur = end;
    while (compareBs(cur, start) >= 0) {
      if (isSelectable(cur)) return cur;
      cur = addDaysBs(cur, -1);
    }
    return focused;
  }

  if (key === 'PageUp' || key === 'PageDown') {
    const shifted = navigateFocusedDate(focused, key);
    return nearestSelectableInMonth(shifted, isSelectable) ?? focused;
  }

  const candidate = navigateFocusedDate(focused, key);
  if (isSelectable(candidate)) return candidate;

  const dir: 1 | -1 =
    key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
  return findSelectableAlong(candidate, dir, isSelectable) ?? focused;
}

/** Initial grid focus: selected if in view, else today if in view, else day 1. */
export function initialFocusedDate(
  viewYear: number,
  viewMonth: number,
  selected: NepaliDate | null,
  today: NepaliDate
): NepaliDate {
  if (
    selected &&
    selected.year === viewYear &&
    selected.month === viewMonth
  ) {
    return { ...selected };
  }
  if (today.year === viewYear && today.month === viewMonth) {
    return { ...today };
  }
  return { year: viewYear, month: viewMonth, day: 1 };
}

/** Prefer a selectable focus target; fall back to `preferred` if none exist nearby. */
export function resolveInitialFocus(
  preferred: NepaliDate,
  isSelectable: SelectablePredicate
): NepaliDate {
  if (isSelectable(preferred)) return preferred;
  const inMonth = nearestSelectableInMonth(preferred, isSelectable);
  if (inMonth) return inMonth;
  return (
    findSelectableAlong(preferred, 1, isSelectable) ??
    findSelectableAlong(preferred, -1, isSelectable) ??
    preferred
  );
}
