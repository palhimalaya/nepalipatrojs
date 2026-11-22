const MIN_BS_YEAR = 2000;
const MAX_BS_YEAR = 2099;
const MIN_AD_YEAR = 1943;
/**
 * Reference dates for calendar conversion
 * 2000-01-01 BS == 1943-04-14 AD
 *
 * REF_AD_YMD is the canonical date-only epoch (ADR-002).
 * REF_AD is the legacy local-midnight Date wrapper (TZ-sensitive timestamp;
 * local Y/M/D fields always equal REF_AD_YMD).
 */
const REF_BS = { year: 2000, month: 1, day: 1 };
const REF_AD_YMD = { year: 1943, month: 4, day: 14 };
/** Legacy: local civil midnight of REF_AD_YMD. Prefer REF_AD_YMD for arithmetic. */
new Date(REF_AD_YMD.year, REF_AD_YMD.month - 1, REF_AD_YMD.day);
/**
 * JS getDay() of REF_AD_YMD (1943-04-14 was a Wednesday → 3).
 * Used for timezone-independent weekday derivation.
 */
const REF_AD_JS_WEEKDAY = 3;
/**
 * Bikram Sambat calendar data with days in each month for years 2000-2099
 * Each year entry contains:
 * 1. An array with days in each month [Baisakh, Jestha, ..., Chaitra]
 * 2. Total days in the year
 */
