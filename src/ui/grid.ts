/**
 * Pure BS calendar grid model (Phase 3 Stage 3.1).
 * No DOM. Uses core getDaysInMonth + date-only weekday index (not JS Date weekday APIs).
 */

import { getDaysInMonth } from '../core/calendar';
import { MAX_BS_YEAR, MIN_BS_YEAR } from '../core/calendar-data';
import { getBsWeekdayIndex } from '../core/converters/date-only';
import { NepaliDate } from '../core/types';

export type CellKind = 'prev' | 'current' | 'next';

export interface CalendarCell {
  day: number;
  year: number;
  month: number; // 1–12
  kind: CellKind;
  selected: boolean;
  disabled: boolean;
}

export interface CalendarGridModel {
  year: number;
  month: number; // 1–12
  /** 0 = Sunday … 6 = Saturday (matches prior UI weekday columns) */
  firstWeekday: number;
  daysInMonth: number;
  cells: CalendarCell[];
}

const TOTAL_CELLS = 42;

/**
 * Days in BS month via core API.
 * Numeric fallback only for years outside MIN/MAX (adjacent-month padding).
 */
export function daysInBsMonth(
  year: number,
  month1Based: number,
  fallback = 30
): number {
  try {
    return getDaysInMonth(year, month1Based);
  } catch (err) {
    if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
      return fallback;
    }
    throw err;
  }
}

/**
 * Weekday of BS Y-M-1 as 0=Sunday…6=Saturday (date-only; TZ-independent).
 * Out-of-range / invalid → 0 (Sunday), matching prior defensive UI behavior.
 */
export function firstWeekdayOfBsMonth(year: number, month1Based: number): number {
  try {
    const nepaliIndex = getBsWeekdayIndex({ year, month: month1Based, day: 1 });
    return nepaliIndex - 1; // 1=Aitabar(Sun) → 0
  } catch {
    return 0;
  }
}

function shiftMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  let y = year;
  let m = month + delta;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return { year: y, month: m };
}

export type CellDisabledPredicate = (date: NepaliDate) => boolean;

export function buildBsMonthGrid(
  viewYear: number,
  viewMonth: number,
  selected: NepaliDate | null,
  isDisabled: CellDisabledPredicate = () => false
): CalendarGridModel {
  const daysInMonth = daysInBsMonth(viewYear, viewMonth);
  const firstWeekday = firstWeekdayOfBsMonth(viewYear, viewMonth);

  const prev = shiftMonth(viewYear, viewMonth, -1);
  const lastDayOfPrevMonth = daysInBsMonth(prev.year, prev.month);
  const next = shiftMonth(viewYear, viewMonth, 1);

  const cells: CalendarCell[] = [];

  const pushCell = (
    day: number,
    year: number,
    month: number,
    kind: CellKind
  ): void => {
    const date = { year, month, day };
    const selectedCell =
      selected !== null &&
      selected.year === year &&
      selected.month === month &&
      selected.day === day;
    cells.push({
      day,
      year,
      month,
      kind,
      selected: selectedCell,
      disabled: isDisabled(date),
    });
  };

  for (let i = 0; i < firstWeekday; i++) {
    const day = lastDayOfPrevMonth - firstWeekday + i + 1;
    pushCell(day, prev.year, prev.month, 'prev');
  }

  for (let day = 1; day <= daysInMonth; day++) {
    pushCell(day, viewYear, viewMonth, 'current');
  }

  let nextDay = 1;
  while (cells.length < TOTAL_CELLS) {
    pushCell(nextDay, next.year, next.month, 'next');
    nextDay += 1;
  }

  return {
    year: viewYear,
    month: viewMonth,
    firstWeekday,
    daysInMonth,
    cells,
  };
}
