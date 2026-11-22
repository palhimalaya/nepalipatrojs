import { convertADToBS } from '../../core/converters/ad-to-bs';
import { convertBSToAD } from '../../core/converters/bs-to-ad';
import { getDaysInMonth } from '../../core/calendar';
import { GOLDEN_CONVERSIONS } from './fixtures';
import { MAX_BS_YEAR, MIN_BS_YEAR } from '../../core/calendar-data';

function adParts(d: Date): { year: number; month: number; day: number } {
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

const activeFixtures = GOLDEN_CONVERSIONS.filter((f) => f.directions.length > 0);

describe('Golden conversion fixtures', () => {
  describe('AD → BS (documented / independent / dataset-implied sources)', () => {
    it.each(
      activeFixtures
        .filter((f) => f.directions.includes('ad-to-bs'))
        .map((f) => [f.id, f] as const)
    )('%s', (_id, fixture) => {
      const { ad, bs } = fixture;
      expect(convertADToBS([ad.year, ad.month, ad.day])).toEqual(bs);
    });
  });

  describe('BS → AD (same sourced expectations)', () => {
    it.each(
      activeFixtures
        .filter((f) => f.directions.includes('bs-to-ad'))
        .map((f) => [f.id, f] as const)
    )('%s', (_id, fixture) => {
      const got = convertBSToAD(fixture.bs);
      expect(adParts(got)).toEqual(fixture.ad);
    });
  });

  describe('Month boundary via AD → BS from known New Year', () => {
    it('first and last day of Baisakh 2080', () => {
      expect(convertADToBS([2023, 4, 14])).toEqual({
        year: 2080,
        month: 1,
        day: 1,
      });
      const days = getDaysInMonth(2080, 1);
      const lastAd = new Date(2023, 3, 14);
      lastAd.setDate(lastAd.getDate() + days - 1);
      expect(
        convertADToBS([
          lastAd.getFullYear(),
          lastAd.getMonth() + 1,
          lastAd.getDate(),
        ])
      ).toEqual({ year: 2080, month: 1, day: days });
    });

    it('rejects unsupported BS years on BS → AD', () => {
      expect(() =>
        convertBSToAD({ year: MIN_BS_YEAR - 1, month: 1, day: 1 })
      ).toThrow(/Year out of range/);
      expect(() =>
        convertBSToAD({ year: MAX_BS_YEAR + 1, month: 1, day: 1 })
      ).toThrow(/Year out of range/);
    });
  });
});
