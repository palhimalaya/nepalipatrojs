/**
 * Core civil-date types only (Stage 2.6).
 * Localization names, digits, and UI options live in i18n/ and ui/.
 */

/**
 * Civil calendar date (year / month / day). Not a timestamp.
 * ADR-002: foundation of timezone-independent conversion APIs.
 */
export interface CalendarDate {
  year: number;
  month: number; // 1–12
  day: number;
}

/** Gregorian (AD) date-only value. */
export type AdDate = CalendarDate;

/**
 * Represents a Nepali date in the Bikram Sambat calendar (date-only).
 * Alias of CalendarDate for BS civil dates.
 */
export interface NepaliDate {
  year: number;
  month: number;
  day: number;
}

/** Bikram Sambat date-only value (same shape as NepaliDate). */
export type BsDate = NepaliDate;
