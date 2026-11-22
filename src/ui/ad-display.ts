/**
 * Gregorian (AD) equivalent display helpers (Phase 3 Stage 3.6).
 * Conversion ownership: core `convertBsToAd` only (date-only, TZ-independent).
 * BS remains the selection calendar; AD is secondary presentation.
 */

import { convertBsToAd } from '../core/converters/date-only';
import { AdDate, NepaliDate } from '../core/types';
import { localizeDigits } from '../i18n/localization';

const AD_MONTH_SHORT_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export type AdDisplayLanguage = 'en' | 'np';

/** Safe BS→AD; returns null for out-of-range / invalid civil dates. */
export function convertBsToAdOrNull(bs: NepaliDate): AdDate | null {
  try {
    return convertBsToAd(bs);
  } catch {
    return null;
  }
}

/** Compact day-of-month for secondary cell subtitle (digits follow language). */
export function formatAdCellDay(
  ad: AdDate,
  language: AdDisplayLanguage
): string {
  return localizeDigits(ad.day, language);
}

/**
 * Full AD civil label for footer / accessible names.
 * Month names stay Latin short form; day/year digits follow `language`.
 */
export function formatAdFullLabel(
  ad: AdDate,
  language: AdDisplayLanguage
): string {
  const month = AD_MONTH_SHORT_EN[ad.month - 1] ?? String(ad.month);
  const day = localizeDigits(ad.day, language);
  const year = localizeDigits(ad.year, language);
  return `${day} ${month} ${year}`;
}

/** Footer line text for a BS date (empty string if conversion fails). */
export function formatAdEquivalentLine(
  bs: NepaliDate,
  language: AdDisplayLanguage
): string {
  const ad = convertBsToAdOrNull(bs);
  if (!ad) return '';
  const body = formatAdFullLabel(ad, language);
  return language === 'np' ? `ईस्वी · ${body}` : `AD · ${body}`;
}

/** Accessible AD fragment appended to BS day labels. */
export function formatAdAccessibleSuffix(
  bs: NepaliDate,
  language: AdDisplayLanguage
): string {
  const ad = convertBsToAdOrNull(bs);
  if (!ad) return '';
  const body = formatAdFullLabel(ad, language);
  return language === 'np' ? `ईस्वी ${body}` : `AD ${body}`;
}
