/**
 * Core civil-date types only (Stage 2.6).
 * Localization names, digits, and UI options live in i18n/ and ui/.
 */
/**
 * Civil calendar date (year / month / day). Not a timestamp.
 * ADR-002: foundation of timezone-independent conversion APIs.
 */
interface CalendarDate {
    year: number;
    month: number;
    day: number;
}
/** Gregorian (AD) date-only value. */
type AdDate = CalendarDate;
/**
 * Represents a Nepali date in the Bikram Sambat calendar (date-only).
 * Alias of CalendarDate for BS civil dates.
 */
interface NepaliDate {
    year: number;
    month: number;
    day: number;
}
/** Bikram Sambat date-only value (same shape as NepaliDate). */
type BsDate = NepaliDate;

/**
 * Reference dates for calendar conversion
 * 2000-01-01 BS == 1943-04-14 AD
 *
 * REF_AD_YMD is the canonical date-only epoch (ADR-002).
 * REF_AD is the legacy local-midnight Date wrapper (TZ-sensitive timestamp;
 * local Y/M/D fields always equal REF_AD_YMD).
 */
declare const REF_BS: CalendarDate;
declare const REF_AD_YMD: CalendarDate;

/**
 * Legacy AD → BS converter (ADR-002).
 *
 * - `Date` input: extracts **local** calendar fields (`getFullYear` / `getMonth`+1 / `getDate`).
 *   Same instant can yield different BS dates under different host timezones — intentional v1 behavior.
 * - `[year, month, day]` array (1-based month): treated as a civil date-only value (TZ-independent).
 *
 * Prefer {@link convertAdToBs} for an explicit date-only API.
 */
declare function convertADToBS(date: Date | number[]): NepaliDate;
/**
 * Gets the current date in Bikram Sambat calendar.
 * Uses the host's local civil date of "now" (timezone-sensitive by design).
 */
declare function getCurrentBSDate(): NepaliDate;

/**
 * Legacy BS → AD: returns a local-midnight `Date` (v1 local-field semantics, ADR-002).
 * Prefer {@link convertBsToAd} for timezone-independent date-only results.
 */
declare function convertBSToAD(bsDate: NepaliDate | number[]): Date;

/**
 * Date-only AD ↔ BS conversion (ADR-002).
 * Operates solely on CalendarDate values — host timezone independent.
 */
/**
 * Convert Gregorian (AD) civil date → Bikram Sambat.
 *
 * Uses BS year/month prefix tables (ISS-003) — O(log years + months), not O(days).
 */
declare function convertAdToBs(ad: CalendarDate): BsDate;
/**
 * Convert Bikram Sambat civil date → Gregorian (AD) date-only.
 */
declare function convertBsToAd(bs: CalendarDate): AdDate;
/**
 * Nepali weekday index for a BS date: 1=Aitabar … 7=Sanibar.
 * Derived from day offset vs REF (no `Date.getDay()`).
 */
declare function getBsWeekdayIndex(bs: CalendarDate): number;

/**
 * Core calendar utilities (Stage 2.3).
 * No i18n or DOM dependencies.
 */

/**
 * Gets the number of days in a Nepali month
 * @param year The Nepali year in BS calendar
 * @param month The month (1-12)
 * @returns Number of days in the specified month
 * @throws Error if data is not available for the given year
 */
declare function getDaysInMonth(year: number, month: number): number;

/**
 * Localized month and weekday display names (Stage 2.6).
 * Numeric month/day values remain domain concepts in core date types.
 */
/**
 * Month names (English transliteration)
 */
declare enum NepaliMonth {
    Baisakh = 1,
    Jestha = 2,
    Ashadh = 3,
    Shrawan = 4,
    Bhadra = 5,
    Ashwin = 6,
    Kartik = 7,
    Mangsir = 8,
    Poush = 9,
    Magh = 10,
    Falgun = 11,
    Chaitra = 12
}
/**
 * Month names (Devanagari script)
 */
declare enum NepaliMonthNepali {
    बैशाख = 1,
    जेष्ठ = 2,
    आषाढ = 3,
    श्रावण = 4,
    भाद्र = 5,
    आश्विन = 6,
    कार्तिक = 7,
    मंसिर = 8,
    पौष = 9,
    माघ = 10,
    फाल्गुन = 11,
    चैत्र = 12
}
/**
 * Weekday names (English transliteration)
 */
