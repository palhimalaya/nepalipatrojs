import {
  NepaliDate,
  NepaliMonth,
  NepaliMonthNepali,
  NepaliWeekDay,
  NepaliWeekDayNepali,
  NepaliPatroOptions,
  NepaliDatePickerOptions,
} from "./types";
import {
  BS_CALENDAR_DATA,
  MIN_BS_YEAR,
  MAX_BS_YEAR,
  MIN_AD_YEAR,
} from "./constants/calendar-data";
import { convertADToBS, getCurrentBSDate } from "./converters/ad-to-bs";
import { convertBSToAD } from "./converters/bs-to-ad";
import { getDaysInMonth } from "./utils/helpers";
import {
  formatBS as formatBSDate,
  toNepaliDigits,
} from "./formatters/date-formatter";
import { NepaliDatePicker } from "./ui/NepaliDatePicker";
class NepaliPatro {
  static readonly MIN_YEAR = MIN_BS_YEAR;
  static readonly MAX_YEAR = MAX_BS_YEAR;
  static readonly MIN_AD_YEAR = MIN_AD_YEAR;

  /**
   * Converts a Gregorian (AD) date to Bikram Sambat (BS)
   * @param date AD date to convert, can be a Date object or [year, month, day] array
   * @returns NepaliDate object representing the equivalent BS date
   */
  static convertADToBS(date: Date | number[]): NepaliDate {
    return convertADToBS(date);
  }

  /**
   * Converts a Bikram Sambat (BS) date to Gregorian (AD)
   * @param bsDate BS date to convert, can be a NepaliDate object or [year, month, day] array
   * @returns JavaScript Date object representing the equivalent AD date
   */
  static convertBSToAD(bsDate: NepaliDate | number[]): Date {
    return convertBSToAD(bsDate);
  }

  /**
   * Gets the current date in Bikram Sambat calendar
   * @returns Current date as NepaliDate object
   */
  static getCurrentBSDate(): NepaliDate {
    return getCurrentBSDate();
  }

  /**
   * Formats a Nepali date according to the specified format string
   * @param date The Nepali date to format
   * @param format The format string
   * @param options : {} Formatting options
   * @returns Formatted date string
   */
  static formatBS(
    date: NepaliDate,
    format: string = "YYYY-MM-DD",
    options: NepaliPatroOptions = {},
  ): string {
    return formatBSDate(date, format, options);
  }

  /**
   * Gets the number of days in a Nepali month
   * @param year The Nepali year in BS calendar
   * @param month The month (1-12)
   * @returns Number of days in the specified month
   */
  static getDaysInMonth(year: number, month: number): number {
    return getDaysInMonth(year, month);
  }

  /**
   * Converts English digits to Nepali digits
   * @param num The number to convert
   * @returns String with Nepali digits
   */
  static toNepaliDigits(num: number | string): string {
    return toNepaliDigits(num);
  }

  /**
   * Gets the current date by using .now() method
   * @returns Current date as NepaliDate object
   */
  static now(): NepaliDate {
    return this.getCurrentBSDate();
  }
}

// Named exports
export {
  NepaliDate,
  NepaliMonth,
  NepaliMonthNepali,
  NepaliWeekDay,
  NepaliWeekDayNepali,
  NepaliPatroOptions,
  NepaliDatePicker,
  NepaliDatePickerOptions,
  convertADToBS,
  convertBSToAD,
  getCurrentBSDate,
  formatBSDate,
  toNepaliDigits,
  getDaysInMonth,
};

// Default export
export default NepaliPatro;

// For UMD compatibility, also export NepaliPatro as named export
export { NepaliPatro };

if (typeof window !== "undefined") {
  (window as any).NepaliDatePicker = NepaliDatePicker;
}

