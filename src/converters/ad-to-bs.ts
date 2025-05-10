import { NepaliDate } from '../types';
import { validateAdDate } from '../utils/validations';
import { BS_CALENDAR_DATA, REF_BS, REF_AD, MAX_BS_YEAR, MIN_BS_YEAR } from '../constants/calendar-data';
import { getDaysInMonth } from '../utils/helpers';

/**
 * Calculates the number of days between two AD dates
 * @param date1 The first date
 * @param date2 The second date
 * @returns Number of days between the two dates
 */
function daysBetweenAD(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((date2.getTime() - date1.getTime()) / msPerDay);
}

/**
 * Converts a Gregorian (AD) date to Bikram Sambat (BS) date
 * @param date Date to convert, can be a Date object or [year, month, day] array
 * @returns NepaliDate object representing the equivalent BS date
 * @throws Error if date is in invalid format or out of supported range
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
    throw new Error('Invalid date format. Provide a Date object or [year, month, day] array.');
  }

  validateAdDate(adYear, adMonth, adDay);

  const inputAD = new Date(adYear, adMonth - 1, adDay);
  const daysDiff = daysBetweenAD(REF_AD, inputAD);

  let bsYear = REF_BS.year;
  let bsMonth = REF_BS.month;
  let bsDay = REF_BS.day;
  let daysLeft = daysDiff;

  while (daysLeft > 0) {
    const daysInMonth = getDaysInMonth(bsYear, bsMonth);
    if (bsDay < daysInMonth) {
      bsDay++;
    } else {
      bsDay = 1;
      if (bsMonth < 12) {
        bsMonth++;
      } else {
        bsMonth = 1;
        bsYear++;
        if (!BS_CALENDAR_DATA[bsYear]) {
          throw new Error(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
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
          throw new Error(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
        }
        bsMonth = 12;
      }
      bsDay = getDaysInMonth(bsYear, bsMonth);
    }
    daysLeft++;
  }
  return {
    year: bsYear,
    month: bsMonth,
    day: bsDay
  };
}

/**
 * Gets the current date in Bikram Sambat calendar
 * @returns Current date as NepaliDate object
 */
export function getCurrentBSDate(): NepaliDate {
  return convertADToBS(new Date());
}