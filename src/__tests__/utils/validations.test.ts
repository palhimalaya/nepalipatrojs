import { validateBsDate, validateAdDate } from '../../utils/validations';
import { MIN_BS_YEAR, MAX_BS_YEAR, MIN_AD_YEAR, BS_CALENDAR_DATA } from '../../constants/calendar-data';

describe('Validation Functions', () => {
  describe('validateBsDate', () => {
    it('should not throw for valid BS date', () => {
      expect(() => {
        validateBsDate(2078, 1, 15);
      }).not.toThrow();

      expect(() => {
        validateBsDate(MIN_BS_YEAR, 1, 1);
      }).not.toThrow();

      expect(() => {
        validateBsDate(MAX_BS_YEAR, 1, 1);
      }).not.toThrow();
    });

    it('should throw error for year less than minimum supported year', () => {
      const invalidYear = MIN_BS_YEAR - 1;
      expect(() => {
        validateBsDate(invalidYear, 1, 1);
      }).toThrow(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
    });

    it('should throw error for year greater than maximum supported year', () => {
      const invalidYear = MAX_BS_YEAR + 1;
      expect(() => {
        validateBsDate(invalidYear, 1, 1);
      }).toThrow(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
    });

    it('should throw error for invalid month (less than 1)', () => {
      expect(() => {
        validateBsDate(2080, 0, 1);
      }).toThrow('Month must be between 1 and 12');
    });

    it('should throw error for invalid month (greater than 12)', () => {
      expect(() => {
        validateBsDate(2080, 13, 1);
      }).toThrow('Month must be between 1 and 12');
    });

    it('should throw error for invalid day (less than 1)', () => {
      expect(() => {
        validateBsDate(2080, 1, 0);
      }).toThrow('Day must be between 1 and');
    });

    it('should throw error for invalid day (greater than days in month)', () => {
      const year = 2080;
      const month = 1;
      const daysInMonth = BS_CALENDAR_DATA[year][month - 1] as number;
      
      expect(() => {
        validateBsDate(year, month, daysInMonth + 1);
      }).toThrow(`Day must be between 1 and ${daysInMonth} for month ${month} in year ${year}`);
    });

    it('should handle missing day parameter', () => {
      expect(() => {
        validateBsDate(2080, 1);
      }).not.toThrow();
    });

    it('should throw error for year not in calendar data', () => {
      const validYearNotInData = 2050;
      
      if (!BS_CALENDAR_DATA[validYearNotInData]) {
        expect(() => {
          validateBsDate(validYearNotInData, 1, 1);
        }).toThrow(`Data not available for year ${validYearNotInData}`);
      }
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