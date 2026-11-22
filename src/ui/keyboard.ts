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

/** Initial grid focus: selected if in view, else today if in view, else day 1. */
export function initialFocusedDate(
  viewYear: number,
  viewMonth: number,
  selected: NepaliDate,
  today: NepaliDate
): NepaliDate {
  if (selected.year === viewYear && selected.month === viewMonth) {
    return { ...selected };
  }
  if (today.year === viewYear && today.month === viewMonth) {
    return { ...today };
  }
  return { year: viewYear, month: viewMonth, day: 1 };
}
