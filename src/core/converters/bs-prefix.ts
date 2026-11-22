import {
  BS_CALENDAR_DATA,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
} from '../constants/calendar-data';
import { CalendarDate } from '../types';

/**
 * Internal BS day-index prefix tables derived from BS_CALENDAR_DATA (ISS-003).
 * Not part of the public API.
 *
 * yearStart[i]  = cumulative days from REF_BS to the start of year (MIN_BS_YEAR + i)
 * monthStart[i*12 + m] = day offset of month m+1 within that year (0-based m)
 * monthLength[i*12 + m] = days in that month
 */

const YEAR_COUNT = MAX_BS_YEAR - MIN_BS_YEAR + 1;

/** Cumulative days at the start of each BS year; final entry = total supported span. */
const yearStart = new Int32Array(YEAR_COUNT + 1);
const monthStart = new Int16Array(YEAR_COUNT * 12);
const monthLength = new Int16Array(YEAR_COUNT * 12);

(function buildPrefixTables(): void {
  let cumulative = 0;
  for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
    const yi = y - MIN_BS_YEAR;
    yearStart[yi] = cumulative;
    const lengths = BS_CALENDAR_DATA[y][0];
    let withinYear = 0;
    for (let m = 0; m < 12; m++) {
      monthStart[yi * 12 + m] = withinYear;
      monthLength[yi * 12 + m] = lengths[m];
      withinYear += lengths[m];
    }
    cumulative += BS_CALENDAR_DATA[y][1];
  }
  yearStart[YEAR_COUNT] = cumulative;
})();

/** Total civil days in the supported BS span (2000-01-01 .. last day of 2099). */
export const BS_SUPPORTED_DAY_COUNT = yearStart[YEAR_COUNT];

/**
 * Map a non-negative day index from REF_BS (0 = 2000-01-01) to a BS civil date.
 * @throws if index is outside the supported span
 */
export function bsDateFromDayIndex(dayIndex: number): CalendarDate {
  if (dayIndex < 0 || dayIndex >= BS_SUPPORTED_DAY_COUNT) {
    throw new Error(
      `Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`
    );
  }

  // Largest yi such that yearStart[yi] <= dayIndex
  let lo = 0;
  let hi = YEAR_COUNT - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (yearStart[mid] <= dayIndex) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  const yi = lo;
  const rem = dayIndex - yearStart[yi];
  const base = yi * 12;

  for (let m = 0; m < 12; m++) {
    const start = monthStart[base + m];
    const dim = monthLength[base + m];
    if (rem < start + dim) {
      return {
        year: MIN_BS_YEAR + yi,
        month: m + 1,
        day: rem - start + 1,
      };
    }
  }

  // Unreachable if tables are consistent with BS_CALENDAR_DATA
  throw new Error(
    `Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`
  );
}

/** Approx. bytes retained by the prefix tables (for docs / benchmarks). */
export function bsPrefixTableByteLength(): number {
  return yearStart.byteLength + monthStart.byteLength + monthLength.byteLength;
}
