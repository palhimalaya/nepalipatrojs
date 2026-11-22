/**
 * Compatibility re-export surface for Stage 2.3.
 * Prefer importing from `./calendar` or `./localization` in new internal code.
 * Public package consumers continue to use the barrel (`index.ts`).
 */

export { getDaysInMonth, parseDateInput } from './calendar';
export {
  localizeDigits,
  localizeMonth,
  nepaliDigitsToEnglish,
  getDateFormatPatterns,
} from './localization';
