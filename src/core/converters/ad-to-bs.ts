import { NepaliDate } from '../types';
import { convertAdToBs } from './date-only';

/**
 * Legacy AD → BS converter (ADR-002).
 *
 * - `Date` input: extracts **local** calendar fields (`getFullYear` / `getMonth`+1 / `getDate`).
 *   Same instant can yield different BS dates under different host timezones — intentional v1 behavior.
 * - `[year, month, day]` array (1-based month): treated as a civil date-only value (TZ-independent).
 *
 * Prefer {@link convertAdToBs} for an explicit date-only API.
 */
export function convertADToBS(date: Date | number[]): NepaliDate {
  let adYear: number;
  let adMonth: number;
  let adDay: number;

  if (date instanceof Date) {
    adYear = date.getFullYear();
    adMonth = date.getMonth() + 1;
    adDay = date.getDate();
  } else if (Array.isArray(date) && date.length >= 3) {
    adYear = date[0];
    adMonth = date[1];
    adDay = date[2];
  } else {
    throw new Error(
      'Invalid date format. Provide a Date object or [year, month, day] array.'
    );
  }

  return convertAdToBs({ year: adYear, month: adMonth, day: adDay });
}

/**
 * Gets the current date in Bikram Sambat calendar.
 * Uses the host's local civil date of "now" (timezone-sensitive by design).
 */
export function getCurrentBSDate(): NepaliDate {
  return convertADToBS(new Date());
}
