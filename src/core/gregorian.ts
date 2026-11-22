import { CalendarDate } from './types';

/**
 * Pure Gregorian (proleptic) civil-date helpers.
 * No `Date` / timezone dependence — ADR-002 date-only arithmetic.
 */

/** Days in Gregorian month (1–12). */
export function daysInGregorianMonth(year: number, month: number): number {
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  const lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isGregorianLeapYear(year)) {
    return 29;
  }
  return lengths[month - 1];
}

export function isGregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/**
 * Julian Day Number for a Gregorian civil date (integer, noon-independent).
 * Standard civil conversion; differences equal calendar day counts.
 */
export function gregorianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** Exclusive day difference: date2 − date1 in civil days. */
export function daysBetweenGregorian(a: CalendarDate, b: CalendarDate): number {
  return (
    gregorianDayNumber(b.year, b.month, b.day) -
    gregorianDayNumber(a.year, a.month, a.day)
  );
}

/** Convert Julian Day Number back to Gregorian YMD. */
export function gregorianFromDayNumber(jdn: number): CalendarDate {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/** Add (or subtract) civil days to a Gregorian date. */
export function addGregorianDays(date: CalendarDate, days: number): CalendarDate {
  return gregorianFromDayNumber(gregorianDayNumber(date.year, date.month, date.day) + days);
}
