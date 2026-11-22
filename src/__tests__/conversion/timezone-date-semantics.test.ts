/**
 * Phase 1 Step 5 — timezone / date semantics.
 *
 * Run this file (and the full suite) under multiple TZ values:
 *   TZ=UTC npx jest ...
 *   TZ=Asia/Kathmandu npx jest ...
 *   TZ=America/Los_Angeles npx jest ...
 *
 * Date-only APIs must yield identical civil results in every process.
 * Legacy Date input keeps local-field extraction (may differ by TZ for the same instant).
 */

import { convertADToBS } from '../../core/converters/ad-to-bs';
import { convertBSToAD } from '../../core/converters/bs-to-ad';
import {
  convertAdToBs,
  convertBsToAd,
  getAdWeekdayIndex,
  getBsWeekdayIndex,
} from '../../core/converters/date-only';
import { formatBS } from '../../i18n/format';
import { parseDateInput } from '../../core/calendar';
import { MAX_BS_YEAR, MIN_BS_YEAR, REF_AD_YMD, REF_BS } from '../../core/calendar-data';
import { getDaysInMonth } from '../../core/calendar';
import { NepaliWeekDay } from '../../i18n/names';

const HOST_TZ = process.env.TZ ?? '(unset — host default)';

/** Fixed civil expectations (sourced / dataset-implied; not from Date arithmetic). */
const CASES = [
  { id: 'ref', ad: REF_AD_YMD, bs: REF_BS },
  { id: 'ref+1', ad: { year: 1943, month: 4, day: 15 }, bs: { year: 2000, month: 1, day: 2 } },
  { id: 'leap-2024-02-29', ad: { year: 2024, month: 2, day: 29 }, bs: { year: 2080, month: 11, day: 17 } },
  { id: 'ny-2080', ad: { year: 2023, month: 4, day: 14 }, bs: { year: 2080, month: 1, day: 1 } },
  {
    id: 'last-baisakh-2080',
    ad: { year: 2023, month: 5, day: 14 },
    bs: { year: 2080, month: 1, day: 31 },
  },
  {
    id: 'bs-year-boundary',
    ad: { year: 2023, month: 4, day: 13 },
    bs: { year: 2079, month: 12, day: getDaysInMonth(2079, 12) },
  },
  { id: 'first-supported', ad: REF_AD_YMD, bs: { year: MIN_BS_YEAR, month: 1, day: 1 } },
  {
    id: 'last-supported',
    ad: convertBsToAd({
      year: MAX_BS_YEAR,
      month: 12,
      day: getDaysInMonth(MAX_BS_YEAR, 12),
    }),
    bs: {
      year: MAX_BS_YEAR,
      month: 12,
      day: getDaysInMonth(MAX_BS_YEAR, 12),
    },
  },
] as const;

describe(`Date-only APIs (TZ=${HOST_TZ})`, () => {
  it.each(CASES.map((c) => [c.id, c] as const))(
    '%s: convertAdToBs / convertBsToAd round-trip',
    (_id, c) => {
      expect(convertAdToBs(c.ad)).toEqual(c.bs);
      expect(convertBsToAd(c.bs)).toEqual(c.ad);
    }
  );

  it('array convertADToBS matches date-only (civil input)', () => {
    for (const c of CASES) {
      expect(convertADToBS([c.ad.year, c.ad.month, c.ad.day])).toEqual(c.bs);
    }
  });

  it('legacy convertBSToAD local Y/M/D match date-only AdDate', () => {
    for (const c of CASES) {
      const d = convertBSToAD(c.bs);
      expect(d.getFullYear()).toBe(c.ad.year);
      expect(d.getMonth() + 1).toBe(c.ad.month);
      expect(d.getDate()).toBe(c.ad.day);
    }
  });

  it('weekdays are stable for civil dates', () => {
    // 2080-01-01 BS = 2023-04-14 AD = Friday → Sukrabar (6)
    expect(getBsWeekdayIndex({ year: 2080, month: 1, day: 1 })).toBe(6);
    expect(getAdWeekdayIndex({ year: 2023, month: 4, day: 14 })).toBe(6);
    expect(NepaliWeekDay[6]).toBe('Sukrabar');
    expect(formatBS({ year: 2080, month: 1, day: 1 }, 'dddd')).toBe('Sukrabar');
    expect(formatBS({ year: 2080, month: 1, day: 1 }, 'YYYY-MM-DD')).toBe(
      '2080-01-01'
    );
  });
});

describe(`Legacy Date input semantics (TZ=${HOST_TZ})`, () => {
  it('local-midnight Date uses local civil fields', () => {
    const local = new Date(2023, 3, 14); // local Apr 14
    expect(convertADToBS(local)).toEqual({ year: 2080, month: 1, day: 1 });
  });

  it('UTC-midnight instant may differ from civil Apr 14 under western zones', () => {
    const utcMidnight = new Date(Date.UTC(2023, 3, 14)); // 2023-04-14T00:00:00Z
    const localY = utcMidnight.getFullYear();
    const localM = utcMidnight.getMonth() + 1;
    const localD = utcMidnight.getDate();
    const fromDate = convertADToBS(utcMidnight);
    const fromLocalFields = convertAdToBs({
      year: localY,
      month: localM,
      day: localD,
    });
    // Legacy Date path === local-field extraction (never UTC getters).
    expect(fromDate).toEqual(fromLocalFields);

    if (HOST_TZ === 'UTC' || HOST_TZ === 'Asia/Kathmandu') {
      // Both zones are UTC or UTC+5:45 — still Apr 14 locally at 00:00Z / evening prior N/A
      // At 00:00Z: UTC → Apr 14; Kathmandu → Apr 14 05:45 → Apr 14
      expect(localY).toBe(2023);
      expect(localM).toBe(4);
      expect(localD).toBe(14);
      expect(fromDate).toEqual({ year: 2080, month: 1, day: 1 });
    }

    if (HOST_TZ === 'America/Los_Angeles') {
      // 00:00Z Apr 14 = Apr 13 evening in PDT → local civil Apr 13
      expect(localY).toBe(2023);
      expect(localM).toBe(4);
      expect(localD).toBe(13);
      expect(fromDate).not.toEqual({ year: 2080, month: 1, day: 1 });
    }
  });
});

describe('Parsing / serialization (core converters)', () => {
  it('accepts NepaliDate objects and [y,m,d] arrays only', () => {
    expect(parseDateInput({ year: 2080, month: 1, day: 1 })).toEqual({
      year: 2080,
      month: 1,
      day: 1,
    });
    expect(parseDateInput([2080, 1, 1])).toEqual({
      year: 2080,
      month: 1,
      day: 1,
    });
  });

  it('does not parse YYYY-MM-DD strings in convert paths', () => {
    expect(() => parseDateInput('2023-04-14' as unknown as never)).toThrow(
      /Invalid date format/
    );
  });

  it('formatBS serializes BS civil fields without Date timestamps', () => {
    expect(formatBS({ year: 2080, month: 1, day: 1 }, 'YYYY-MM-DD')).toBe(
      '2080-01-01'
    );
    expect(formatBS({ year: 2080, month: 1, day: 1 }, 'DD/MM/YYYY')).toBe(
      '01/01/2080'
    );
  });
});
