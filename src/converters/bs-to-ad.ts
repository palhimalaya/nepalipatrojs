import { NepaliDate } from '../types';
import { validateBsDate } from '../utils/validations';
import { BS_CALENDAR_DATA, REF_BS, REF_AD } from '../constants/calendar-data';
import { getDaysInMonth, parseDateInput } from '../utils/helpers';

type Ymd = { year: number; month: number; day: number };

function compareBs(a: Ymd, b: Ymd): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/**
 * Absolute day index of a BS date relative to REF_BS (2000-01-01 = 0).
 * Built from year totals and month lengths — auditable and free of rollover bugs.
 */
function daysFromRefBs(date: Ymd): number {
  let days = 0;
  for (let year = REF_BS.year; year < date.year; year++) {
    days += BS_CALENDAR_DATA[year][1];
  }
  for (let month = 1; month < date.month; month++) {
    days += getDaysInMonth(date.year, month);
  }
  days += date.day - REF_BS.day;
  return days;
}

/**
 * Number of BS calendar days from date1 to date2 (date2 - date1).
 * Negative if date2 is before date1.
 *
 * Exported for unit tests (ISS-019).
 */
export function daysBetweenBS(date1: Ymd, date2: Ymd): number {
  const cmp = compareBs(date1, date2);
  if (cmp === 0) return 0;
  return daysFromRefBs(date2) - daysFromRefBs(date1);
}

/**
 * Converts a Bikram Sambat (BS) date to Gregorian (AD) date
 * @param bsDate BS date to convert, can be a NepaliDate object or [year, month, day] array
 * @returns JavaScript Date object representing the equivalent AD date
 * @throws Error if date is invalid or out of supported range
 */
export function convertBSToAD(bsDate: NepaliDate | number[]): Date {
  const { year, month, day } = parseDateInput(bsDate);
  validateBsDate(year, month, day);

  const daysDiff = daysBetweenBS(REF_BS, { year, month, day });

  const adDate = new Date(REF_AD);
  adDate.setDate(adDate.getDate() + daysDiff);

  return adDate;
}
