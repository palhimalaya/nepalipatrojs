/**
 * Localization / presentation utilities (Stage 2.3).
 * No DOM dependencies. Does not import calendar conversion logic.
 */

import { NEPALI_DIGITS } from '../core/calendar-data';
import {
  DateFormatPattern,
  NepaliMonth,
  NepaliMonthNepali,
} from '../core/types';

/**
 * Localize number to Nepali digits based on language
 * @param num The number to localize
 * @param language The language code ('en' or 'np')
 * @returns Localized string with Nepali digits if language is 'np'
 */
export function localizeDigits(num: string | number, language: string): string {
  switch (language) {
    case 'np':
      return String(num)
        .split('')
        .map((digit) =>
          /\d/.test(digit) ? NEPALI_DIGITS[parseInt(digit, 10)] : digit
        )
        .join('');
    default:
      return String(num);
  }
}

/**
 * Localizes the month name based on the language
 * @param month The month number (1-12)
 * @param language The language code ('en' or 'np')
 * @returns Localized month name in either English or Nepali
 */
export function localizeMonth(month: number, language: string): string {
  if (language === 'np') {
    return NepaliMonthNepali[month];
  } else {
    return NepaliMonth[month];
  }
}

/**
 * Converts Nepali digits to English digits
 * @param text The text containing Nepali digits to convert
 * @returns String with English digits
 */
export function nepaliDigitsToEnglish(text: string): string {
  const nepaliToEnglish: { [key: string]: string } = {
    '०': '0',
    '१': '1',
    '२': '2',
    '३': '3',
    '४': '4',
    '५': '5',
    '६': '6',
    '७': '7',
    '८': '8',
    '९': '9',
  };

  return text.replace(/[०-९]/g, (match) => nepaliToEnglish[match] || match);
}

/**
 * Gets common date format patterns for parsing various date formats
 * @returns Array of date format patterns with regex and index mappings
 */
export function getDateFormatPatterns(): DateFormatPattern[] {
  return [
    {
      regex: /(\d{4})[-/.]\s*(\d{1,2})[-/.]\s*(\d{1,2})/,
      yearIndex: 1,
      monthIndex: 2,
      dayIndex: 3,
      description: 'YYYY-MM-DD format',
    },
    {
      regex: /(\d{1,2})[-/.]\s*(\d{1,2})[-/.]\s*(\d{4})/,
      yearIndex: 3,
      monthIndex: 2,
      dayIndex: 1,
      description: 'DD-MM-YYYY format',
    },
    {
      regex: /(\d{1,2})[-/.]\s*(\d{1,2})[-/.]\s*(\d{4})/,
      yearIndex: 3,
      monthIndex: 1,
      dayIndex: 2,
      description: 'MM-DD-YYYY format',
    },
    {
      regex: /(\d{4})(\d{2})(\d{2})/,
      yearIndex: 1,
      monthIndex: 2,
      dayIndex: 3,
      description: 'YYYYMMDD format',
    },
    {
      regex: /(\d{2})(\d{2})(\d{4})/,
      yearIndex: 3,
      monthIndex: 2,
      dayIndex: 1,
      description: 'DDMMYYYY format',
    },
  ];
}