const BS_CALENDAR_DATA = {
    2000: [[30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 365],
    2001: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2002: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2003: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2004: [[30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 365],
    2005: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2006: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2007: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2008: [[31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31], 365],
    2009: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2010: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2011: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2012: [[31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], 365],
    2013: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2014: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2015: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2016: [[31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], 365],
    2017: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2018: [[31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2019: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 366],
    2020: [[31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2021: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2022: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], 365],
    2023: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 366],
    2024: [[31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2025: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2026: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2027: [[30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 365],
    2028: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2029: [[31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30], 365],
    2030: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2031: [[30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 365],
    2032: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2033: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2034: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2035: [[30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31], 365],
    2036: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2037: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2038: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2039: [[31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], 365],
    2040: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2041: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2042: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2043: [[31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], 365],
    2044: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2045: [[31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2046: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2047: [[31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2048: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2049: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], 365],
    2050: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 366],
    2051: [[31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2052: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2053: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], 365],
    2054: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 366],
    2055: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2056: [[31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30], 365],
    2057: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2058: [[30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 365],
    2059: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2060: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2061: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2062: [[30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31], 365],
    2063: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2064: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2065: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2066: [[31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31], 365],
    2067: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2068: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2069: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2070: [[31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], 365],
    2071: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2072: [[31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2073: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2074: [[31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2075: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2076: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], 365],
    2077: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 366],
    2078: [[31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2079: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2080: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], 365],
    2081: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 366],
    2082: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2083: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2084: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2085: [[30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 365],
    2086: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2087: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2088: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2089: [[30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], 365],
    2090: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2091: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2092: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2093: [[31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31], 365],
    2094: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2095: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
    2096: [[31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], 366],
    2097: [[31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], 365],
    2098: [[31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], 365],
    2099: [[31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], 365],
};

/**
 * Pure Gregorian (proleptic) civil-date helpers.
 * No `Date` / timezone dependence — ADR-002 date-only arithmetic.
 */
/** Days in Gregorian month (1–12). */
function daysInGregorianMonth(year, month) {
    if (month < 1 || month > 12) {
        throw new Error('Month must be between 1 and 12');
    }
    const lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && isGregorianLeapYear(year)) {
        return 29;
    }
    return lengths[month - 1];
}
function isGregorianLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
/**
 * Julian Day Number for a Gregorian civil date (integer, noon-independent).
 * Standard civil conversion; differences equal calendar day counts.
 */
function gregorianDayNumber(year, month, day) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return (day +
        Math.floor((153 * m + 2) / 5) +
        365 * y +
        Math.floor(y / 4) -
        Math.floor(y / 100) +
        Math.floor(y / 400) -
        32045);
}
/** Exclusive day difference: date2 − date1 in civil days. */
function daysBetweenGregorian(a, b) {
    return (gregorianDayNumber(b.year, b.month, b.day) -
        gregorianDayNumber(a.year, a.month, a.day));
}
/** Convert Julian Day Number back to Gregorian YMD. */
function gregorianFromDayNumber(jdn) {
    const a = jdn + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    const c = a - Math.floor((146097 * b) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);
    const day = e - Math.floor((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * Math.floor(m / 10);
    const year = 100 * b + d - 4800 + Math.floor(m / 10);
    return { year, month, day };
}
/** Add (or subtract) civil days to a Gregorian date. */
function addGregorianDays(date, days) {
    return gregorianFromDayNumber(gregorianDayNumber(date.year, date.month, date.day) + days);
}

/**
 * Validates a Bikram Sambat (BS) date
 * @param year The BS year to validate
 * @param month The month to validate (1-12)
 * @param day Optional day to validate
 * @throws Error if the date is invalid or out of supported range
 */
function validateBsDate(year, month, day) {
    if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
        throw new Error(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
    }
    if (month < 1 || month > 12) {
        throw new Error('Month must be between 1 and 12');
    }
    if (day !== undefined) {
        if (!BS_CALENDAR_DATA[year]) {
            throw new Error(`Data not available for year ${year}`);
        }
        // Dataset shape: [daysPerMonth[12], totalDays] — index month lengths via [0].
        const daysInMonth = BS_CALENDAR_DATA[year][0][month - 1];
        if (day < 1 || day > daysInMonth) {
            throw new Error(`Day must be between 1 and ${daysInMonth} for month ${month} in year ${year}`);
        }
    }
}
/**
 * Validates a Gregorian (AD) date
 * @param year The AD year to validate
 * @param month The month to validate (1-12)
 * @param day Optional day to validate
 * @throws Error if the date is invalid or out of supported range
 */
function validateAdDate(year, month, day) {
    if (year < MIN_AD_YEAR) {
        throw new Error(`Date out of range. Minimum supported AD year is ${MIN_AD_YEAR}`);
    }
    if (month < 1 || month > 12) {
        throw new Error('Month must be between 1 and 12');
    }
    if (day !== undefined) {
        const daysInMonth = daysInGregorianMonth(year, month);
        if (day < 1 || day > daysInMonth) {
            throw new Error(`Day must be between 1 and ${daysInMonth} for month ${month} in year ${year}`);
        }
    }
}

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
function getDaysInMonth(year, month) {
    if (month < 1 || month > 12) {
        throw new Error('Month must be between 1 and 12');
    }
    if (!BS_CALENDAR_DATA[year]) {
        throw new Error(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
    }
    return BS_CALENDAR_DATA[year][0][month - 1];
}
/**
 * Parses different date input formats into a standardized object
 * @param date Date input, either as a NepaliDate object or [year, month, day] array
 * @returns Standardized date object with year, month, and day properties
 * @throws Error if the date format is invalid
 */
function parseDateInput(date) {
    if (typeof date === 'string') {
        throw new Error('Invalid date format. Provide a NepaliDate object or [year, month, day] array.');
    }
    if ('year' in date && typeof date.year === 'number') {
        return {
            year: date.year,
            month: date.month,
            day: date.day,
        };
    }
    else if (Array.isArray(date) && date.length >= 3) {
        return {
            year: date[0],
            month: date[1],
            day: date[2],
        };
    }
    else {
        throw new Error('Invalid date format. Provide a NepaliDate object or [year, month, day] array.');
    }
}

function compareBs$1(a, b) {
    if (a.year !== b.year)
        return a.year - b.year;
    if (a.month !== b.month)
        return a.month - b.month;
    return a.day - b.day;
}
/**
 * Absolute day index of a BS date relative to REF_BS (2000-01-01 = 0).
 */
function daysFromRefBs(date) {
    let days = 0;
    for (let year = REF_BS.year; year < date.year; year++) {
        days += BS_CALENDAR_DATA[year][1];
    }
    for (let month = 1; month < date.month; month++) {
        days += getDaysInMonth(date.year, month);
    }
    days += date.day - REF_BS.day;
    return days;
}
/**
 * Number of BS calendar days from date1 to date2 (date2 - date1).
 */
function daysBetweenBS(date1, date2) {
    if (compareBs$1(date1, date2) === 0)
        return 0;
    return daysFromRefBs(date2) - daysFromRefBs(date1);
}

/**
 * Internal BS day-index prefix tables derived from BS_CALENDAR_DATA (ISS-003).
 * Not part of the public API.
 *
 * yearStart[i]  = cumulative days from REF_BS to the start of year (MIN_BS_YEAR + i)
 * monthStart[i*12 + m] = day offset of month m+1 within that year (0-based m)
 * monthLength[i*12 + m] = days in that month
 */
const YEAR_COUNT = MAX_BS_YEAR - MIN_BS_YEAR + 1;
/** Cumulative days at the start of each BS year; final entry = total supported span. */
const yearStart = new Int32Array(YEAR_COUNT + 1);
const monthStart = new Int16Array(YEAR_COUNT * 12);
const monthLength = new Int16Array(YEAR_COUNT * 12);
(function buildPrefixTables() {
    let cumulative = 0;
    for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
        const yi = y - MIN_BS_YEAR;
        yearStart[yi] = cumulative;
        const lengths = BS_CALENDAR_DATA[y][0];
        let withinYear = 0;
        for (let m = 0; m < 12; m++) {
            monthStart[yi * 12 + m] = withinYear;
            monthLength[yi * 12 + m] = lengths[m];
            withinYear += lengths[m];
        }
        cumulative += BS_CALENDAR_DATA[y][1];
    }
    yearStart[YEAR_COUNT] = cumulative;
})();
/** Total civil days in the supported BS span (2000-01-01 .. last day of 2099). */
const BS_SUPPORTED_DAY_COUNT = yearStart[YEAR_COUNT];
/**
 * Map a non-negative day index from REF_BS (0 = 2000-01-01) to a BS civil date.
 * @throws if index is outside the supported span
 */
function bsDateFromDayIndex(dayIndex) {
    if (dayIndex < 0 || dayIndex >= BS_SUPPORTED_DAY_COUNT) {
        throw new Error(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
    }
    // Largest yi such that yearStart[yi] <= dayIndex
    let lo = 0;
    let hi = YEAR_COUNT - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (yearStart[mid] <= dayIndex) {
            lo = mid;
        }
        else {
            hi = mid - 1;
        }
    }
    const yi = lo;
    const rem = dayIndex - yearStart[yi];
    const base = yi * 12;
    for (let m = 0; m < 12; m++) {
        const start = monthStart[base + m];
        const dim = monthLength[base + m];
        if (rem < start + dim) {
            return {
                year: MIN_BS_YEAR + yi,
                month: m + 1,
                day: rem - start + 1,
            };
        }
    }
    // Unreachable if tables are consistent with BS_CALENDAR_DATA
    throw new Error(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
}

/**
 * Date-only AD ↔ BS conversion (ADR-002).
 * Operates solely on CalendarDate values — host timezone independent.
 */
/**
 * Convert Gregorian (AD) civil date → Bikram Sambat.
 *
 * Uses BS year/month prefix tables (ISS-003) — O(log years + months), not O(days).
 */
function convertAdToBs(ad) {
    validateAdDate(ad.year, ad.month, ad.day);
    const daysDiff = daysBetweenGregorian(REF_AD_YMD, ad);
    // Dates before REF or past the last supported BS day: same error as the old walk.
    if (daysDiff < 0) {
        throw new Error(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
    }
    return bsDateFromDayIndex(daysDiff);
}
/**
 * Convert Bikram Sambat civil date → Gregorian (AD) date-only.
 */
function convertBsToAd(bs) {
    validateBsDate(bs.year, bs.month, bs.day);
    const daysDiff = daysBetweenBS(REF_BS, bs);
    return addGregorianDays(REF_AD_YMD, daysDiff);
}
/**
 * Nepali weekday index for a BS date: 1=Aitabar … 7=Sanibar.
 * Derived from day offset vs REF (no `Date.getDay()`).
 */
function getBsWeekdayIndex(bs) {
    validateBsDate(bs.year, bs.month, bs.day);
    const days = daysFromRefBs(bs);
    const jsDay = (((REF_AD_JS_WEEKDAY + days) % 7) + 7) % 7;
    return jsDay + 1;
}

/**
 * Legacy AD → BS converter (ADR-002).
 *
 * - `Date` input: extracts **local** calendar fields (`getFullYear` / `getMonth`+1 / `getDate`).
 *   Same instant can yield different BS dates under different host timezones — intentional v1 behavior.
 * - `[year, month, day]` array (1-based month): treated as a civil date-only value (TZ-independent).
 *
 * Prefer {@link convertAdToBs} for an explicit date-only API.
 */
function convertADToBS(date) {
    let adYear;
    let adMonth;
    let adDay;
    if (date instanceof Date) {
        adYear = date.getFullYear();
        adMonth = date.getMonth() + 1;
        adDay = date.getDate();
    }
    else if (Array.isArray(date) && date.length >= 3) {
        adYear = date[0];
        adMonth = date[1];
        adDay = date[2];
    }
    else {
        throw new Error('Invalid date format. Provide a Date object or [year, month, day] array.');
    }
    return convertAdToBs({ year: adYear, month: adMonth, day: adDay });
}
/**
 * Gets the current date in Bikram Sambat calendar.
 * Uses the host's local civil date of "now" (timezone-sensitive by design).
 */
function getCurrentBSDate() {
    return convertADToBS(new Date());
}

/**
 * Legacy BS → AD: returns a local-midnight `Date` (v1 local-field semantics, ADR-002).
 * Prefer {@link convertBsToAd} for timezone-independent date-only results.
 */
function convertBSToAD(bsDate) {
    const { year, month, day } = parseDateInput(bsDate);
    const ad = convertBsToAd({ year, month, day });
    // Local civil construction — timestamp varies by host TZ; Y/M/D fields match `ad`.
    return new Date(ad.year, ad.month - 1, ad.day);
}

/**
 * Localized month and weekday display names (Stage 2.6).
 * Numeric month/day values remain domain concepts in core date types.
 */
/**
 * Month names (English transliteration)
 */
var NepaliMonth;
(function (NepaliMonth) {
    NepaliMonth[NepaliMonth["Baisakh"] = 1] = "Baisakh";
    NepaliMonth[NepaliMonth["Jestha"] = 2] = "Jestha";
    NepaliMonth[NepaliMonth["Ashadh"] = 3] = "Ashadh";
    NepaliMonth[NepaliMonth["Shrawan"] = 4] = "Shrawan";
    NepaliMonth[NepaliMonth["Bhadra"] = 5] = "Bhadra";
    NepaliMonth[NepaliMonth["Ashwin"] = 6] = "Ashwin";
    NepaliMonth[NepaliMonth["Kartik"] = 7] = "Kartik";
    NepaliMonth[NepaliMonth["Mangsir"] = 8] = "Mangsir";
    NepaliMonth[NepaliMonth["Poush"] = 9] = "Poush";
    NepaliMonth[NepaliMonth["Magh"] = 10] = "Magh";
    NepaliMonth[NepaliMonth["Falgun"] = 11] = "Falgun";
    NepaliMonth[NepaliMonth["Chaitra"] = 12] = "Chaitra";
})(NepaliMonth || (NepaliMonth = {}));
/**
 * Month names (Devanagari script)
 */
var NepaliMonthNepali;
(function (NepaliMonthNepali) {
    NepaliMonthNepali[NepaliMonthNepali["\u092C\u0948\u0936\u093E\u0916"] = 1] = "\u092C\u0948\u0936\u093E\u0916";
    NepaliMonthNepali[NepaliMonthNepali["\u091C\u0947\u0937\u094D\u0920"] = 2] = "\u091C\u0947\u0937\u094D\u0920";
    NepaliMonthNepali[NepaliMonthNepali["\u0906\u0937\u093E\u0922"] = 3] = "\u0906\u0937\u093E\u0922";
    NepaliMonthNepali[NepaliMonthNepali["\u0936\u094D\u0930\u093E\u0935\u0923"] = 4] = "\u0936\u094D\u0930\u093E\u0935\u0923";
    NepaliMonthNepali[NepaliMonthNepali["\u092D\u093E\u0926\u094D\u0930"] = 5] = "\u092D\u093E\u0926\u094D\u0930";
    NepaliMonthNepali[NepaliMonthNepali["\u0906\u0936\u094D\u0935\u093F\u0928"] = 6] = "\u0906\u0936\u094D\u0935\u093F\u0928";
    NepaliMonthNepali[NepaliMonthNepali["\u0915\u093E\u0930\u094D\u0924\u093F\u0915"] = 7] = "\u0915\u093E\u0930\u094D\u0924\u093F\u0915";
    NepaliMonthNepali[NepaliMonthNepali["\u092E\u0902\u0938\u093F\u0930"] = 8] = "\u092E\u0902\u0938\u093F\u0930";
    NepaliMonthNepali[NepaliMonthNepali["\u092A\u094C\u0937"] = 9] = "\u092A\u094C\u0937";
    NepaliMonthNepali[NepaliMonthNepali["\u092E\u093E\u0918"] = 10] = "\u092E\u093E\u0918";
    NepaliMonthNepali[NepaliMonthNepali["\u092B\u093E\u0932\u094D\u0917\u0941\u0928"] = 11] = "\u092B\u093E\u0932\u094D\u0917\u0941\u0928";
    NepaliMonthNepali[NepaliMonthNepali["\u091A\u0948\u0924\u094D\u0930"] = 12] = "\u091A\u0948\u0924\u094D\u0930";
})(NepaliMonthNepali || (NepaliMonthNepali = {}));
/**
 * Weekday names (English transliteration)
 */
var NepaliWeekDay;
(function (NepaliWeekDay) {
    NepaliWeekDay[NepaliWeekDay["Aitabar"] = 1] = "Aitabar";
    NepaliWeekDay[NepaliWeekDay["Sombar"] = 2] = "Sombar";
    NepaliWeekDay[NepaliWeekDay["Mangalbar"] = 3] = "Mangalbar";
    NepaliWeekDay[NepaliWeekDay["Budhabar"] = 4] = "Budhabar";
    NepaliWeekDay[NepaliWeekDay["Bihibar"] = 5] = "Bihibar";
    NepaliWeekDay[NepaliWeekDay["Sukrabar"] = 6] = "Sukrabar";
    NepaliWeekDay[NepaliWeekDay["Sanibar"] = 7] = "Sanibar";
})(NepaliWeekDay || (NepaliWeekDay = {}));
/**
 * Weekday names (Devanagari script)
 */
var NepaliWeekDayNepali;
(function (NepaliWeekDayNepali) {
    NepaliWeekDayNepali[NepaliWeekDayNepali["\u0906\u0907\u0924\u092C\u093E\u0930"] = 1] = "\u0906\u0907\u0924\u092C\u093E\u0930";
    NepaliWeekDayNepali[NepaliWeekDayNepali["\u0938\u094B\u092E\u092C\u093E\u0930"] = 2] = "\u0938\u094B\u092E\u092C\u093E\u0930";
    NepaliWeekDayNepali[NepaliWeekDayNepali["\u092E\u0902\u0917\u0932\u092C\u093E\u0930"] = 3] = "\u092E\u0902\u0917\u0932\u092C\u093E\u0930";
    NepaliWeekDayNepali[NepaliWeekDayNepali["\u092C\u0941\u0927\u092C\u093E\u0930"] = 4] = "\u092C\u0941\u0927\u092C\u093E\u0930";
    NepaliWeekDayNepali[NepaliWeekDayNepali["\u092C\u093F\u0939\u093F\u092C\u093E\u0930"] = 5] = "\u092C\u093F\u0939\u093F\u092C\u093E\u0930";
    NepaliWeekDayNepali[NepaliWeekDayNepali["\u0936\u0941\u0915\u094D\u0930\u092C\u093E\u0930"] = 6] = "\u0936\u0941\u0915\u094D\u0930\u092C\u093E\u0930";
    NepaliWeekDayNepali[NepaliWeekDayNepali["\u0936\u0928\u093F\u092C\u093E\u0930"] = 7] = "\u0936\u0928\u093F\u092C\u093E\u0930";
})(NepaliWeekDayNepali || (NepaliWeekDayNepali = {}));

/**
 * Devanagari digit glyphs (Stage 2.6 — owned by i18n, not core calendar data).
 */
const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Localization / presentation utilities.
 * No DOM dependencies. Does not import calendar conversion logic.
 */
/**
 * Localize number to Nepali digits based on language
 * @param num The number to localize
 * @param language The language code ('en' or 'np')
 * @returns Localized string with Nepali digits if language is 'np'
 */
function localizeDigits(num, language) {
    switch (language) {
        case 'np':
            return String(num)
                .split('')
                .map((digit) => /\d/.test(digit) ? NEPALI_DIGITS[parseInt(digit, 10)] : digit)
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
function localizeMonth(month, language) {
    if (language === 'np') {
        return NepaliMonthNepali[month];
    }
    else {
        return NepaliMonth[month];
    }
}
/**
 * Converts Nepali digits to English digits
 * @param text The text containing Nepali digits to convert
 * @returns String with English digits
 */
function nepaliDigitsToEnglish(text) {
    const nepaliToEnglish = {
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
function getDateFormatPatterns() {
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

/**
 * Converts English digits to Nepali digits
 * @param num The number to convert
 * @returns String with Nepali digits
 */
function toNepaliDigits(num) {
    return num.toString().replace(/[0-9]/g, (match) => NEPALI_DIGITS[parseInt(match)]);
}
/**
 * Format tokens, longest first so one pass never rewrites substituted text.
 * Bracket groups `[...]` are literals (content emitted as-is).
 */
const FORMAT_TOKEN = /\[([^\]]*)\]|YYYY|YY|MMMM|MMM|MM|M|dddd|ddd|DD|D|d/g;
/**
 * Formats a Nepali date according to the specified format string.
 *
 * Tokens are matched once from the pattern (longest-first). Substituted
 * month/weekday names are never scanned again, which prevents corruption
 * such as Mangsir → 8angsir or Budhabar → Bu4habar.
 *
 * Use `[text]` to emit literal characters that would otherwise be tokens.
 */
function formatBS(date, format = 'YYYY-MM-DD', options = {}) {
    const { language = 'en' } = options;
    const useNepaliDigits = language === 'np';
    // Weekday from civil day index (ADR-002) — not Date.getDay().
    const weekDay = getBsWeekdayIndex(date);
    const digits = (value) => useNepaliDigits ? toNepaliDigits(value) : String(value);
    const pad2 = (n) => n.toString().padStart(2, '0');
    const monthName = language === 'en' ? NepaliMonth[date.month] : NepaliMonthNepali[date.month];
    const monthShort = language === 'en' ? NepaliMonth[date.month].substring(0, 3) : NepaliMonthNepali[date.month];
    const weekdayName = language === 'en'
        ? NepaliWeekDay[weekDay]
        : NepaliWeekDayNepali[weekDay];
    const weekdayShort = language === 'en'
        ? NepaliWeekDay[weekDay].substring(0, 3)
        : NepaliWeekDayNepali[weekDay];
    return format.replace(FORMAT_TOKEN, (match, literal) => {
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

/**
 * Date selection constraints (Phase 3 Stage 3.5).
 * Pure BS date-only comparisons — no DOM, no timezone APIs.
 *
 * Semantics:
 * - `minDate` / `maxDate` are **inclusive** and **snapshotted** at normalize/construct
 *   (copied civil triples — later mutation of the caller's objects is ignored).
 * - `disabledDates` is **snapshotted** into a new array of copied triples at
 *   normalize/construct — mutating or replacing the caller's array afterward
 *   does not change picker behavior.
 * - `isDateDisabled` is retained by **reference** and evaluated **dynamically**
 *   on every availability check (render, click, keyboard, Today).
 * - A date is disabled if outside [min, max], listed in the snapshotted
 *   `disabledDates`, or `isDateDisabled(date)` returns true.
 * - Contradictory min > max → both bounds ignored (with warning at normalize time).
 * - Malformed dates (invalid month/day) → that constraint ignored.
 */
function compareBsDates(a, b) {
    if (a.year !== b.year)
        return a.year - b.year;
    if (a.month !== b.month)
        return a.month - b.month;
    return a.day - b.day;
}
function sameBsDate(a, b) {
    return compareBsDates(a, b) === 0;
}
function isValidBsCivilDate(date) {
    if (!date ||
        !Number.isFinite(date.year) ||
        !Number.isFinite(date.month) ||
        !Number.isFinite(date.day)) {
        return false;
    }
    if (date.month < 1 || date.month > 12 || date.day < 1) {
        return false;
    }
    try {
        return date.day <= getDaysInMonth(date.year, date.month);
    }
    catch (_a) {
        return false;
    }
}
/**
 * Normalize constructor options into a safe constraint object.
 * Does not throw — invalid pieces are dropped and optionally warned.
 */
function normalizeConstraints(input = {}, warn = console.warn) {
    let minDate = null;
    let maxDate = null;
    if (input.minDate !== undefined) {
        if (isValidBsCivilDate(input.minDate)) {
            minDate = { ...input.minDate };
        }
        else {
            warn('[NepaliDatePicker] Ignoring invalid minDate; expected a valid BS { year, month, day }.');
        }
    }
    if (input.maxDate !== undefined) {
        if (isValidBsCivilDate(input.maxDate)) {
            maxDate = { ...input.maxDate };
        }
        else {
            warn('[NepaliDatePicker] Ignoring invalid maxDate; expected a valid BS { year, month, day }.');
        }
    }
    if (minDate && maxDate && compareBsDates(minDate, maxDate) > 0) {
        warn('[NepaliDatePicker] minDate is after maxDate; ignoring both bounds.');
        minDate = null;
        maxDate = null;
    }
    // Snapshot: new array + copied triples (caller's array/objects are not retained).
    const disabledDates = [];
    if (input.disabledDates) {
        for (const d of input.disabledDates) {
            if (isValidBsCivilDate(d)) {
                disabledDates.push({ year: d.year, month: d.month, day: d.day });
            }
            else {
                warn('[NepaliDatePicker] Ignoring invalid entry in disabledDates.');
            }
        }
    }
    // Dynamic: keep the function reference; invoke on each availability check.
    const isDateDisabled = typeof input.isDateDisabled === 'function' ? input.isDateDisabled : null;
    return { minDate, maxDate, disabledDates, isDateDisabled };
}
function isDateDisabledByConstraints(date, constraints) {
    if (!isValidBsCivilDate(date)) {
        return true;
    }
    if (constraints.minDate && compareBsDates(date, constraints.minDate) < 0) {
        return true;
    }
    if (constraints.maxDate && compareBsDates(date, constraints.maxDate) > 0) {
        return true;
    }
    if (constraints.disabledDates.some((d) => sameBsDate(d, date))) {
        return true;
    }
    if (constraints.isDateDisabled) {
        try {
            if (constraints.isDateDisabled(date)) {
                return true;
            }
        }
        catch (_a) {
            return true;
        }
    }
    return false;
}
function isDateSelectable(date, constraints) {
    return !isDateDisabledByConstraints(date, constraints);
}

/**
 * Pure BS calendar keyboard navigation (Phase 3 Stage 3.3).
 * Week starts on Sunday — matches grid weekday columns (0=Sunday … 6=Saturday).
 */
const NAV_KEYS = new Set([
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'PageUp',
    'PageDown',
]);
function isCalendarNavKey(key) {
    return NAV_KEYS.has(key);
}
/** Weekday 0=Sunday … 6=Saturday (same as `grid.ts`). */
function bsWeekdayIndex0(date) {
    try {
        return getBsWeekdayIndex(date) - 1;
    }
    catch (_a) {
        return 0;
    }
}
function daysInMonthSafe(year, month) {
    try {
        return getDaysInMonth(year, month);
    }
    catch (_a) {
        if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
            return 30;
        }
        throw new Error(`Invalid BS month ${year}-${month}`);
    }
}
function clampDay(year, month, day) {
    const dim = daysInMonthSafe(year, month);
    const d = Math.min(Math.max(1, day), dim);
    return { year, month, day: d };
}
/** Add (possibly negative) civil days across BS month/year boundaries. */
function addDaysBs(date, delta) {
    let { year, month, day } = date;
    let remaining = delta;
    while (remaining !== 0) {
        if (remaining > 0) {
            const dim = daysInMonthSafe(year, month);
            if (day + remaining <= dim) {
                return { year, month, day: day + remaining };
            }
            remaining -= dim - day + 1;
            day = 1;
            month += 1;
            if (month > 12) {
                month = 1;
                year += 1;
            }
        }
        else {
            if (day + remaining >= 1) {
                return { year, month, day: day + remaining };
            }
            remaining += day;
            month -= 1;
            if (month < 1) {
                month = 12;
                year -= 1;
            }
            day = daysInMonthSafe(year, month);
        }
    }
    return { year, month, day };
}
function startOfWeekBs(date) {
    return addDaysBs(date, -bsWeekdayIndex0(date));
}
function endOfWeekBs(date) {
    return addDaysBs(date, 6 - bsWeekdayIndex0(date));
}
function shiftMonthClamped(date, deltaMonths) {
    let year = date.year;
    let month = date.month + deltaMonths;
    while (month < 1) {
        month += 12;
        year -= 1;
    }
    while (month > 12) {
        month -= 12;
        year += 1;
    }
    return clampDay(year, month, date.day);
}
/**
 * Move the focused date for a navigation key.
 * Week convention: Sunday start / Saturday end (matches rendered grid).
 */
function navigateFocusedDate(focused, key) {
    switch (key) {
        case 'ArrowLeft':
            return addDaysBs(focused, -1);
        case 'ArrowRight':
            return addDaysBs(focused, 1);
        case 'ArrowUp':
            return addDaysBs(focused, -7);
        case 'ArrowDown':
            return addDaysBs(focused, 7);
        case 'Home':
            return startOfWeekBs(focused);
        case 'End':
            return endOfWeekBs(focused);
        case 'PageUp':
            return shiftMonthClamped(focused, -1);
        case 'PageDown':
            return shiftMonthClamped(focused, 1);
        default:
            return focused;
    }
}
function compareBs(a, b) {
    if (a.year !== b.year)
        return a.year - b.year;
    if (a.month !== b.month)
        return a.month - b.month;
    return a.day - b.day;
}
/** First selectable day at or after `start` stepping by `dir` (±1). */
function findSelectableAlong(start, dir, isSelectable, maxSteps = 800) {
    let cur = start;
    for (let i = 0; i < maxSteps; i++) {
        if (isSelectable(cur))
            return cur;
        cur = addDaysBs(cur, dir);
    }
    return null;
}
/** Nearest selectable day in the same BS month as `anchor`, or null. */
function nearestSelectableInMonth(anchor, isSelectable) {
    const dim = daysInMonthSafe(anchor.year, anchor.month);
    const clamped = clampDay(anchor.year, anchor.month, anchor.day);
    if (isSelectable(clamped))
        return clamped;
    for (let dist = 1; dist < dim; dist++) {
        const before = clamped.day - dist;
        if (before >= 1) {
            const d = { year: anchor.year, month: anchor.month, day: before };
            if (isSelectable(d))
                return d;
        }
        const after = clamped.day + dist;
        if (after <= dim) {
            const d = { year: anchor.year, month: anchor.month, day: after };
            if (isSelectable(d))
                return d;
        }
    }
    return null;
}
/**
 * Keyboard navigation that skips disabled / out-of-range dates.
 * If no selectable date is found, returns the original `focused`.
 */
function navigateFocusedDateSelectable(focused, key, isSelectable) {
    var _a, _b;
    if (key === 'Home') {
        const start = startOfWeekBs(focused);
        const end = endOfWeekBs(focused);
        let cur = start;
        while (compareBs(cur, end) <= 0) {
            if (isSelectable(cur))
                return cur;
            cur = addDaysBs(cur, 1);
        }
        return focused;
    }
    if (key === 'End') {
        const start = startOfWeekBs(focused);
        const end = endOfWeekBs(focused);
        let cur = end;
        while (compareBs(cur, start) >= 0) {
            if (isSelectable(cur))
                return cur;
            cur = addDaysBs(cur, -1);
        }
        return focused;
    }
    if (key === 'PageUp' || key === 'PageDown') {
        const shifted = navigateFocusedDate(focused, key);
        return (_a = nearestSelectableInMonth(shifted, isSelectable)) !== null && _a !== void 0 ? _a : focused;
    }
    const candidate = navigateFocusedDate(focused, key);
    if (isSelectable(candidate))
        return candidate;
    const dir = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
    return (_b = findSelectableAlong(candidate, dir, isSelectable)) !== null && _b !== void 0 ? _b : focused;
}
/** Initial grid focus: selected if in view, else today if in view, else day 1. */
function initialFocusedDate(viewYear, viewMonth, selected, today) {
    if (selected &&
        selected.year === viewYear &&
        selected.month === viewMonth) {
        return { ...selected };
    }
    if (today.year === viewYear && today.month === viewMonth) {
        return { ...today };
    }
    return { year: viewYear, month: viewMonth, day: 1 };
}
/** Prefer a selectable focus target; fall back to `preferred` if none exist nearby. */
function resolveInitialFocus(preferred, isSelectable) {
    var _a, _b;
    if (isSelectable(preferred))
        return preferred;
    const inMonth = nearestSelectableInMonth(preferred, isSelectable);
    if (inMonth)
        return inMonth;
    return ((_b = (_a = findSelectableAlong(preferred, 1, isSelectable)) !== null && _a !== void 0 ? _a : findSelectableAlong(preferred, -1, isSelectable)) !== null && _b !== void 0 ? _b : preferred);
}

/**
 * Popup positioning and z-index policy (Phase 3 Stage 3.4 / ISS-012).
 * Pure geometry helpers — no calendar state, no full-DOM scans.
 */
/** Library default when neither constructor option nor setZIndex is used. */
const DEFAULT_POPUP_Z_INDEX = 999999;
/** Gap between input and popup (px). */
const POPUP_GAP_PX = 4;
/** Viewport inset used when clamping to avoid edge overflow (px). */
const VIEWPORT_MARGIN_PX = 4;
/**
 * Precedence (highest wins):
 * 1. Runtime `setZIndex()` override
 * 2. Constructor `options.zIndex`
 * 3. Library default (`DEFAULT_POPUP_Z_INDEX`)
 *
 * Values are sticky — opening the popup must not re-resolve or escalate.
 */
function resolveZIndex(options) {
    if (options.runtimeOverride !== undefined &&
        Number.isFinite(options.runtimeOverride)) {
        return { value: options.runtimeOverride, source: 'runtime' };
    }
    if (options.constructorOption !== undefined &&
        Number.isFinite(options.constructorOption)) {
        return { value: options.constructorOption, source: 'constructor' };
    }
    const fallback = options.defaultZIndex !== undefined
        ? options.defaultZIndex
        : DEFAULT_POPUP_Z_INDEX;
    return { value: fallback, source: 'default' };
}
/**
 * Compute absolute document coordinates for a popup anchored to an input.
 *
 * Strategy:
 * - Prefer below the input (`POPUP_GAP_PX`).
 * - Flip above when there is insufficient space below and enough space above.
 * - Prefer left-aligned to the input; if that overflows the viewport right edge,
 *   align to the input's right edge.
 * - Clamp into the viewport with `VIEWPORT_MARGIN_PX` when the popup fits.
 *
 * Uses provided rects only — callers supply getBoundingClientRect / viewport.
 */
function computePopupPosition(input, popup, viewport, gap = POPUP_GAP_PX) {
    const spaceBelow = viewport.height - input.bottom;
    const spaceAbove = input.top;
    const placeAbove = spaceBelow < popup.height + gap && spaceAbove > popup.height + gap;
    let top;
    let placement;
    if (placeAbove) {
        placement = 'above';
        top = input.top + viewport.scrollY - popup.height - gap;
    }
    else {
        placement = 'below';
        top = input.bottom + viewport.scrollY + gap;
    }
    let left = input.left + viewport.scrollX;
    if (viewport.width - input.left < popup.width) {
        left = input.right + viewport.scrollX - popup.width;
    }
    const minLeft = viewport.scrollX + VIEWPORT_MARGIN_PX;
    const maxLeft = viewport.scrollX + viewport.width - popup.width - VIEWPORT_MARGIN_PX;
    if (maxLeft >= minLeft) {
        left = Math.min(Math.max(left, minLeft), maxLeft);
    }
    const minTop = viewport.scrollY + VIEWPORT_MARGIN_PX;
    const maxTop = viewport.scrollY + viewport.height - popup.height - VIEWPORT_MARGIN_PX;
    if (maxTop >= minTop) {
        top = Math.min(Math.max(top, minTop), maxTop);
    }
    return { top, left, placement };
}
/** Read viewport metrics once (caller may mock in tests). */
function readViewport(win = window) {
    return {
        width: win.innerWidth,
        height: win.innerHeight,
        scrollX: win.scrollX,
        scrollY: win.scrollY,
    };
}
/**
 * Apply absolute positioning styles. Writes only — measure before calling.
 */
function applyPopupPositionStyles(popup, position, zIndex) {
    popup.style.position = 'absolute';
    popup.style.zIndex = String(zIndex);
    popup.style.top = `${position.top}px`;
    popup.style.left = `${position.left}px`;
}

/**
 * Gregorian (AD) equivalent display helpers (Phase 3 Stage 3.6).
 * Conversion ownership: core `convertBsToAd` only (date-only, TZ-independent).
 * BS remains the selection calendar; AD is secondary presentation.
 */
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
];
/** Safe BS→AD; returns null for out-of-range / invalid civil dates. */
function convertBsToAdOrNull(bs) {
    try {
        return convertBsToAd(bs);
    }
    catch (_a) {
        return null;
    }
}
/** Compact day-of-month for secondary cell subtitle (digits follow language). */
function formatAdCellDay(ad, language) {
    return localizeDigits(ad.day, language);
}
/**
 * Full AD civil label for footer / accessible names.
 * Month names stay Latin short form; day/year digits follow `language`.
 */
function formatAdFullLabel(ad, language) {
    var _a;
    const month = (_a = AD_MONTH_SHORT_EN[ad.month - 1]) !== null && _a !== void 0 ? _a : String(ad.month);
    const day = localizeDigits(ad.day, language);
    const year = localizeDigits(ad.year, language);
    return `${day} ${month} ${year}`;
}
/** Footer line text for a BS date (empty string if conversion fails). */
function formatAdEquivalentLine(bs, language) {
    const ad = convertBsToAdOrNull(bs);
    if (!ad)
        return '';
    const body = formatAdFullLabel(ad, language);
    return language === 'np' ? `ईस्वी · ${body}` : `AD · ${body}`;
}
/** Accessible AD fragment appended to BS day labels. */
function formatAdAccessibleSuffix(bs, language) {
    const ad = convertBsToAdOrNull(bs);
    if (!ad)
        return '';
    const body = formatAdFullLabel(ad, language);
    return language === 'np' ? `ईस्वी ${body}` : `AD ${body}`;
}

/**
 * Pure BS calendar grid model (Phase 3 Stage 3.1).
 * No DOM. Uses core getDaysInMonth + date-only weekday index (not JS Date weekday APIs).
 */
const TOTAL_CELLS = 42;
/**
 * Days in BS month via core API.
 * Numeric fallback only for years outside MIN/MAX (adjacent-month padding).
 */
function daysInBsMonth(year, month1Based, fallback = 30) {
    try {
        return getDaysInMonth(year, month1Based);
    }
    catch (err) {
        if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) {
            return fallback;
        }
        throw err;
    }
}
/**
 * Weekday of BS Y-M-1 as 0=Sunday…6=Saturday (date-only; TZ-independent).
 * Out-of-range / invalid → 0 (Sunday), matching prior defensive UI behavior.
 */
function firstWeekdayOfBsMonth(year, month1Based) {
    try {
        const nepaliIndex = getBsWeekdayIndex({ year, month: month1Based, day: 1 });
        return nepaliIndex - 1; // 1=Aitabar(Sun) → 0
    }
    catch (_a) {
        return 0;
    }
}
function shiftMonth(year, month, delta) {
    let y = year;
    let m = month + delta;
    while (m < 1) {
        m += 12;
        y -= 1;
    }
    while (m > 12) {
        m -= 12;
        y += 1;
    }
    return { year: y, month: m };
}
function buildBsMonthGrid(viewYear, viewMonth, selected, isDisabled = () => false) {
    const daysInMonth = daysInBsMonth(viewYear, viewMonth);
    const firstWeekday = firstWeekdayOfBsMonth(viewYear, viewMonth);
    const prev = shiftMonth(viewYear, viewMonth, -1);
    const lastDayOfPrevMonth = daysInBsMonth(prev.year, prev.month);
    const next = shiftMonth(viewYear, viewMonth, 1);
    const cells = [];
    const pushCell = (day, year, month, kind) => {
        const date = { year, month, day };
        const selectedCell = selected !== null &&
            selected.year === year &&
            selected.month === month &&
            selected.day === day;
        cells.push({
            day,
            year,
            month,
            kind,
            selected: selectedCell,
            disabled: isDisabled(date),
        });
    };
    for (let i = 0; i < firstWeekday; i++) {
        const day = lastDayOfPrevMonth - firstWeekday + i + 1;
        pushCell(day, prev.year, prev.month, 'prev');
    }
    for (let day = 1; day <= daysInMonth; day++) {
        pushCell(day, viewYear, viewMonth, 'current');
    }
    let nextDay = 1;
    while (cells.length < TOTAL_CELLS) {
        pushCell(nextDay, next.year, next.month, 'next');
        nextDay += 1;
    }
    return {
        year: viewYear,
        month: viewMonth,
        firstWeekday,
        daysInMonth,
        cells,
    };
}

/**
 * Safe DOM construction for the datepicker popup (Phase 3 Stage 3.2 / ISS-014).
 * ARIA / grid semantics (Phase 3 Stage 3.3).
 * Constraints / Today / Clear (Phase 3 Stage 3.5).
 * Dual AD equivalent display (Phase 3 Stage 3.6).
 * Dynamic labels use textContent / createTextNode only.
 */
const AD_EQUIVALENT_SELECTOR = '.nepali-ad-equivalent';
function el(tag, className) {
    const node = document.createElement(tag);
    if (className) {
        node.className = className;
    }
    return node;
}
/** Create an element whose only child content is a text node (never HTML). */
function textElement(tag, className, text) {
    const node = el(tag, className);
    node.appendChild(document.createTextNode(text));
    return node;
}
function weekdayLabels(language) {
    return language === 'np'
        ? ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श']
        : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
}
function sameDate(a, b) {
    return a.year === b.year && a.month === b.month && a.day === b.day;
}
function accessibleDateLabel(cell, language) {
    const monthName = localizeMonth(cell.month, language);
    const day = localizeDigits(cell.day, language);
    const year = localizeDigits(cell.year, language);
    const bs = `${day} ${monthName} ${year}`;
    const ad = formatAdAccessibleSuffix({ year: cell.year, month: cell.month, day: cell.day }, language);
    let label = ad ? `${bs}, ${ad}` : bs;
    if (cell.disabled) {
        label =
            language === 'np' ? `${label} (अक्षम)` : `${label} (unavailable)`;
    }
    return label;
}
function monthYearLabel(year, month, language) {
    return `${localizeMonth(month, language)} ${localizeDigits(year, language)}`;
}
/**
 * Update the AD equivalent footer to match a BS date (focused / selected).
 * Used for in-month keyboard moves without a full re-render.
 */
function setAdEquivalentFooter(root, bs, language) {
    const footer = root.querySelector(AD_EQUIVALENT_SELECTOR);
    if (!footer)
        return;
    const text = formatAdEquivalentLine(bs, language);
    footer.textContent = '';
    if (text) {
        footer.appendChild(document.createTextNode(text));
    }
}
function renderAdEquivalentFooter(bs, language) {
    const footer = el('div', 'nepali-ad-equivalent');
    footer.setAttribute('aria-live', 'polite');
    footer.setAttribute('aria-atomic', 'true');
    const text = formatAdEquivalentLine(bs, language);
    if (text) {
        footer.appendChild(document.createTextNode(text));
    }
    return footer;
}
function renderDayCell(cell, language, focused, today) {
    const classes = ['nepali-day'];
    if (cell.kind !== 'current') {
        classes.push('nepali-other-month');
    }
    if (cell.selected) {
        classes.push('nepali-selected');
    }
    if (cell.disabled) {
        classes.push('nepali-disabled');
    }
    const cellDate = {
        year: cell.year,
        month: cell.month,
        day: cell.day,
    };
    const isToday = sameDate(cellDate, today);
    if (isToday) {
        classes.push('nepali-today');
    }
    const isFocused = sameDate(cellDate, focused);
    const gridcell = el('div', 'nepali-gridcell');
    gridcell.setAttribute('role', 'gridcell');
    gridcell.setAttribute('aria-selected', cell.selected ? 'true' : 'false');
    if (cell.disabled) {
        gridcell.setAttribute('aria-disabled', 'true');
    }
    if (isToday) {
        gridcell.setAttribute('aria-current', 'date');
    }
    const day = el('button', classes.join(' '));
    day.type = 'button';
    day.setAttribute('data-day', String(cell.day));
    day.setAttribute('data-year', String(cell.year));
    day.setAttribute('data-month', String(cell.month));
    if (cell.kind === 'prev') {
        day.setAttribute('data-other', 'prev');
    }
    else if (cell.kind === 'next') {
        day.setAttribute('data-other', 'next');
    }
    day.setAttribute('aria-label', accessibleDateLabel(cell, language));
    if (cell.disabled) {
        day.disabled = true;
        day.setAttribute('aria-disabled', 'true');
    }
    day.tabIndex = isFocused && !cell.disabled ? 0 : -1;
    const bsNum = el('span', 'nepali-day-bs');
    bsNum.appendChild(document.createTextNode(localizeDigits(cell.day, language)));
    day.appendChild(bsNum);
    const ad = convertBsToAdOrNull(cellDate);
    if (ad) {
        const adNum = el('span', 'nepali-day-ad');
        adNum.setAttribute('aria-hidden', 'true');
        adNum.appendChild(document.createTextNode(formatAdCellDay(ad, language)));
        day.appendChild(adNum);
        day.setAttribute('data-ad', `${ad.year}-${ad.month}-${ad.day}`);
    }
    gridcell.appendChild(day);
    return gridcell;
}
function renderActions(language, todayDisabled) {
    const actions = el('div', 'nepali-datepicker-actions');
    const todayBtn = el('button', 'nepali-action-btn nepali-today-btn');
    todayBtn.type = 'button';
    todayBtn.appendChild(document.createTextNode(language === 'np' ? 'आज' : 'Today'));
    if (todayDisabled) {
        todayBtn.disabled = true;
        todayBtn.setAttribute('aria-disabled', 'true');
    }
    const clearBtn = el('button', 'nepali-action-btn nepali-clear-btn');
    clearBtn.type = 'button';
    clearBtn.appendChild(document.createTextNode(language === 'np' ? 'खाली' : 'Clear'));
    actions.append(todayBtn, clearBtn);
    return actions;
}
/**
 * Build the popup root `.nepali-datepicker` tree with createElement / textContent.
 * Does not attach event listeners (orchestrator owns that).
 */
function buildCalendarElement(options) {
    const { theme, language, viewYear, viewMonth, selected, focused, today, popupId, isDateDisabled = () => false, todayDisabled = false, minYear = MIN_BS_YEAR, maxYear = MAX_BS_YEAR, } = options;
    const root = el('div', `nepali-datepicker nepali-datepicker-${theme}`);
    root.id = popupId;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'false');
    root.setAttribute('aria-label', language === 'np' ? 'मिति छान्नुहोस्' : 'Choose date');
    const header = el('div', 'nepali-datepicker-header');
    const prevBtn = el('button', 'nepali-nav-btn nepali-prev-btn');
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', language === 'np' ? 'अघिल्लो महिना' : 'Previous month');
    prevBtn.appendChild(document.createTextNode('\u25C0')); // ◀
    const nextBtn = el('button', 'nepali-nav-btn nepali-next-btn');
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', language === 'np' ? 'अर्को महिना' : 'Next month');
    nextBtn.appendChild(document.createTextNode('\u25B6')); // ▶
    const headerContent = el('div', 'nepali-header-content');
    const titleId = `${popupId}-label`;
    const monthSelect = el('select', 'nepali-month-select');
    monthSelect.setAttribute('aria-label', language === 'np' ? 'महिना' : 'Month');
    for (let i = 0; i < 12; i++) {
        const month1 = i + 1;
        const opt = el('option');
        opt.value = String(i);
        opt.appendChild(document.createTextNode(localizeMonth(month1, language)));
        if (month1 === viewMonth) {
            opt.selected = true;
        }
        monthSelect.appendChild(opt);
    }
    const yearSelect = el('select', 'nepali-year-select');
    yearSelect.setAttribute('aria-label', language === 'np' ? 'वर्ष' : 'Year');
    for (let y = minYear; y <= maxYear; y++) {
        const opt = el('option');
        opt.value = String(y);
        opt.appendChild(document.createTextNode(localizeDigits(y, language)));
        if (y === viewYear) {
            opt.selected = true;
        }
        yearSelect.appendChild(opt);
    }
    headerContent.append(monthSelect, yearSelect);
    header.append(prevBtn, headerContent, nextBtn);
    const live = el('div', 'nepali-datepicker-live');
    live.id = titleId;
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    live.appendChild(document.createTextNode(monthYearLabel(viewYear, viewMonth, language)));
    const weekdays = el('div', 'nepali-weekdays');
    weekdays.setAttribute('aria-hidden', 'true');
    for (const label of weekdayLabels(language)) {
        weekdays.appendChild(textElement('div', 'nepali-weekday', label));
    }
    const body = el('div', 'nepali-calendar-body');
    body.setAttribute('role', 'grid');
    body.setAttribute('aria-labelledby', titleId);
    const model = buildBsMonthGrid(viewYear, viewMonth, selected, isDateDisabled);
    for (let row = 0; row < 6; row++) {
        const week = el('div', 'nepali-week');
        week.setAttribute('role', 'row');
        for (let col = 0; col < 7; col++) {
            const cell = model.cells[row * 7 + col];
            week.appendChild(renderDayCell(cell, language, focused, today));
        }
        body.appendChild(week);
    }
    // Footer tracks focused date (keyboard “hover”); selected remains BS-primary in the grid.
    const adFooter = renderAdEquivalentFooter(focused, language);
    const actions = renderActions(language, todayDisabled);
    root.append(header, live, weekdays, body, adFooter, actions);
    return root;
}

/**
 * Pure datepicker state (Phase 3 Stage 3.1).
 * No DOM / browser APIs. Months are 1-based (BS domain).
 */
function createInitialState(today) {
    const snap = { year: today.year, month: today.month, day: today.day };
    return {
        open: false,
        destroyed: false,
        view: { year: today.year, month: today.month },
        selected: { ...snap },
        focused: { ...snap },
        today: { ...snap },
    };
}
function openPicker(state) {
    if (state.destroyed)
        return state;
    return { ...state, open: true };
}
function closePicker(state) {
    if (state.destroyed)
        return state;
    return { ...state, open: false };
}
function setSelected(state, date) {
    if (state.destroyed)
        return state;
    const next = { year: date.year, month: date.month, day: date.day };
    return {
        ...state,
        selected: next,
        focused: next,
        view: { year: date.year, month: date.month },
    };
}
/** Clear selection without changing view/focused (Stage 3.5 Clear). */
function clearSelected(state) {
    if (state.destroyed)
        return state;
    return {
        ...state,
        selected: null,
    };
}
function setFocused(state, date) {
    if (state.destroyed)
        return state;
    return {
        ...state,
        focused: { year: date.year, month: date.month, day: date.day },
    };
}
function setView(state, year, month) {
    if (state.destroyed)
        return state;
    return {
        ...state,
        view: { year, month },
    };
}
function previousMonth(state) {
    if (state.destroyed)
        return state;
    let { year, month } = state.view;
    month -= 1;
    if (month < 1) {
        month = 12;
        year -= 1;
    }
    return { ...state, view: { year, month } };
}
function nextMonth(state) {
    if (state.destroyed)
        return state;
    let { year, month } = state.view;
    month += 1;
    if (month > 12) {
        month = 1;
        year += 1;
    }
    return { ...state, view: { year, month } };
}
function markDestroyed(state) {
    return {
        ...state,
        open: false,
        destroyed: true,
    };
}
function isDestroyed(state) {
    return state.destroyed;
}

let popupIdSeq = 0;
class NepaliDatePicker {
    constructor(inputElement, options = {}) {
        this.floatingCalendar = null;
        this.positionListenersAttached = false;
        this.repositionScheduled = false;
        this.repositionRaf = null;
        /** Tracked so destroy() can remove every listener (ISS-022 / Stage 3.3). */
        this.onInputClick = (e) => {
            e.stopPropagation();
            this.toggleCalendar();
        };
        this.onDocumentClick = (event) => {
            if (isDestroyed(this.state))
                return;
            const target = event.target;
            if (this.floatingCalendar &&
                target &&
                !this.floatingCalendar.contains(target) &&
                !this.inputElement.contains(target)) {
                this.closeCalendar({ restoreFocus: false });
            }
        };
        this.onDocumentKeydown = (event) => {
            if (isDestroyed(this.state) || !this.state.open)
                return;
            if (event.key === "Escape") {
                event.preventDefault();
                this.closeCalendar({ restoreFocus: true });
                return;
            }
            const active = document.activeElement;
            const onDay = Boolean(active === null || active === void 0 ? void 0 : active.classList.contains("nepali-day"));
            if (!onDay) {
                return;
            }
            if (isCalendarNavKey(event.key)) {
                event.preventDefault();
                this.moveFocusByKey(event.key);
                return;
            }
            // Space: preventDefault blocks native click synthesis — select explicitly.
            // Enter: leave to native button → click → handleBSDateClick.
            if (event.key === " ") {
                event.preventDefault();
                if (active) {
                    this.selectBSDate(active);
                }
            }
        };
        /** Popup listeners (removed when calendar DOM is torn down). */
        this.onPrevMonthClick = (e) => {
            e.stopPropagation();
            this.previousBSMonth();
        };
        this.onNextMonthClick = (e) => {
            e.stopPropagation();
            this.nextBSMonth();
        };
        this.onMonthSelectChange = (e) => {
            e.stopPropagation();
            this.changeBSMonth(e);
        };
        this.onYearSelectChange = (e) => {
            e.stopPropagation();
            this.changeBSYear(e);
        };
        this.onCalendarClick = (e) => {
            this.handleBSDateClick(e);
        };
        this.onTodayClick = (e) => {
            e.stopPropagation();
            this.selectToday();
        };
        this.onClearClick = (e) => {
            e.stopPropagation();
            this.clearDate();
        };
        this.onViewportChange = () => {
            this.scheduleReposition();
        };
        this.inputElement = inputElement;
        this.format = options.format || "YYYY-MM-DD";
        this.theme = options.theme || "light";
        this.language = options.language || "en";
        this.state = createInitialState(getCurrentBSDate());
        this.popupId = `nepali-datepicker-${++popupIdSeq}`;
        this.constructorZIndex = options.zIndex;
        this.runtimeZIndex = undefined;
        this.constraints = normalizeConstraints({
            minDate: options.minDate,
            maxDate: options.maxDate,
            disabledDates: options.disabledDates,
            isDateDisabled: options.isDateDisabled,
        });
        this.inputAriaBackup = {
            haspopup: inputElement.getAttribute("aria-haspopup"),
            expanded: inputElement.getAttribute("aria-expanded"),
            controls: inputElement.getAttribute("aria-controls"),
        };
        NepaliDatePicker.instances.add(this);
        this.init();
    }
    effectiveZIndex() {
        return resolveZIndex({
            runtimeOverride: this.runtimeZIndex,
            constructorOption: this.constructorZIndex,
        }).value;
    }
    canSelect(date) {
        return isDateSelectable(date, this.constraints);
    }
    init() {
        this.inputElement.setAttribute("aria-haspopup", "dialog");
        this.inputElement.setAttribute("aria-expanded", "false");
        this.inputElement.setAttribute("aria-controls", this.popupId);
        this.inputElement.addEventListener("click", this.onInputClick);
        document.addEventListener("click", this.onDocumentClick);
        document.addEventListener("keydown", this.onDocumentKeydown);
    }
    setExpanded(expanded) {
        this.inputElement.setAttribute("aria-expanded", expanded ? "true" : "false");
    }
    restoreInputAria() {
        const { haspopup, expanded, controls } = this.inputAriaBackup;
        if (haspopup === null) {
            this.inputElement.removeAttribute("aria-haspopup");
        }
        else {
            this.inputElement.setAttribute("aria-haspopup", haspopup);
        }
        if (expanded === null) {
            this.inputElement.removeAttribute("aria-expanded");
        }
        else {
            this.inputElement.setAttribute("aria-expanded", expanded);
        }
        if (controls === null) {
            this.inputElement.removeAttribute("aria-controls");
        }
        else {
            this.inputElement.setAttribute("aria-controls", controls);
        }
    }
    toggleCalendar() {
        if (isDestroyed(this.state))
            return;
        if (this.state.open) {
            this.closeCalendar({ restoreFocus: false });
        }
        else {
            this.openCalendar();
        }
    }
    parseAndSetDateFromInput() {
        const inputValue = this.inputElement.value.trim();
        if (!inputValue) {
            // No value in input, keep current date
            return;
        }
        try {
            const parsedDate = this.parseDateString(inputValue);
            if (parsedDate && this.canSelect(parsedDate)) {
                this.state = setSelected(this.state, parsedDate);
            }
        }
        catch (error) {
            // If parsing fails, keep current date
            console.warn("Unable to parse date from input:", inputValue, error);
        }
    }
    parseDateString(dateString) {
        if (!dateString)
            return null;
        const normalizedString = nepaliDigitsToEnglish(dateString);
        const monthNameDate = this.parseWithMonthNames(normalizedString);
        if (monthNameDate) {
            return monthNameDate;
        }
        const formatPatterns = getDateFormatPatterns();
        for (const pattern of formatPatterns) {
            const match = normalizedString.match(pattern.regex);
            if (match) {
                try {
                    const year = parseInt(match[pattern.yearIndex], 10);
                    const month = parseInt(match[pattern.monthIndex], 10);
                    const day = parseInt(match[pattern.dayIndex], 10);
                    // Validate the parsed date
                    if (this.isValidBSDate(year, month, day)) {
                        return { year, month, day };
                    }
                }
                catch (e) {
                    continue;
                }
            }
        }
        return null;
    }
    parseWithMonthNames(dateString) {
        const englishMonths = [];
        const nepaliMonths = [];
        for (let i = 1; i <= 12; i++) {
            englishMonths.push(localizeMonth(i, "en"));
            nepaliMonths.push(localizeMonth(i, "np"));
        }
        // Try English month names first
        for (let i = 0; i < englishMonths.length; i++) {
            const monthName = englishMonths[i];
            // Escape special regex characters and create flexible patterns
            const escapedMonth = monthName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const monthRegex = new RegExp(`${escapedMonth}\\s+(\\d{1,2}),?\\s+(\\d{4})|${escapedMonth}\\s+(\\d{1,2})\\s+(\\d{4})|(\\d{1,2})\\s+${escapedMonth}\\s+(\\d{4})`, 'i');
            const match = dateString.match(monthRegex);
            if (match) {
                const day = parseInt(match[1] || match[3] || match[5], 10);
                const year = parseInt(match[2] || match[4] || match[6], 10);
                const month = i + 1;
                if (this.isValidBSDate(year, month, day)) {
                    return { year, month, day };
                }
            }
        }
        // Try Nepali month names
        for (let i = 0; i < nepaliMonths.length; i++) {
            const monthName = nepaliMonths[i];
            // Escape special regex characters for Nepali month names
            const escapedMonth = monthName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const monthRegex = new RegExp(`${escapedMonth}\\s+(\\d{1,2}),?\\s+(\\d{4})|${escapedMonth}\\s+(\\d{1,2})\\s+(\\d{4})|(\\d{1,2})\\s+${escapedMonth}\\s+(\\d{4})`);
            const match = dateString.match(monthRegex);
            if (match) {
                const day = parseInt(match[1] || match[3] || match[5], 10);
                const year = parseInt(match[2] || match[4] || match[6], 10);
                const month = i + 1;
                if (this.isValidBSDate(year, month, day)) {
                    return { year, month, day };
                }
            }
        }
        return null;
    }
    isValidBSDate(year, month, day) {
        if (month < 1 || month > 12) {
            return false;
        }
        try {
            const daysInMonth = getDaysInMonth(year, month);
            return day >= 1 && day <= daysInMonth;
        }
        catch (_a) {
            return false;
        }
    }
    openCalendar() {
        if (isDestroyed(this.state))
            return;
        // Close all other calendars before opening this one
        this.closeAllOtherCalendars();
        // Parse existing value from input field if present
        this.parseAndSetDateFromInput();
        this.state = openPicker(this.state);
        const preferred = initialFocusedDate(this.state.view.year, this.state.view.month, this.state.selected, this.state.today);
        this.state = setFocused(this.state, resolveInitialFocus(preferred, (d) => this.canSelect(d)));
        this.setExpanded(true);
        this.renderCalendar(this.state.view.year, this.state.view.month, {
            moveDomFocus: true,
        });
    }
    renderCalendar(bsYear, bsMonth1Based, opts) {
        this.teardownCalendarDom();
        const calendarDiv = buildCalendarElement({
            theme: this.theme,
            language: this.language,
            viewYear: bsYear,
            viewMonth: bsMonth1Based,
            selected: this.state.selected,
            focused: this.state.focused,
            today: this.state.today,
            popupId: this.popupId,
            isDateDisabled: (d) => !this.canSelect(d),
            todayDisabled: !this.canSelect(this.state.today),
        });
        this.setupCalendarEvents(calendarDiv);
        // Body-attached absolute positioning (document coordinates).
        document.body.appendChild(calendarDiv);
        this.floatingCalendar = calendarDiv;
        this.positionCalendarPopup();
        this.attachPositionListeners();
        if (opts.moveDomFocus) {
            this.focusFocusedDay();
        }
    }
    focusFocusedDay() {
        const day = this.findDayElement(this.state.focused);
        if (day) {
            day.focus();
        }
    }
    findDayElement(date) {
        if (!this.floatingCalendar)
            return null;
        const days = this.floatingCalendar.querySelectorAll(".nepali-day");
        for (const el of Array.from(days)) {
            if (Number(el.dataset.year) === date.year &&
                Number(el.dataset.month) === date.month &&
                Number(el.dataset.day) === date.day) {
                return el;
            }
        }
        return null;
    }
    moveFocusByKey(key) {
        const next = navigateFocusedDateSelectable(this.state.focused, key, (d) => this.canSelect(d));
        this.state = setFocused(this.state, next);
        const viewChanged = next.year !== this.state.view.year || next.month !== this.state.view.month;
        if (viewChanged) {
            this.state = setView(this.state, next.year, next.month);
            this.renderCalendar(this.state.view.year, this.state.view.month, {
                moveDomFocus: true,
            });
            return;
        }
        // Update roving tabindex without full rebuild when staying in-month.
        if (!this.floatingCalendar)
            return;
        const days = this.floatingCalendar.querySelectorAll(".nepali-day");
        days.forEach((el) => {
            el.tabIndex = -1;
        });
        const target = this.findDayElement(next);
        if (target && !target.disabled) {
            target.tabIndex = 0;
            target.focus();
        }
        setAdEquivalentFooter(this.floatingCalendar, next, this.language);
    }
    setupCalendarEvents(calendarDiv) {
        const prevButton = calendarDiv.querySelector(".nepali-prev-btn");
        const nextButton = calendarDiv.querySelector(".nepali-next-btn");
        const monthSelect = calendarDiv.querySelector(".nepali-month-select");
        const yearSelect = calendarDiv.querySelector(".nepali-year-select");
        const todayButton = calendarDiv.querySelector(".nepali-today-btn");
        const clearButton = calendarDiv.querySelector(".nepali-clear-btn");
        prevButton === null || prevButton === void 0 ? void 0 : prevButton.addEventListener("click", this.onPrevMonthClick);
        nextButton === null || nextButton === void 0 ? void 0 : nextButton.addEventListener("click", this.onNextMonthClick);
        monthSelect === null || monthSelect === void 0 ? void 0 : monthSelect.addEventListener("change", this.onMonthSelectChange);
        yearSelect === null || yearSelect === void 0 ? void 0 : yearSelect.addEventListener("change", this.onYearSelectChange);
        todayButton === null || todayButton === void 0 ? void 0 : todayButton.addEventListener("click", this.onTodayClick);
        clearButton === null || clearButton === void 0 ? void 0 : clearButton.addEventListener("click", this.onClearClick);
        calendarDiv.addEventListener("click", this.onCalendarClick);
    }
    teardownCalendarDom() {
        this.detachPositionListeners();
        if (!this.floatingCalendar)
            return;
        const calendarDiv = this.floatingCalendar;
        const active = document.activeElement;
        if (active && calendarDiv.contains(active)) {
            active.blur();
        }
        const prevButton = calendarDiv.querySelector(".nepali-prev-btn");
        const nextButton = calendarDiv.querySelector(".nepali-next-btn");
        const monthSelect = calendarDiv.querySelector(".nepali-month-select");
        const yearSelect = calendarDiv.querySelector(".nepali-year-select");
        const todayButton = calendarDiv.querySelector(".nepali-today-btn");
        const clearButton = calendarDiv.querySelector(".nepali-clear-btn");
        prevButton === null || prevButton === void 0 ? void 0 : prevButton.removeEventListener("click", this.onPrevMonthClick);
        nextButton === null || nextButton === void 0 ? void 0 : nextButton.removeEventListener("click", this.onNextMonthClick);
        monthSelect === null || monthSelect === void 0 ? void 0 : monthSelect.removeEventListener("change", this.onMonthSelectChange);
        yearSelect === null || yearSelect === void 0 ? void 0 : yearSelect.removeEventListener("change", this.onYearSelectChange);
        todayButton === null || todayButton === void 0 ? void 0 : todayButton.removeEventListener("click", this.onTodayClick);
        clearButton === null || clearButton === void 0 ? void 0 : clearButton.removeEventListener("click", this.onClearClick);
        calendarDiv.removeEventListener("click", this.onCalendarClick);
        if (calendarDiv.parentNode) {
            calendarDiv.parentNode.removeChild(calendarDiv);
        }
        this.floatingCalendar = null;
    }
    attachPositionListeners() {
        if (this.positionListenersAttached)
            return;
        window.addEventListener("resize", this.onViewportChange, {
            passive: true,
        });
        // Capture phase so nested scroll containers trigger reposition.
        window.addEventListener("scroll", this.onViewportChange, true);
        this.positionListenersAttached = true;
    }
    detachPositionListeners() {
        if (!this.positionListenersAttached)
            return;
        window.removeEventListener("resize", this.onViewportChange);
        window.removeEventListener("scroll", this.onViewportChange, true);
        this.positionListenersAttached = false;
        this.repositionScheduled = false;
        if (this.repositionRaf !== null) {
            cancelAnimationFrame(this.repositionRaf);
            this.repositionRaf = null;
        }
    }
    scheduleReposition() {
        if (!this.floatingCalendar || isDestroyed(this.state))
            return;
        if (this.repositionScheduled)
            return;
        this.repositionScheduled = true;
        this.repositionRaf = requestAnimationFrame(() => {
            this.repositionScheduled = false;
            this.repositionRaf = null;
            this.positionCalendarPopup();
        });
    }
    handleBSDateClick(event) {
        if (isDestroyed(this.state))
            return;
        const target = event.target;
        const dayEl = target.closest(".nepali-day");
        if (!dayEl || dayEl.disabled)
            return;
        event.stopPropagation();
        this.selectBSDate(dayEl);
    }
    commitDate(date) {
        if (isDestroyed(this.state) || !this.canSelect(date))
            return;
        this.state = setSelected(this.state, date);
        const formatted = formatBS(date, this.format, {
            language: this.language,
        });
        this.inputElement.value = formatted;
        this.inputElement.dispatchEvent(new Event("change", { bubbles: true }));
        this.closeCalendar({ restoreFocus: true });
    }
    selectBSDate(dayElement) {
        if (isDestroyed(this.state))
            return;
        if (dayElement instanceof HTMLButtonElement &&
            dayElement.disabled) {
            return;
        }
        const yearAttr = dayElement.dataset.year;
        const monthAttr = dayElement.dataset.month;
        const dayAttr = dayElement.dataset.day;
        let day = parseInt(dayAttr !== null && dayAttr !== void 0 ? dayAttr : "0", 10);
        let month = yearAttr && monthAttr
            ? parseInt(monthAttr, 10)
            : this.state.view.month;
        let year = yearAttr ? parseInt(yearAttr, 10) : this.state.view.year;
        if (!yearAttr || !monthAttr) {
            // Fallback for legacy attributes
            month = this.state.view.month;
            year = this.state.view.year;
            if (this.floatingCalendar) {
                const monthSelect = this.floatingCalendar.querySelector(".nepali-month-select");
                const yearSelect = this.floatingCalendar.querySelector(".nepali-year-select");
                if (monthSelect && yearSelect) {
                    month = parseInt(monthSelect.value, 10) + 1;
                    year = parseInt(yearSelect.value, 10);
                }
            }
            if (dayElement.dataset.other === "prev") {
                month -= 1;
                if (month < 1) {
                    month = 12;
                    year -= 1;
                }
            }
            else if (dayElement.dataset.other === "next") {
                month += 1;
                if (month > 12) {
                    month = 1;
                    year += 1;
                }
            }
        }
        this.commitDate({ year, month, day });
    }
    selectToday() {
        if (isDestroyed(this.state))
            return;
        if (!this.canSelect(this.state.today)) {
            return;
        }
        this.commitDate({ ...this.state.today });
    }
    /**
     * Clear: empty input, clear selection, fire `change`, keep popup open.
     * Does not select today or any fallback date.
     */
    clearDate() {
        if (isDestroyed(this.state))
            return;
        this.state = clearSelected(this.state);
        this.inputElement.value = "";
        this.inputElement.dispatchEvent(new Event("change", { bubbles: true }));
        this.renderCalendar(this.state.view.year, this.state.view.month, {
            moveDomFocus: true,
        });
    }
    syncFocusedToView() {
        var _a;
        const preferred = clampDay(this.state.view.year, this.state.view.month, this.state.focused.day);
        const next = (_a = nearestSelectableInMonth(preferred, (d) => this.canSelect(d))) !== null && _a !== void 0 ? _a : resolveInitialFocus(preferred, (d) => this.canSelect(d));
        this.state = setFocused(this.state, next);
    }
    previousBSMonth() {
        if (isDestroyed(this.state))
            return;
        this.state = previousMonth(this.state);
        this.syncFocusedToView();
        this.renderCalendar(this.state.view.year, this.state.view.month, {
            moveDomFocus: true,
        });
    }
    nextBSMonth() {
        if (isDestroyed(this.state))
            return;
        this.state = nextMonth(this.state);
        this.syncFocusedToView();
        this.renderCalendar(this.state.view.year, this.state.view.month, {
            moveDomFocus: true,
        });
    }
    changeBSMonth(event) {
        if (isDestroyed(this.state))
            return;
        const target = event.target;
        const newMonth0 = parseInt(target.value, 10);
        this.state = setView(this.state, this.state.view.year, newMonth0 + 1);
        this.syncFocusedToView();
        this.renderCalendar(this.state.view.year, this.state.view.month, {
            moveDomFocus: true,
        });
    }
    changeBSYear(event) {
        if (isDestroyed(this.state))
            return;
        const target = event.target;
        const newYear = parseInt(target.value, 10);
        this.state = setView(this.state, newYear, this.state.view.month);
        this.syncFocusedToView();
        this.renderCalendar(this.state.view.year, this.state.view.month, {
            moveDomFocus: true,
        });
    }
    positionCalendarPopup() {
        if (!this.floatingCalendar)
            return;
        // Measure once, then write styles (avoid interleaving reads/writes).
        const inputRect = this.inputElement.getBoundingClientRect();
        const calendarRect = this.floatingCalendar.getBoundingClientRect();
        const viewport = readViewport(window);
        const position = computePopupPosition(inputRect, calendarRect, viewport);
        applyPopupPositionStyles(this.floatingCalendar, position, this.effectiveZIndex());
    }
    closeCalendar(opts) {
        this.state = closePicker(this.state);
        this.setExpanded(false);
        this.teardownCalendarDom();
        if (opts.restoreFocus) {
            this.inputElement.focus();
        }
    }
    closeAllOtherCalendars() {
        NepaliDatePicker.instances.forEach(instance => {
            if (instance !== this && instance.state.open && !isDestroyed(instance.state)) {
                instance.closeCalendar({ restoreFocus: false });
            }
        });
    }
    setZIndex(zIndex) {
        if (isDestroyed(this.state))
            return;
        this.runtimeZIndex = zIndex;
        if (this.floatingCalendar) {
            this.floatingCalendar.style.zIndex = String(this.effectiveZIndex());
        }
    }
    destroy() {
        if (isDestroyed(this.state)) {
            return;
        }
        this.closeCalendar({ restoreFocus: false });
        this.detachPositionListeners();
        this.inputElement.removeEventListener("click", this.onInputClick);
        document.removeEventListener("click", this.onDocumentClick);
        document.removeEventListener("keydown", this.onDocumentKeydown);
        this.restoreInputAria();
        this.state = markDestroyed(this.state);
        NepaliDatePicker.instances.delete(this);
    }
}
NepaliDatePicker.instances = new Set();

class NepaliPatro {
    /**
     * Converts a Gregorian (AD) date to Bikram Sambat (BS)
     * @param date AD date to convert, can be a Date object or [year, month, day] array
     * @returns NepaliDate object representing the equivalent BS date
     */
    static convertADToBS(date) {
        return convertADToBS(date);
    }
    /**
     * Converts a Bikram Sambat (BS) date to Gregorian (AD)
     * @param bsDate BS date to convert, can be a NepaliDate object or [year, month, day] array
     * @returns JavaScript Date object representing the equivalent AD date
     */
    static convertBSToAD(bsDate) {
        return convertBSToAD(bsDate);
    }
    /**
     * Date-only AD → BS (timezone-independent). Prefer over Date-based convertADToBS.
     */
    static convertAdToBs(ad) {
        return convertAdToBs(ad);
    }
    /**
     * Date-only BS → AD civil date (timezone-independent). Prefer over convertBSToAD.
     */
    static convertBsToAd(bs) {
        return convertBsToAd(bs);
    }
    /**
     * Gets the current date in Bikram Sambat calendar
     * @returns Current date as NepaliDate object
     */
    static getCurrentBSDate() {
        return getCurrentBSDate();
    }
    /**
     * Formats a Nepali date according to the specified format string
     * @param date The Nepali date to format
     * @param format The format string
     * @param options : {} Formatting options
     * @returns Formatted date string
     */
    static formatBS(date, format = "YYYY-MM-DD", options = {}) {
        return formatBS(date, format, options);
    }
    /**
     * Gets the number of days in a Nepali month
     * @param year The Nepali year in BS calendar
     * @param month The month (1-12)
     * @returns Number of days in the specified month
     */
    static getDaysInMonth(year, month) {
        return getDaysInMonth(year, month);
    }
    /**
     * Converts English digits to Nepali digits
     * @param num The number to convert
     * @returns String with Nepali digits
     */
    static toNepaliDigits(num) {
        return toNepaliDigits(num);
    }
    /**
     * Converts Nepali digits to English digits
     * @param text The text containing Nepali digits to convert
     * @returns String with English digits
     */
    static nepaliDigitsToEnglish(text) {
        return nepaliDigitsToEnglish(text);
    }
    /**
     * Gets common date format patterns for parsing various date formats
     * @returns Array of date format patterns with regex and index mappings
     */
    static getDateFormatPatterns() {
        return getDateFormatPatterns();
    }
    /**
     * Gets the current date by using .now() method
     * @returns Current date as NepaliDate object
     */
    static now() {
        return this.getCurrentBSDate();
    }
}
NepaliPatro.MIN_YEAR = MIN_BS_YEAR;
NepaliPatro.MAX_YEAR = MAX_BS_YEAR;
NepaliPatro.MIN_AD_YEAR = MIN_AD_YEAR;
if (typeof window !== "undefined") {
    window.NepaliDatePicker = NepaliDatePicker;
}

export { NepaliDatePicker, NepaliMonth, NepaliMonthNepali, NepaliPatro, NepaliWeekDay, NepaliWeekDayNepali, REF_AD_YMD, REF_BS, convertADToBS, convertAdToBs, convertBSToAD, convertBsToAd, NepaliPatro as default, formatBS as formatBSDate, getBsWeekdayIndex, getCurrentBSDate, getDateFormatPatterns, getDaysInMonth, nepaliDigitsToEnglish, toNepaliDigits };
//# sourceMappingURL=nepali-patro-js.esm.js.map
