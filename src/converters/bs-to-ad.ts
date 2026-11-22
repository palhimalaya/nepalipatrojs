import { NepaliDate } from '../types';
import { parseDateInput } from '../utils/calendar';
import { convertBsToAd } from './date-only';

export { daysBetweenBS, daysFromRefBs } from './bs-day-index';

/**
 * Legacy BS → AD: returns a local-midnight `Date` (v1 local-field semantics, ADR-002).
 * Prefer {@link convertBsToAd} for timezone-independent date-only results.
 */
export function convertBSToAD(bsDate: NepaliDate | number[]): Date {
  const { year, month, day } = parseDateInput(bsDate);
  const ad = convertBsToAd({ year, month, day });
  // Local civil construction — timestamp varies by host TZ; Y/M/D fields match `ad`.
  return new Date(ad.year, ad.month - 1, ad.day);
}
