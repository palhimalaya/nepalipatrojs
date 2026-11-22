/**
 * ISS-003 — AD→BS prefix-table correctness.
 *
 * Compares production convertAdToBs against the pre-optimization day-by-day
 * walk for every supported Gregorian date in the BS span (36,525 dates).
 * The oracle is test-only and must not be used in production.
 */

import { convertAdToBs, convertBsToAd } from '../../converters/date-only';
import {
  BS_CALENDAR_DATA,
  MAX_BS_YEAR,
  MIN_BS_YEAR,
  REF_AD_YMD,
  REF_BS,
} from '../../constants/calendar-data';
import { getDaysInMonth } from '../../utils/helpers';
import { daysBetweenGregorian } from '../../utils/gregorian';
import {
  BS_SUPPORTED_DAY_COUNT,
  bsPrefixTableByteLength,
} from '../../converters/bs-prefix';
import { CalendarDate } from '../../types';

/** Pre-ISS-003 day-by-day AD→BS (oracle). */
function convertAdToBsDayWalk(ad: CalendarDate): CalendarDate {
  const daysDiff = daysBetweenGregorian(REF_AD_YMD, ad);
  let bsYear = REF_BS.year;
  let bsMonth = REF_BS.month;
  let bsDay = REF_BS.day;
  let daysLeft = daysDiff;

  while (daysLeft > 0) {
    const dim = getDaysInMonth(bsYear, bsMonth);
    if (bsDay < dim) {
      bsDay++;
    } else {
      bsDay = 1;
      if (bsMonth < 12) {
        bsMonth++;
      } else {
        bsMonth = 1;
        bsYear++;
        if (!BS_CALENDAR_DATA[bsYear]) {
          throw new Error(
            `Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`
          );
        }
      }
    }
    daysLeft--;
  }

  while (daysLeft < 0) {
    if (bsDay > 1) {
      bsDay--;
    } else {
      if (bsMonth > 1) {
        bsMonth--;
      } else {
        bsYear--;
        if (!BS_CALENDAR_DATA[bsYear]) {
          throw new Error(
            `Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`
          );
        }
        bsMonth = 12;
      }
      bsDay = getDaysInMonth(bsYear, bsMonth);
    }
    daysLeft++;
  }

  return { year: bsYear, month: bsMonth, day: bsDay };
}

describe('ISS-003 AD→BS prefix tables', () => {
  it('prefix span equals 36525 supported BS days', () => {
    expect(BS_SUPPORTED_DAY_COUNT).toBe(36525);
    expect(bsPrefixTableByteLength()).toBeGreaterThan(0);
    expect(bsPrefixTableByteLength()).toBeLessThan(8 * 1024);
  });

  it('reference epoch', () => {
    expect(convertAdToBs(REF_AD_YMD)).toEqual(REF_BS);
  });

  it('rejects AD dates before REF (same as day-walk)', () => {
    const before = { year: 1943, month: 4, day: 13 };
    expect(() => convertAdToBs(before)).toThrow(/Year out of range/);
    expect(() => convertAdToBsDayWalk(before)).toThrow(/Year out of range/);
  });

  it('rejects AD past last supported BS day', () => {
    const lastBs = {
      year: MAX_BS_YEAR,
      month: 12,
      day: getDaysInMonth(MAX_BS_YEAR, 12),
    };
    const lastAd = convertBsToAd(lastBs);
    const d = new Date(lastAd.year, lastAd.month - 1, lastAd.day);
    d.setDate(d.getDate() + 1);
    const pastAd = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
    expect(() => convertAdToBs(pastAd)).toThrow(/Year out of range/);
  });

  it('first/last day of every BS month matches day-walk (via Bs→Ad)', () => {
    for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
      for (let m = 1; m <= 12; m++) {
        const dim = getDaysInMonth(y, m);
        for (const day of [1, dim]) {
          const bs = { year: y, month: m, day };
          const ad = convertBsToAd(bs);
          expect(convertAdToBs(ad)).toEqual(bs);
          expect(convertAdToBsDayWalk(ad)).toEqual(bs);
        }
      }
    }
  });

  it('year boundaries month 12 → 1', () => {
    for (let y = MIN_BS_YEAR; y < MAX_BS_YEAR; y++) {
      const last = {
        year: y,
        month: 12,
        day: getDaysInMonth(y, 12),
      };
      const next = { year: y + 1, month: 1, day: 1 };
      expect(convertAdToBs(convertBsToAd(last))).toEqual(last);
      expect(convertAdToBs(convertBsToAd(next))).toEqual(next);
    }
  });

  it('exhaustive: every supported AD date matches day-walk oracle (36525)', () => {
    let compared = 0;
    for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
      for (let m = 1; m <= 12; m++) {
        const dim = getDaysInMonth(y, m);
        for (let d = 1; d <= dim; d++) {
          const bs = { year: y, month: m, day: d };
          const ad = convertBsToAd(bs);
          const got = convertAdToBs(ad);
          const oracle = convertAdToBsDayWalk(ad);
          expect(got).toEqual(bs);
          expect(got).toEqual(oracle);
          compared++;
        }
      }
    }
    expect(compared).toBe(36525);
  }, 120_000);
});
