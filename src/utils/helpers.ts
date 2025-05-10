import { BS_CALENDAR_DATA, MAX_BS_YEAR, MIN_BS_YEAR } from '../constants/calendar-data';
import { NepaliDate } from '../types';

/**
 * Gets the number of days in a Nepali month
 * @param year The Nepali year in BS calendar
 * @param month The month (1-12)
 * @returns Number of days in the specified month
 * @throws Error if data is not available for the given year
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  
  if (!BS_CALENDAR_DATA[year]) {
    throw new Error(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
  }
  
  return BS_CALENDAR_DATA[year][0][month - 1];
}

/**
 * Parses different date input formats into a standardized object
 * @param date Date input, either as a NepaliDate object or [year, month, day] array
 * @returns Standardized date object with year, month, and day properties
 * @throws Error if the date format is invalid
 */
export function parseDateInput(date: NepaliDate | number[]): { year: number; month: number; day: number } {
  if (typeof date === 'string') {
    throw new Error('Invalid date format. Provide a NepaliDate object or [year, month, day] array.');
  }
  
  if ('year' in date && typeof date.year === 'number') {
    return {
      year: date.year,
      month: date.month,
      day: date.day
    };
  } else if (Array.isArray(date) && date.length >= 3) {
    return {
      year: date[0],
      month: date[1],
      day: date[2]
    };
  } else {
    throw new Error('Invalid date format. Provide a NepaliDate object or [year, month, day] array.');
  }
}
