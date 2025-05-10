import { NepaliDate } from '../types';
import { validateBsDate } from '../utils/validations';
import { REF_BS, REF_AD } from '../constants/calendar-data';
import { getDaysInMonth, parseDateInput } from '../utils/helpers';

function daysBetweenBS(
  date1: { year: number; month: number; day: number },
  date2: { year: number; month: number; day: number }
): number {
  let days = 0;
  
  if (
    date1.year > date2.year ||
    (date1.year === date2.year && date1.month > date2.month) ||
    (date1.year === date2.year && date1.month === date2.month && date1.day > date2.day)
  ) {
    return -daysBetweenBS(date2, date1);
  }
  
  if (date1.year === date2.year && date1.month === date2.month && date1.day === date2.day) {
    return 0;
  }
  
  days += getDaysInMonth(date1.year, date1.month) - date1.day;
  
  let currentYear = date1.year;
  let currentMonth = date1.month + 1;
  
  while (currentYear < date2.year || (currentYear === date2.year && currentMonth < date2.month)) {
    if (currentMonth > 12) {
      currentYear++;
      currentMonth = 1;
    }
    days += getDaysInMonth(currentYear, currentMonth);
    currentMonth++;
  }
  
  days += date2.day;
  
  return days;
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