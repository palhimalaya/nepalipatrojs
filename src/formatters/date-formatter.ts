import { 
  NepaliDate, 
  NepaliMonth, 
  NepaliMonthNepali,
  NepaliWeekDay,
  NepaliWeekDayNepali,
  NepaliPatroOptions 
} from '../types';
import { convertBSToAD } from '../converters/bs-to-ad';

// Nepali digits for numeric conversion
const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Converts English digits to Nepali digits
 * @param num The number to convert
 * @returns String with Nepali digits
 */
export function toNepaliDigits(num: number | string): string {
  return num.toString().replace(/[0-9]/g, (match) => NEPALI_DIGITS[parseInt(match)]);
}

/**
 * Formats a Nepali date according to the specified format string
 * @param date The Nepali date to format
 * @param format The format string
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatBS(date: NepaliDate, format: string = 'YYYY-MM-DD', options: NepaliPatroOptions = {}): string {
  const { language = 'en' } = options;
  const useNepaliDigits = language === 'np';
  
  const adDate = convertBSToAD(date);
  const weekDay = adDate.getDay() + 1;
  
  let result = format;
  
  // Year formats
  result = result.replace(/YYYY/g, useNepaliDigits 
    ? toNepaliDigits(date.year) 
    : date.year.toString());
  
  result = result.replace(/YY/g, useNepaliDigits 
    ? toNepaliDigits((date.year % 100).toString().padStart(2, '0')) 
    : (date.year % 100).toString().padStart(2, '0'));
  
  // Month formats
  // Full month name
  if (language === 'en') {
    result = result.replace(/MMMM/g, NepaliMonth[date.month]);
    result = result.replace(/MMM/g, NepaliMonth[date.month].substring(0, 3));
  } else {
    result = result.replace(/MMMM/g, NepaliMonthNepali[date.month]);
    result = result.replace(/MMM/g, NepaliMonthNepali[date.month]);
  }
  
  // Two-digit month
  result = result.replace(/MM/g, useNepaliDigits 
    ? toNepaliDigits(date.month.toString().padStart(2, '0')) 
    : date.month.toString().padStart(2, '0'));
  
  // Single-digit month
  result = result.replace(/M/g, useNepaliDigits 
    ? toNepaliDigits(date.month) 
    : date.month.toString());
  
  // Day formats
  // Two-digit day
  result = result.replace(/DD/g, useNepaliDigits 
    ? toNepaliDigits(date.day.toString().padStart(2, '0')) 
    : date.day.toString().padStart(2, '0'));
  
  // Single-digit day
  result = result.replace(/D/g, useNepaliDigits 
    ? toNepaliDigits(date.day) 
    : date.day.toString());
  
  // Weekday formats
  // Full weekday name
  if (language === 'en') {
    result = result.replace(/dddd/g, NepaliWeekDay[weekDay]);
    result = result.replace(/ddd/g, NepaliWeekDay[weekDay].substring(0, 3));
  } else {
    result = result.replace(/dddd/g, NepaliWeekDayNepali[weekDay]);
    result = result.replace(/ddd/g, NepaliWeekDayNepali[weekDay]);
  }
  
  // Numeric day of week (1-7)
  result = result.replace(/d/g, useNepaliDigits 
    ? toNepaliDigits(weekDay) 
    : weekDay.toString());
  
  return result;
}