declare enum NepaliWeekDay {
    Aitabar = 1,
    Sombar = 2,
    Mangalbar = 3,
    Budhabar = 4,
    Bihibar = 5,
    Sukrabar = 6,
    Sanibar = 7
}
/**
 * Weekday names (Devanagari script)
 */
declare enum NepaliWeekDayNepali {
    आइतबार = 1,
    सोमबार = 2,
    मंगलबार = 3,
    बुधबार = 4,
    बिहिबार = 5,
    शुक्रबार = 6,
    शनिबार = 7
}

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
interface NepaliPatroOptions {
    language?: 'en' | 'np';
    format?: string;
    returnType?: 'string' | 'object';
}
/**
 * Interface for date format patterns used in parsing
 */
interface DateFormatPattern {
    regex: RegExp;
    yearIndex: number;
    monthIndex: number;
    dayIndex: number;
    description?: string;
}

/**
 * Localization / presentation utilities.
 * No DOM dependencies. Does not import calendar conversion logic.
 */

/**
 * Converts Nepali digits to English digits
 * @param text The text containing Nepali digits to convert
 * @returns String with English digits
 */
declare function nepaliDigitsToEnglish(text: string): string;
/**
 * Gets common date format patterns for parsing various date formats
 * @returns Array of date format patterns with regex and index mappings
 */
declare function getDateFormatPatterns(): DateFormatPattern[];

/**
 * Converts English digits to Nepali digits
 * @param num The number to convert
 * @returns String with Nepali digits
 */
declare function toNepaliDigits(num: number | string): string;
/**
 * Formats a Nepali date according to the specified format string.
 *
 * Tokens are matched once from the pattern (longest-first). Substituted
 * month/weekday names are never scanned again, which prevents corruption
 * such as Mangsir → 8angsir or Budhabar → Bu4habar.
 *
 * Use `[text]` to emit literal characters that would otherwise be tokens.
 */
declare function formatBS(date: NepaliDate, format?: string, options?: NepaliPatroOptions): string;

/**
 * UI-specific option types (Stage 2.6 / 3.5).
 * Re-exported from src/index.ts for public API compatibility.
 */

/**
 * Options for the Nepali DatePicker UI component.
 *
 * Constraint options (Stage 3.5) are additive and optional:
 * - `minDate` / `maxDate` — inclusive BS bounds
 * - `disabledDates` — exact BS dates that cannot be selected
 * - `isDateDisabled` — predicate; `true` means not selectable
 */
interface NepaliDatePickerOptions {
    format?: string;
    theme?: 'light' | 'dark';
    language?: 'en' | 'np';
    zIndex?: number;
    /** Inclusive minimum selectable BS date (copied at construction). */
    minDate?: NepaliDate;
    /** Inclusive maximum selectable BS date (copied at construction). */
    maxDate?: NepaliDate;
    /**
     * Exact BS dates that cannot be selected.
     * Snapshotted at construction (array + entries copied).
     */
    disabledDates?: NepaliDate[];
    /**
     * Return true to disable a BS date (combined with min/max/list).
     * Retained by reference and evaluated dynamically on each check.
     */
    isDateDisabled?: (date: NepaliDate) => boolean;
}

