import { validateBsDate, validateAdDate } from '../../utils/validations';
import { MIN_BS_YEAR, MAX_BS_YEAR, MIN_AD_YEAR, BS_CALENDAR_DATA } from '../../constants/calendar-data';
import { getDaysInMonth } from '../../utils/helpers';

/**
 * Expected BS month length from the calendar dataset — NOT from validateBsDate.
 * Shape: BS_CALENDAR_DATA[year] = [daysPerMonth[12], totalDays]
 */
function expectedDaysInMonth(year: number, month: number): number {
  return BS_CALENDAR_DATA[year][0][month - 1];
}

const REPRESENTATIVE_YEARS = [MIN_BS_YEAR, 2078, 2080, 2081, MAX_BS_YEAR] as const;

describe('Validation Functions', () => {
  describe('validateBsDate', () => {
    it('should not throw for known valid BS dates and range endpoints', () => {
      expect(() => validateBsDate(2078, 1, 15)).not.toThrow();
      expect(() => validateBsDate(MIN_BS_YEAR, 1, 1)).not.toThrow();
      expect(() => validateBsDate(MAX_BS_YEAR, 12, expectedDaysInMonth(MAX_BS_YEAR, 12))).not.toThrow();
    });

    it('should throw for year less than minimum supported year', () => {
      expect(() => validateBsDate(MIN_BS_YEAR - 1, 1, 1)).toThrow(
        `Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`
      );
    });

    it('should throw for year greater than maximum supported year', () => {
      expect(() => validateBsDate(MAX_BS_YEAR + 1, 1, 1)).toThrow(
        `Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`
      );
    });

    it('should throw for month 0 and month 13', () => {
      expect(() => validateBsDate(2080, 0, 1)).toThrow('Month must be between 1 and 12');
      expect(() => validateBsDate(2080, 13, 1)).toThrow('Month must be between 1 and 12');
    });

    it('should throw for day 0 and negative days', () => {
      expect(() => validateBsDate(2080, 1, 0)).toThrow('Day must be between 1 and');
      expect(() => validateBsDate(2080, 1, -1)).toThrow('Day must be between 1 and');
    });

    it('should allow omitting day (year/month only)', () => {
      expect(() => validateBsDate(2080, 1)).not.toThrow();
      expect(() => validateBsDate(2080, 12)).not.toThrow();
    });

    describe('ISS-001: all 12 months against independent month lengths', () => {
      it.each(REPRESENTATIVE_YEARS)(
        'accepts first and last day of every month in BS %i',
        (year) => {
          for (let month = 1; month <= 12; month++) {
            const lastDay = expectedDaysInMonth(year, month);
            expect(getDaysInMonth(year, month)).toBe(lastDay);

            expect(() => validateBsDate(year, month, 1)).not.toThrow();
            expect(() => validateBsDate(year, month, lastDay)).not.toThrow();
          }
        }
      );

      it.each(REPRESENTATIVE_YEARS)(
        'rejects one day beyond last valid day for every month in BS %i',
        (year) => {
          for (let month = 1; month <= 12; month++) {
            const lastDay = expectedDaysInMonth(year, month);
            expect(() => validateBsDate(year, month, lastDay + 1)).toThrow(
              `Day must be between 1 and ${lastDay} for month ${month} in year ${year}`
            );
          }
        }
      );
    });

    it('rejects invalid days that previously slipped through wrong indexing (ISS-001)', () => {
      // Jestha 2080 has 32 days; buggy path used year total 365
      expect(expectedDaysInMonth(2080, 2)).toBe(32);
      expect(() => validateBsDate(2080, 2, 33)).toThrow(
        'Day must be between 1 and 32 for month 2 in year 2080'
      );

      // Poush 2080 has 29 days; buggy path used undefined for month index 8
      expect(expectedDaysInMonth(2080, 9)).toBe(29);
      expect(() => validateBsDate(2080, 9, 30)).toThrow(
        'Day must be between 1 and 29 for month 9 in year 2080'
      );

      // Baisakh 2080 has 31 days; buggy path compared against the month-length array
      expect(expectedDaysInMonth(2080, 1)).toBe(31);
      expect(() => validateBsDate(2080, 1, 32)).toThrow(
        'Day must be between 1 and 31 for month 1 in year 2080'
      );
    });

    it('handles differing month lengths and 366-day BS years', () => {
      // 2081 is a 366-day year in the dataset
      expect(BS_CALENDAR_DATA[2081][1]).toBe(366);
      expect(expectedDaysInMonth(2081, 10)).toBe(30);
      expect(() => validateBsDate(2081, 10, 30)).not.toThrow();
      expect(() => validateBsDate(2081, 10, 31)).toThrow(
        'Day must be between 1 and 30 for month 10 in year 2081'
      );

      // 2000 Baisakh has 30 days (not 31)
      expect(expectedDaysInMonth(2000, 1)).toBe(30);
      expect(() => validateBsDate(2000, 1, 30)).not.toThrow();
      expect(() => validateBsDate(2000, 1, 31)).toThrow(
        'Day must be between 1 and 30 for month 1 in year 2000'
      );
    });

    it('validates first and last supported calendar dates', () => {
      expect(() => validateBsDate(MIN_BS_YEAR, 1, 1)).not.toThrow();
      expect(() =>
        validateBsDate(MAX_BS_YEAR, 12, expectedDaysInMonth(MAX_BS_YEAR, 12))
      ).not.toThrow();
      expect(() => validateBsDate(MIN_BS_YEAR, 1, 0)).toThrow('Day must be between 1 and');
      expect(() =>
        validateBsDate(MAX_BS_YEAR, 12, expectedDaysInMonth(MAX_BS_YEAR, 12) + 1)
      ).toThrow('Day must be between 1 and');
    });
  });

  describe('validateAdDate', () => {
    it('should not throw for valid AD date', () => {
      expect(() => {
        validateAdDate(2022, 1, 15);
      }).not.toThrow();

      expect(() => {
        validateAdDate(MIN_AD_YEAR, 1, 1);
      }).not.toThrow();
    });

    it('should throw error for year less than minimum supported year', () => {
      const invalidYear = MIN_AD_YEAR - 1;
      expect(() => {
        validateAdDate(invalidYear, 1, 1);
      }).toThrow(`Date out of range. Minimum supported AD year is ${MIN_AD_YEAR}`);
    });

    it('should throw error for invalid month (less than 1)', () => {
      expect(() => {
        validateAdDate(2022, 0, 1);
      }).toThrow('Month must be between 1 and 12');
    });

    it('should throw error for invalid month (greater than 12)', () => {
      expect(() => {
        validateAdDate(2022, 13, 1);
      }).toThrow('Month must be between 1 and 12');
    });

    it('should throw error for invalid day (less than 1)', () => {
      expect(() => {
        validateAdDate(2022, 1, 0);
      }).toThrow('Day must be between 1 and');
    });

    it('should throw error for invalid day (greater than days in month)', () => {
      expect(() => {
        validateAdDate(2022, 2, 29);
      }).toThrow('Day must be between 1 and 28 for month 2 in year 2022');

      expect(() => {
        validateAdDate(2024, 2, 29);
      }).not.toThrow();

      expect(() => {
        validateAdDate(2022, 4, 31);
      }).toThrow('Day must be between 1 and 30 for month 4 in year 2022');
    });

    it('should handle missing day parameter', () => {
      expect(() => {
        validateAdDate(2022, 1);
      }).not.toThrow();
    });

    it('should correctly handle leap years', () => {
      expect(() => {
        validateAdDate(2023, 2, 29);
      }).toThrow('Day must be between 1 and 28 for month 2 in year 2023');

      expect(() => {
        validateAdDate(2024, 2, 29);
      }).not.toThrow();

      expect(() => {
        validateAdDate(2100, 2, 29);
      }).toThrow('Day must be between 1 and 28 for month 2 in year 2100');

      expect(() => {
        validateAdDate(2000, 2, 29);
      }).not.toThrow();
    });
  });
});
