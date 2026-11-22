/**
 * Stage 3.6 — AD equivalent formatting + conversion ownership.
 */

import { getDaysInMonth } from '../../core/calendar';
import { REF_AD_YMD, REF_BS } from '../../core/calendar-data';
import { convertBsToAd } from '../../core/converters/date-only';
import { GOLDEN_CONVERSIONS } from '../conversion/fixtures';
import {
  convertBsToAdOrNull,
  formatAdAccessibleSuffix,
  formatAdCellDay,
  formatAdEquivalentLine,
  formatAdFullLabel,
} from '../../ui/ad-display';

describe('ad-display (Stage 3.6)', () => {
  it('uses core convertBsToAd for the reference epoch', () => {
    expect(convertBsToAdOrNull(REF_BS)).toEqual(REF_AD_YMD);
    expect(convertBsToAdOrNull(REF_BS)).toEqual(convertBsToAd(REF_BS));
  });

  it('matches golden BS→AD fixtures', () => {
    for (const fixture of GOLDEN_CONVERSIONS) {
      if (!fixture.directions.includes('bs-to-ad')) continue;
      expect(convertBsToAdOrNull(fixture.bs)).toEqual(fixture.ad);
    }
  });

  it('handles BS month / year boundaries via known New Years', () => {
    expect(convertBsToAdOrNull({ year: 2080, month: 1, day: 1 })).toEqual({
      year: 2023,
      month: 4,
      day: 14,
    });
    // Day before 2080 New Year = last day of 2079 Chaitra
    const last = getDaysInMonth(2079, 12);
    const prev = convertBsToAdOrNull({
      year: 2079,
      month: 12,
      day: last,
    });
    expect(prev).toEqual({ year: 2023, month: 4, day: 13 });
  });

  it('formats English and Nepali digit variants', () => {
    const ad = { year: 2023, month: 4, day: 14 };
    expect(formatAdFullLabel(ad, 'en')).toBe('14 Apr 2023');
    expect(formatAdCellDay(ad, 'en')).toBe('14');
    expect(formatAdCellDay(ad, 'np')).toBe('१४');
    expect(formatAdEquivalentLine({ year: 2080, month: 1, day: 1 }, 'en')).toBe(
      'AD · 14 Apr 2023'
    );
    expect(
      formatAdEquivalentLine({ year: 2080, month: 1, day: 1 }, 'np')
    ).toContain('ईस्वी');
    expect(
      formatAdAccessibleSuffix({ year: 2080, month: 1, day: 1 }, 'en')
    ).toBe('AD 14 Apr 2023');
  });

  it('returns null / empty for out-of-range BS dates', () => {
    expect(convertBsToAdOrNull({ year: 1999, month: 1, day: 1 })).toBeNull();
    expect(
      formatAdEquivalentLine({ year: 1999, month: 1, day: 1 }, 'en')
    ).toBe('');
  });
});
