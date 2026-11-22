import { AdDate, BsDate, CalendarDate } from '../types';
import { validateAdDate, validateBsDate } from '../utils/validations';
import {
  MIN_BS_YEAR,
  MAX_BS_YEAR,
  REF_AD_JS_WEEKDAY,
  REF_AD_YMD,
  REF_BS,
} from '../constants/calendar-data';
import { addGregorianDays, daysBetweenGregorian } from '../utils/gregorian';
import { daysBetweenBS, daysFromRefBs } from './bs-day-index';
import { bsDateFromDayIndex } from './bs-prefix';

/**
 * Date-only AD ↔ BS conversion (ADR-002).
 * Operates solely on CalendarDate values — host timezone independent.
 */

/**
 * Convert Gregorian (AD) civil date → Bikram Sambat.
 *
 * Uses BS year/month prefix tables (ISS-003) — O(log years + months), not O(days).
 */
export function convertAdToBs(ad: CalendarDate): BsDate {
  validateAdDate(ad.year, ad.month, ad.day);

  const daysDiff = daysBetweenGregorian(REF_AD_YMD, ad);

  // Dates before REF or past the last supported BS day: same error as the old walk.
  if (daysDiff < 0) {
    throw new Error(
      `Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`
    );
  }

  return bsDateFromDayIndex(daysDiff);
}

/**
 * Convert Bikram Sambat civil date → Gregorian (AD) date-only.
 */
export function convertBsToAd(bs: CalendarDate): AdDate {
  validateBsDate(bs.year, bs.month, bs.day);
  const daysDiff = daysBetweenBS(REF_BS, bs);
  return addGregorianDays(REF_AD_YMD, daysDiff);
}

/**
 * Nepali weekday index for a BS date: 1=Aitabar … 7=Sanibar.
 * Derived from day offset vs REF (no `Date.getDay()`).
 */
export function getBsWeekdayIndex(bs: CalendarDate): number {
  validateBsDate(bs.year, bs.month, bs.day);
  const days = daysFromRefBs(bs);
  const jsDay = (((REF_AD_JS_WEEKDAY + days) % 7) + 7) % 7;
  return jsDay + 1;
}

/**
 * Nepali weekday index for an AD civil date (same numbering).
 */
export function getAdWeekdayIndex(ad: CalendarDate): number {
  const days = daysBetweenGregorian(REF_AD_YMD, ad);
  const jsDay = (((REF_AD_JS_WEEKDAY + days) % 7) + 7) % 7;
  return jsDay + 1;
}
