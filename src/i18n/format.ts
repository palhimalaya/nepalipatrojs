import { NepaliDate } from '../core/types';
import { getBsWeekdayIndex } from '../core/converters/date-only';
import { NEPALI_DIGITS } from './digits';
import {
  NepaliMonth,
  NepaliMonthNepali,
  NepaliWeekDay,
  NepaliWeekDayNepali,
} from './names';
import { NepaliPatroOptions } from './types';

/**
 * Converts English digits to Nepali digits
 * @param num The number to convert
 * @returns String with Nepali digits
 */
export function toNepaliDigits(num: number | string): string {
  return num.toString().replace(/[0-9]/g, (match) => NEPALI_DIGITS[parseInt(match)]);
}

/**
 * Format tokens, longest first so one pass never rewrites substituted text.
 * Bracket groups `[...]` are literals (content emitted as-is).
 */
const FORMAT_TOKEN =
  /\[([^\]]*)\]|YYYY|YY|MMMM|MMM|MM|M|dddd|ddd|DD|D|d/g;

/**
 * Formats a Nepali date according to the specified format string.
 *
 * Tokens are matched once from the pattern (longest-first). Substituted
 * month/weekday names are never scanned again, which prevents corruption
 * such as Mangsir → 8angsir or Budhabar → Bu4habar.
 *
 * Use `[text]` to emit literal characters that would otherwise be tokens.
 */
export function formatBS(
  date: NepaliDate,
  format: string = 'YYYY-MM-DD',
  options: NepaliPatroOptions = {}
): string {
  const { language = 'en' } = options;
  const useNepaliDigits = language === 'np';

  // Weekday from civil day index (ADR-002) — not Date.getDay().
  const weekDay = getBsWeekdayIndex(date);

  const digits = (value: number | string): string =>
    useNepaliDigits ? toNepaliDigits(value) : String(value);

  const pad2 = (n: number): string => n.toString().padStart(2, '0');

  const monthName =
    language === 'en' ? NepaliMonth[date.month] : NepaliMonthNepali[date.month];
  const monthShort =
    language === 'en' ? NepaliMonth[date.month].substring(0, 3) : NepaliMonthNepali[date.month];

  const weekdayName =
    language === 'en'
      ? NepaliWeekDay[weekDay]
      : NepaliWeekDayNepali[weekDay];
  const weekdayShort =
    language === 'en'
      ? NepaliWeekDay[weekDay].substring(0, 3)
      : NepaliWeekDayNepali[weekDay];

  return format.replace(FORMAT_TOKEN, (match, literal: string | undefined) => {
    if (literal !== undefined) {
      return literal;
    }

    switch (match) {
      case 'YYYY':
        return digits(date.year);
      case 'YY':
        return digits(pad2(date.year % 100));
      case 'MMMM':
        return monthName;
      case 'MMM':
        return monthShort;
      case 'MM':
        return digits(pad2(date.month));
      case 'M':
        return digits(date.month);
      case 'dddd':
        return weekdayName;
      case 'ddd':
        return weekdayShort;
      case 'DD':
        return digits(pad2(date.day));
      case 'D':
        return digits(date.day);
      case 'd':
        return digits(weekDay);
      default:
        return match;
    }
  });
}
