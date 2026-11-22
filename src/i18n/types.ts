/**
 * i18n / formatting option and pattern types (Stage 2.6).
 *
 * NepaliPatroOptions: inspected — used by formatBS and the public facade.
 * Defined here (not in index.ts) to avoid i18n → facade circular imports.
 * Re-exported unchanged from src/index.ts.
 */

/**
 * Configuration options for date formatting (and related facade methods).
 */
export interface NepaliPatroOptions {
  language?: 'en' | 'np';
  format?: string;
  returnType?: 'string' | 'object';
}

/**
 * Interface for date format patterns used in parsing
 */
export interface DateFormatPattern {
  regex: RegExp;
  yearIndex: number;
  monthIndex: number;
  dayIndex: number;
  description?: string;
}
