import { AdDate, BsDate, CalendarDate } from '../types';
import { validateAdDate, validateBsDate } from '../utils/validations';
import {
  BS_CALENDAR_DATA,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  REF_AD_JS_WEEKDAY,
  REF_AD_YMD,
  REF_BS,
} from '../constants/calendar-data';
import { getDaysInMonth } from '../utils/helpers';
import { addGregorianDays, daysBetweenGregorian } from '../utils/gregorian';
import { daysBetweenBS, daysFromRefBs } from './bs-day-index';

/**
 * Date-only AD ↔ BS conversion (ADR-002).
 * Operates solely on CalendarDate values — host timezone independent.
 */

/**
 * Convert Gregorian (AD) civil date → Bikram Sambat.
 */
export function convertAdToBs(ad: CalendarDate): BsDate {
  validateAdDate(ad.year, ad.month, ad.day);

  const daysDiff = daysBetweenGregorian(REF_AD_YMD, ad);

  let bsYear = REF_BS.year;
  let bsMonth = REF_BS.month;
  let bsDay = REF_BS.day;
  let daysLeft = daysDiff;

  while (daysLeft > 0) {
    const dim = getDaysInMonth(bsYear, bsMonth);
    if (bsDay < dim) {
      bsDay++;
    } else {
      bsDay = 1;
      if (bsMonth < 12) {
        bsMonth++;
      } else {
        bsMonth = 1;
        bsYear++;
        if (!BS_CALENDAR_DATA[bsYear]) {
          throw new Error(
            `Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`
          );
        }
      }
    }
    daysLeft--;
  }

  while (daysLeft < 0) {
    if (bsDay > 1) {
      bsDay--;
    } else {
      if (bsMonth > 1) {
        bsMonth--;
      } else {
        bsYear--;
        if (!BS_CALENDAR_DATA[bsYear]) {
          throw new Error(
            `Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`
          );
        }
        bsMonth = 12;
      }
      bsDay = getDaysInMonth(bsYear, bsMonth);
    }
    daysLeft++;
  }

  return { year: bsYear, month: bsMonth, day: bsDay };
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
