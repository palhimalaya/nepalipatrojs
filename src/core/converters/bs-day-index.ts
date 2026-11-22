import { CalendarDate } from '../types';
import { BS_CALENDAR_DATA, REF_BS } from '../calendar-data';
import { getDaysInMonth } from '../calendar';

type Ymd = CalendarDate;

function compareBs(a: Ymd, b: Ymd): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/**
 * Absolute day index of a BS date relative to REF_BS (2000-01-01 = 0).
 */
export function daysFromRefBs(date: Ymd): number {
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
 */
export function daysBetweenBS(date1: Ymd, date2: Ymd): number {
  if (compareBs(date1, date2) === 0) return 0;
  return daysFromRefBs(date2) - daysFromRefBs(date1);
}
