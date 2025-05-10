import { MIN_BS_YEAR, MAX_BS_YEAR, MIN_AD_YEAR, BS_CALENDAR_DATA } from '../constants/calendar-data';
import { NepaliDate } from '../types';

/**
 * Validates a Bikram Sambat (BS) date
 * @param year The BS year to validate
 * @param month The month to validate (1-12)
 * @param day Optional day to validate
 * @throws Error if the date is invalid or out of supported range
 */
export function validateBsDate(year: number, month: number, day?: number): void {
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
    throw new Error(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
  }
  
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  
  if (day !== undefined) {
    if (!BS_CALENDAR_DATA[year]) {
      throw new Error(`Data not available for year ${year}`);
    }
    
    const daysInMonth = BS_CALENDAR_DATA[year][month - 1] as number;
    if (day < 1 || day > daysInMonth) {
      throw new Error(`Day must be between 1 and ${daysInMonth} for month ${month} in year ${year}`);
    }
  }
}

/**
 * Validates a Gregorian (AD) date
 * @param year The AD year to validate
 * @param month The month to validate (1-12)
 * @param day Optional day to validate
 * @throws Error if the date is invalid or out of supported range
 */
export function validateAdDate(year: number, month: number, day?: number): void {
  if (year < MIN_AD_YEAR) {
    throw new Error(`Date out of range. Minimum supported AD year is ${MIN_AD_YEAR}`);
  }
  
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  
  if (day !== undefined) {
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      throw new Error(`Day must be between 1 and ${daysInMonth} for month ${month} in year ${year}`);
    }
  }
}