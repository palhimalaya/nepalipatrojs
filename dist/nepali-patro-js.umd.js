(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NepaliPatro = {}));
})(this, (function (exports) { 'use strict';

    /**
     * Month names in Nepali language (Devanagari script)
     */
    exports.NepaliMonth = void 0;
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
    })(exports.NepaliMonth || (exports.NepaliMonth = {}));
    /**
     * Month names in Nepali language (Devanagari script)
     */
    exports.NepaliMonthNepali = void 0;
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
    })(exports.NepaliMonthNepali || (exports.NepaliMonthNepali = {}));
    /**
     * Days of the week in Nepali language (English transliteration)
     */
    exports.NepaliWeekDay = void 0;
    (function (NepaliWeekDay) {
        NepaliWeekDay[NepaliWeekDay["Aitabar"] = 1] = "Aitabar";
        NepaliWeekDay[NepaliWeekDay["Sombar"] = 2] = "Sombar";
        NepaliWeekDay[NepaliWeekDay["Mangalbar"] = 3] = "Mangalbar";
        NepaliWeekDay[NepaliWeekDay["Budhabar"] = 4] = "Budhabar";
        NepaliWeekDay[NepaliWeekDay["Bihibar"] = 5] = "Bihibar";
        NepaliWeekDay[NepaliWeekDay["Sukrabar"] = 6] = "Sukrabar";
        NepaliWeekDay[NepaliWeekDay["Sanibar"] = 7] = "Sanibar";
    })(exports.NepaliWeekDay || (exports.NepaliWeekDay = {}));
    /**
     * Days of the week in Nepali language (Devanagari script)
     */
    exports.NepaliWeekDayNepali = void 0;
    (function (NepaliWeekDayNepali) {
        NepaliWeekDayNepali[NepaliWeekDayNepali["\u0906\u0907\u0924\u092C\u093E\u0930"] = 1] = "\u0906\u0907\u0924\u092C\u093E\u0930";
        NepaliWeekDayNepali[NepaliWeekDayNepali["\u0938\u094B\u092E\u092C\u093E\u0930"] = 2] = "\u0938\u094B\u092E\u092C\u093E\u0930";
        NepaliWeekDayNepali[NepaliWeekDayNepali["\u092E\u0902\u0917\u0932\u092C\u093E\u0930"] = 3] = "\u092E\u0902\u0917\u0932\u092C\u093E\u0930";
        NepaliWeekDayNepali[NepaliWeekDayNepali["\u092C\u0941\u0927\u092C\u093E\u0930"] = 4] = "\u092C\u0941\u0927\u092C\u093E\u0930";
        NepaliWeekDayNepali[NepaliWeekDayNepali["\u092C\u093F\u0939\u093F\u092C\u093E\u0930"] = 5] = "\u092C\u093F\u0939\u093F\u092C\u093E\u0930";
        NepaliWeekDayNepali[NepaliWeekDayNepali["\u0936\u0941\u0915\u094D\u0930\u092C\u093E\u0930"] = 6] = "\u0936\u0941\u0915\u094D\u0930\u092C\u093E\u0930";
        NepaliWeekDayNepali[NepaliWeekDayNepali["\u0936\u0928\u093F\u092C\u093E\u0930"] = 7] = "\u0936\u0928\u093F\u092C\u093E\u0930";
    })(exports.NepaliWeekDayNepali || (exports.NepaliWeekDayNepali = {}));

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
    const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

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

    function compareBs(a, b) {
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
        if (compareBs(date1, date2) === 0)
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
     * Localization / presentation utilities (Stage 2.3).
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
            return exports.NepaliMonthNepali[month];
        }
        else {
            return exports.NepaliMonth[month];
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
        const monthName = language === 'en' ? exports.NepaliMonth[date.month] : exports.NepaliMonthNepali[date.month];
        const monthShort = language === 'en' ? exports.NepaliMonth[date.month].substring(0, 3) : exports.NepaliMonthNepali[date.month];
        const weekdayName = language === 'en'
            ? exports.NepaliWeekDay[weekDay]
            : exports.NepaliWeekDayNepali[weekDay];
        const weekdayShort = language === 'en'
            ? exports.NepaliWeekDay[weekDay].substring(0, 3)
            : exports.NepaliWeekDayNepali[weekDay];
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

    class NepaliDatePicker {
        constructor(inputElement, options = {}) {
            this.calendarVisible = false;
            this.currentBSYear = getCurrentBSDate().year;
            this.currentBSMonth = getCurrentBSDate().month - 1;
            this.currentBSDay = getCurrentBSDate().day;
            this.floatingCalendar = null;
            this.handleClickOutside = (event) => {
                const target = event.target;
                if (this.floatingCalendar &&
                    target &&
                    !this.floatingCalendar.contains(target) &&
                    !this.inputElement.contains(target)) {
                    this.closeCalendar();
                }
            };
            this.inputElement = inputElement;
            this.format = options.format || "YYYY-MM-DD";
            this.theme = options.theme || "light";
            this.language = options.language || "en";
            // Calculate appropriate z-index
            this.zIndex = this.calculateZIndex(options.zIndex);
            NepaliDatePicker.instances.add(this);
            this.init();
        }
        // Method to calculate the appropriate z-index
        calculateZIndex(customZIndex) {
            if (customZIndex) {
                return customZIndex;
            }
            // Find the highest z-index in the current context
            const highestZIndex = this.getHighestZIndex();
            // Use a much higher base z-index for modals
            const baseZIndex = Math.max(highestZIndex + 1000, 999999);
            return baseZIndex;
        }
        // Method to find the highest z-index in the current document
        getHighestZIndex() {
            let highest = 0;
            // Check if input is inside a modal or high z-index container
            let element = this.inputElement;
            while (element && element !== document.body) {
                const zIndex = window.getComputedStyle(element).zIndex;
                if (zIndex !== 'auto' && zIndex !== '' && !isNaN(parseInt(zIndex))) {
                    const numericZIndex = parseInt(zIndex);
                    if (numericZIndex > highest) {
                        highest = numericZIndex;
                    }
                }
                element = element.parentElement;
            }
            const modalSelectors = [
                '.modal',
                '.Modal',
                '[role="dialog"]',
                '[data-modal]',
                '.ant-modal',
                '.MuiModal-root',
                '.v-dialog',
                '.el-dialog',
                '.ui-dialog',
                '.swal2-container',
                '.popup',
                '.overlay',
                '.modal-overlay',
                '.dialog',
                '.lightbox'
            ];
            modalSelectors.forEach(selector => {
                const modals = document.querySelectorAll(selector);
                modals.forEach(modal => {
                    const zIndex = window.getComputedStyle(modal).zIndex;
                    if (zIndex !== 'auto' && zIndex !== '' && !isNaN(parseInt(zIndex))) {
                        const numericZIndex = parseInt(zIndex);
                        if (numericZIndex > highest) {
                            highest = numericZIndex;
                        }
                    }
                });
            });
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                const zIndex = window.getComputedStyle(el).zIndex;
                if (zIndex !== 'auto' && zIndex !== '' && !isNaN(parseInt(zIndex))) {
                    const numericZIndex = parseInt(zIndex);
                    if (numericZIndex > highest) {
                        highest = numericZIndex;
                    }
                }
            });
            return highest;
        }
        init() {
            this.inputElement.addEventListener("click", (e) => {
                e.stopPropagation();
                this.toggleCalendar();
            });
            document.addEventListener("click", this.handleClickOutside);
        }
        toggleCalendar() {
            if (this.calendarVisible) {
                this.closeCalendar();
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
                if (parsedDate) {
                    this.currentBSYear = parsedDate.year;
                    this.currentBSMonth = parsedDate.month - 1;
                    this.currentBSDay = parsedDate.day;
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
        /**
         * Days in BS month via getDaysInMonth only (single calendar truth).
         * Numeric fallback (30) applies only when `year` is outside MIN/MAX_BS_YEAR —
         * used solely for adjacent-month grid padding (e.g. days before Baisakh of
         * MIN_BS_YEAR). Does not read calendar data. Unexpected core errors for
         * supported years are rethrown, not swallowed.
         */
        daysInBsMonth(year, month1Based, fallback = 30) {
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
        openCalendar() {
            // Close all other calendars before opening this one
            this.closeAllOtherCalendars();
            // Recalculate z-index in case the context has changed
            this.zIndex = this.calculateZIndex();
            // Parse existing value from input field if present
            this.parseAndSetDateFromInput();
            this.calendarVisible = true;
            this.renderCalendar(this.currentBSYear, this.currentBSMonth);
        }
        renderCalendar(bsYear, bsMonth) {
            if (this.floatingCalendar && this.floatingCalendar.parentNode) {
                this.floatingCalendar.parentNode.removeChild(this.floatingCalendar);
            }
            const calendarDiv = document.createElement("div");
            calendarDiv.className = `nepali-datepicker nepali-datepicker-${this.theme}`;
            calendarDiv.innerHTML = this.generateCalendarHtml(bsYear, bsMonth);
            this.setupCalendarEvents(calendarDiv);
            const modalContainer = this.findModalContainer();
            const appendTarget = modalContainer || document.body;
            appendTarget.appendChild(calendarDiv);
            this.floatingCalendar = calendarDiv;
            this.positionCalendarPopup();
        }
        findModalContainer() {
            let element = this.inputElement;
            while (element && element !== document.body) {
                const classList = element.classList;
                const role = element.getAttribute('role');
                const tagName = element.tagName.toLowerCase();
                if (tagName === 'dialog') {
                    return element;
                }
                if (classList.contains('modal') ||
                    classList.contains('Modal') ||
                    classList.contains('popup') ||
                    classList.contains('dialog') ||
                    classList.contains('overlay') ||
                    role === 'dialog' ||
                    element.hasAttribute('data-modal') ||
                    // Check for high z-index that might indicate a modal
                    (window.getComputedStyle(element).zIndex !== 'auto' &&
                        parseInt(window.getComputedStyle(element).zIndex) > 1000)) {
                    return element;
                }
                element = element.parentElement;
            }
            return null;
        }
        generateCalendarHtml(bsYear, bsMonth) {
            // Supported years via range constants (not raw dataset keys)
            let yearOptions = "";
            for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
                yearOptions += `<option value="${y}"${y === bsYear ? " selected" : ""}>${localizeDigits(y, this.language)}</option>`;
            }
            let monthOptions = "";
            for (let i = 0; i < 12; i++) {
                monthOptions += `<option value="${i}"${i === bsMonth ? " selected" : ""}>${localizeMonth(i + 1, this.language)}</option>`;
            }
            // bsMonth is 0-based in the picker; getDaysInMonth expects 1-based
            const daysInMonth = this.daysInBsMonth(bsYear, bsMonth + 1);
            // Calculate the weekday of the 1st day of this BS month
            const firstDayOfWeek = this.getBSFirstDayOfWeek(bsYear, bsMonth);
            // Get days in previous month
            let prevMonth = bsMonth - 1;
            let prevYear = bsYear;
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear--;
            }
            const lastDayOfPrevMonth = this.daysInBsMonth(prevYear, prevMonth + 1);
            const weekdays = this.language === "np"
                ? ["आ", "सो", "मं", "बु", "बि", "शु", "श"]
                : ["S", "M", "T", "W", "T", "F", "S"];
            return `
      <div class="nepali-datepicker-header">
        <button type="button" class="nepali-nav-btn nepali-prev-btn">&#9664;</button>
        <div class="nepali-header-content">
          <select class="nepali-month-select">${monthOptions}</select>
          <select class="nepali-year-select">${yearOptions}</select>
        </div>
        <button type="button" class="nepali-nav-btn nepali-next-btn">&#9654;</button>
      </div>
      <div class="nepali-weekdays">
        ${weekdays.map(day => `<div class="nepali-weekday">${day}</div>`).join('')}
      </div>
      <div class="nepali-calendar-body">
        ${this.generateBSDaysFullGrid(bsYear, bsMonth, daysInMonth, firstDayOfWeek, lastDayOfPrevMonth)}
      </div>
    `;
        }
        getBSFirstDayOfWeek(bsYear, bsMonth) {
            try {
                const adDate = convertBSToAD({
                    year: bsYear,
                    month: bsMonth + 1,
                    day: 1,
                });
                if (adDate instanceof Date && !isNaN(adDate.getTime())) {
                    return adDate.getDay();
                }
            }
            catch (e) {
                console.log("Error converting BS to AD:", e);
            }
            return 0;
        }
        // Render the days grid for BS calendar
        generateBSDaysFullGrid(bsYear, bsMonth, daysInMonth, firstDayOfWeek, lastDayOfPrevMonth) {
            let daysHTML = "";
            const totalCells = 42;
            // Previous month days
            for (let i = 0; i < firstDayOfWeek; i++) {
                const prevDay = lastDayOfPrevMonth - firstDayOfWeek + i + 1;
                daysHTML += `<div class="nepali-day nepali-other-month" data-day="${prevDay}" data-other="prev">${localizeDigits(prevDay, this.language)}</div>`;
            }
            // Current month days
            for (let day = 1; day <= daysInMonth; day++) {
                let classes = "nepali-day";
                if (this.isBSSelectedDate(bsYear, bsMonth, day))
                    classes += " nepali-selected";
                daysHTML += `<div class="${classes}" data-day="${day}">${localizeDigits(day, this.language)}</div>`;
            }
            // Next month days
            const daysFilled = firstDayOfWeek + daysInMonth;
            for (let i = 1; i <= totalCells - daysFilled; i++) {
                daysHTML += `<div class="nepali-day nepali-other-month" data-day="${i}" data-other="next">${localizeDigits(i, this.language)}</div>`;
            }
            return daysHTML;
        }
        isBSSelectedDate(bsYear, bsMonth, bsDay) {
            return (bsYear === this.currentBSYear &&
                bsMonth === this.currentBSMonth &&
                bsDay === this.currentBSDay);
        }
        setupCalendarEvents(calendarDiv) {
            const prevButton = calendarDiv.querySelector(".nepali-prev-btn");
            const nextButton = calendarDiv.querySelector(".nepali-next-btn");
            const monthSelect = calendarDiv.querySelector(".nepali-month-select");
            const yearSelect = calendarDiv.querySelector(".nepali-year-select");
            prevButton === null || prevButton === void 0 ? void 0 : prevButton.addEventListener("click", (e) => {
                e.stopPropagation();
                this.previousBSMonth();
            });
            nextButton === null || nextButton === void 0 ? void 0 : nextButton.addEventListener("click", (e) => {
                e.stopPropagation();
                this.nextBSMonth();
            });
            monthSelect === null || monthSelect === void 0 ? void 0 : monthSelect.addEventListener("change", (e) => {
                e.stopPropagation();
                this.changeBSMonth(e);
            });
            yearSelect === null || yearSelect === void 0 ? void 0 : yearSelect.addEventListener("change", (e) => {
                e.stopPropagation();
                this.changeBSYear(e);
            });
            calendarDiv.addEventListener("click", (e) => this.handleBSDateClick(e));
        }
        handleBSDateClick(event) {
            const target = event.target;
            const dayEl = target.closest(".nepali-day");
            if (!dayEl)
                return;
            event.stopPropagation();
            this.selectBSDate(dayEl);
        }
        selectBSDate(dayElement) {
            var _a;
            let day = parseInt((_a = dayElement.dataset.day) !== null && _a !== void 0 ? _a : "0", 10);
            let month = this.currentBSMonth;
            let year = this.currentBSYear;
            if (this.floatingCalendar) {
                const monthSelect = this.floatingCalendar.querySelector(".nepali-month-select");
                const yearSelect = this.floatingCalendar.querySelector(".nepali-year-select");
                if (monthSelect && yearSelect) {
                    month = parseInt(monthSelect.value, 10);
                    year = parseInt(yearSelect.value, 10);
                }
            }
            if (dayElement.dataset.other === "prev") {
                month -= 1;
                if (month < 0) {
                    month = 11;
                    year -= 1;
                }
            }
            else if (dayElement.dataset.other === "next") {
                month += 1;
                if (month > 11) {
                    month = 0;
                    year += 1;
                }
            }
            this.currentBSYear = year;
            this.currentBSMonth = month;
            this.currentBSDay = day;
            const date = {
                year: this.currentBSYear,
                month: this.currentBSMonth + 1,
                day: this.currentBSDay,
            };
            const formatted = formatBS(date, this.format, {
                language: this.language,
            });
            this.inputElement.value = formatted;
            this.inputElement.dispatchEvent(new Event("change", { bubbles: true }));
            this.closeCalendar();
        }
        previousBSMonth() {
            let month = this.currentBSMonth - 1;
            let year = this.currentBSYear;
            if (month < 0) {
                month = 11;
                year--;
            }
            this.currentBSMonth = month;
            this.currentBSYear = year;
            this.renderCalendar(year, month);
        }
        nextBSMonth() {
            let month = this.currentBSMonth + 1;
            let year = this.currentBSYear;
            if (month > 11) {
                month = 0;
                year++;
            }
            this.currentBSMonth = month;
            this.currentBSYear = year;
            this.renderCalendar(year, month);
        }
        changeBSMonth(event) {
            const target = event.target;
            const newMonth = parseInt(target.value, 10);
            this.currentBSMonth = newMonth;
            this.renderCalendar(this.currentBSYear, newMonth);
        }
        changeBSYear(event) {
            const target = event.target;
            const newYear = parseInt(target.value, 10);
            this.currentBSYear = newYear;
            this.renderCalendar(newYear, this.currentBSMonth);
        }
        positionCalendarPopup() {
            if (!this.floatingCalendar)
                return;
            this.floatingCalendar.style.position = "absolute";
            this.floatingCalendar.style.zIndex = this.zIndex.toString();
            const inputRect = this.inputElement.getBoundingClientRect();
            const calendarRect = this.floatingCalendar.getBoundingClientRect();
            let top = inputRect.bottom + window.scrollY + 4;
            let left = inputRect.left + window.scrollX;
            if (window.innerHeight - inputRect.bottom < calendarRect.height &&
                inputRect.top > calendarRect.height) {
                top = inputRect.top + window.scrollY - calendarRect.height - 4;
            }
            if (window.innerWidth - inputRect.left < calendarRect.width) {
                left = inputRect.right + window.scrollX - calendarRect.width;
            }
            this.floatingCalendar.style.top = `${top}px`;
            this.floatingCalendar.style.left = `${left}px`;
        }
        closeCalendar() {
            this.calendarVisible = false;
            if (this.floatingCalendar && this.floatingCalendar.parentNode) {
                this.floatingCalendar.parentNode.removeChild(this.floatingCalendar);
                this.floatingCalendar = null;
            }
        }
        closeAllOtherCalendars() {
            NepaliDatePicker.instances.forEach(instance => {
                if (instance !== this && instance.calendarVisible) {
                    instance.closeCalendar();
                }
            });
        }
        setZIndex(zIndex) {
            this.zIndex = zIndex;
            if (this.floatingCalendar) {
                this.floatingCalendar.style.zIndex = zIndex.toString();
            }
        }
        destroy() {
            this.closeCalendar();
            document.removeEventListener("click", this.handleClickOutside);
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

    exports.NepaliDatePicker = NepaliDatePicker;
    exports.NepaliPatro = NepaliPatro;
    exports.REF_AD_YMD = REF_AD_YMD;
    exports.REF_BS = REF_BS;
    exports.convertADToBS = convertADToBS;
    exports.convertAdToBs = convertAdToBs;
    exports.convertBSToAD = convertBSToAD;
    exports.convertBsToAd = convertBsToAd;
    exports.default = NepaliPatro;
    exports.formatBSDate = formatBS;
    exports.getBsWeekdayIndex = getBsWeekdayIndex;
    exports.getCurrentBSDate = getCurrentBSDate;
    exports.getDateFormatPatterns = getDateFormatPatterns;
    exports.getDaysInMonth = getDaysInMonth;
    exports.nepaliDigitsToEnglish = nepaliDigitsToEnglish;
    exports.toNepaliDigits = toNepaliDigits;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=nepali-patro-js.umd.js.map