declare class NepaliDatePicker {
    private static instances;
    private inputElement;
    private state;
    private floatingCalendar;
    private format;
    private theme;
    private language;
    /** Constructor `options.zIndex` (if provided). */
    private readonly constructorZIndex;
    /** Runtime override from `setZIndex()` (sticky until destroyed). */
    private runtimeZIndex;
    private readonly constraints;
    private readonly popupId;
    private readonly inputAriaBackup;
    private positionListenersAttached;
    private repositionScheduled;
    private repositionRaf;
    /** Nested scroll containers listening for ISS-025 (cleared on detach). */
    private scrollAncestors;
    /** Tracked so destroy() can remove every listener (ISS-022 / Stage 3.3). */
    private readonly onInputClick;
    private readonly onDocumentClick;
    private readonly onDocumentKeydown;
    /** Popup listeners (removed when calendar DOM is torn down). */
    private readonly onPrevMonthClick;
    private readonly onNextMonthClick;
    private readonly onMonthSelectChange;
    private readonly onYearSelectChange;
    private readonly onCalendarClick;
    private readonly onTodayClick;
    private readonly onClearClick;
    private readonly onViewportChange;
    constructor(inputElement: HTMLInputElement, options?: NepaliDatePickerOptions);
    private effectiveZIndex;
    private canSelect;
    private init;
    private setExpanded;
    private restoreInputAria;
    private toggleCalendar;
    private parseAndSetDateFromInput;
    private parseDateString;
    private parseWithMonthNames;
    private isValidBSDate;
    private openCalendar;
    private renderCalendar;
    private focusFocusedDay;
    private findDayElement;
    private moveFocusByKey;
    private setupCalendarEvents;
    private teardownCalendarDom;
    private attachPositionListeners;
    private detachPositionListeners;
    private scheduleReposition;
    private handleBSDateClick;
    private commitDate;
    private selectBSDate;
    private selectToday;
    /**
     * Clear: empty input, clear selection, fire `change`, keep popup open.
     * Does not select today or any fallback date.
     */
    private clearDate;
    private syncFocusedToView;
    private previousBSMonth;
    private nextBSMonth;
    private changeBSMonth;
    private changeBSYear;
    private positionCalendarPopup;
    private closeCalendar;
    private closeAllOtherCalendars;
    setZIndex(zIndex: number): void;
    destroy(): void;
}

declare class NepaliPatro {
    static readonly MIN_YEAR = 2000;
    static readonly MAX_YEAR = 2099;
    static readonly MIN_AD_YEAR = 1943;
    /**
     * Converts a Gregorian (AD) date to Bikram Sambat (BS)
     * @param date AD date to convert, can be a Date object or [year, month, day] array
     * @returns NepaliDate object representing the equivalent BS date
     */
    static convertADToBS(date: Date | number[]): NepaliDate;
    /**
     * Converts a Bikram Sambat (BS) date to Gregorian (AD)
     * @param bsDate BS date to convert, can be a NepaliDate object or [year, month, day] array
     * @returns JavaScript Date object representing the equivalent AD date
     */
    static convertBSToAD(bsDate: NepaliDate | number[]): Date;
    /**
     * Date-only AD → BS (timezone-independent). Prefer over Date-based convertADToBS.
     */
    static convertAdToBs(ad: CalendarDate): NepaliDate;
    /**
     * Date-only BS → AD civil date (timezone-independent). Prefer over convertBSToAD.
     */
    static convertBsToAd(bs: CalendarDate): AdDate;
    /**
     * Gets the current date in Bikram Sambat calendar
     * @returns Current date as NepaliDate object
     */
    static getCurrentBSDate(): NepaliDate;
    /**
     * Formats a Nepali date according to the specified format string
     * @param date The Nepali date to format
     * @param format The format string
     * @param options : {} Formatting options
     * @returns Formatted date string
     */
    static formatBS(date: NepaliDate, format?: string, options?: NepaliPatroOptions): string;
    /**
     * Gets the number of days in a Nepali month
     * @param year The Nepali year in BS calendar
     * @param month The month (1-12)
     * @returns Number of days in the specified month
     */
    static getDaysInMonth(year: number, month: number): number;
    /**
     * Converts English digits to Nepali digits
     * @param num The number to convert
     * @returns String with Nepali digits
     */
    static toNepaliDigits(num: number | string): string;
    /**
     * Converts Nepali digits to English digits
     * @param text The text containing Nepali digits to convert
     * @returns String with English digits
     */
    static nepaliDigitsToEnglish(text: string): string;
    /**
     * Gets common date format patterns for parsing various date formats
     * @returns Array of date format patterns with regex and index mappings
     */
    static getDateFormatPatterns(): DateFormatPattern[];
    /**
     * Gets the current date by using .now() method
     * @returns Current date as NepaliDate object
     */
    static now(): NepaliDate;
}

export { NepaliDatePicker, NepaliMonth, NepaliMonthNepali, NepaliPatro, NepaliWeekDay, NepaliWeekDayNepali, REF_AD_YMD, REF_BS, convertADToBS, convertAdToBs, convertBSToAD, convertBsToAd, NepaliPatro as default, formatBS as formatBSDate, getBsWeekdayIndex, getCurrentBSDate, getDateFormatPatterns, getDaysInMonth, nepaliDigitsToEnglish, toNepaliDigits };
export type { AdDate, BsDate, CalendarDate, DateFormatPattern, NepaliDate, NepaliDatePickerOptions, NepaliPatroOptions };
