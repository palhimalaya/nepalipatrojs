import {
  BS_CALENDAR_DATA,
  MIN_BS_YEAR,
  MAX_BS_YEAR,
  MIN_AD_YEAR,
  REF_BS,
  REF_AD,
} from '../../constants/calendar-data';
import { getDaysInMonth } from '../../utils/helpers';
import { validateBsDate } from '../../utils/validations';
import { createHash } from 'crypto';

/** SHA-256 of serialized 2000–2099 month table (Phase 1 Step 4 baseline). */
export const BS_CALENDAR_DATA_SHA256 =
  'f9c4b277303e8f909532f95312f7eaaf929b37a7ff0c124f9fe494cd6f7bb29f';

describe('Calendar dataset structural integrity', () => {
  const years = Object.keys(BS_CALENDAR_DATA)
    .map(Number)
    .sort((a, b) => a - b);

  it('covers exactly the documented BS year range', () => {
    expect(MIN_BS_YEAR).toBe(2000);
    expect(MAX_BS_YEAR).toBe(2099);
    expect(years[0]).toBe(MIN_BS_YEAR);
    expect(years[years.length - 1]).toBe(MAX_BS_YEAR);
    expect(years).toHaveLength(MAX_BS_YEAR - MIN_BS_YEAR + 1);
  });

  it('years are contiguous with no gaps', () => {
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBe(years[i - 1] + 1);
    }
  });

  it('every year has exactly 12 positive month lengths and matching total', () => {
    for (const year of years) {
      const entry = BS_CALENDAR_DATA[year];
      expect(Array.isArray(entry)).toBe(true);
      expect(entry).toHaveLength(2);

      const [months, total] = entry;
      expect(months).toHaveLength(12);
      expect(Number.isInteger(total)).toBe(true);
      expect(total).toBeGreaterThan(0);

      for (const days of months) {
        expect(Number.isInteger(days)).toBe(true);
        expect(days).toBeGreaterThanOrEqual(29);
        expect(days).toBeLessThanOrEqual(32);
      }

      expect(months.reduce((a, b) => a + b, 0)).toBe(total);
    }
  });

  it('getDaysInMonth matches dataset month lengths', () => {
    for (const year of years) {
      for (let month = 1; month <= 12; month++) {
        expect(getDaysInMonth(year, month)).toBe(
          BS_CALENDAR_DATA[year][0][month - 1]
        );
      }
    }
  });

  it('reference constants match documented epoch', () => {
    expect(REF_BS).toEqual({ year: 2000, month: 1, day: 1 });
    expect(MIN_AD_YEAR).toBe(1943);
    expect(REF_AD.getFullYear()).toBe(1943);
    expect(REF_AD.getMonth() + 1).toBe(4);
    expect(REF_AD.getDate()).toBe(14);
  });

  it('first and last supported BS dates validate', () => {
    expect(() => validateBsDate(MIN_BS_YEAR, 1, 1)).not.toThrow();
    const lastDay = getDaysInMonth(MAX_BS_YEAR, 12);
    expect(() => validateBsDate(MAX_BS_YEAR, 12, lastDay)).not.toThrow();
  });

  it('rejects dates outside supported BS range', () => {
    expect(() => validateBsDate(MIN_BS_YEAR - 1, 1, 1)).toThrow(/Year out of range/);
    expect(() => validateBsDate(MAX_BS_YEAR + 1, 1, 1)).toThrow(/Year out of range/);
  });

  it('checksum of serialized dataset matches pinned fingerprint', () => {
    const payload = years
      .map((y) => `${y}:${BS_CALENDAR_DATA[y][0].join(',')}:${BS_CALENDAR_DATA[y][1]}`)
      .join('|');
    const digest = createHash('sha256').update(payload).digest('hex');
    expect(digest).toBe(BS_CALENDAR_DATA_SHA256);
  });
});
