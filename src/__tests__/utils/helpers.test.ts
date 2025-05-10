import { getDaysInMonth, parseDateInput } from '../../utils/helpers';
import { BS_CALENDAR_DATA, MAX_BS_YEAR, MIN_BS_YEAR } from '../../constants/calendar-data';
import { NepaliDate } from '../../types';

describe('Helper Functions', () => {
  describe('getDaysInMonth', () => {
    it('should return correct number of days for valid month/year', () => {
      const year = 2080;
      const month = 2;
      const expectedDays = BS_CALENDAR_DATA[year][0][month - 1];
      
      expect(getDaysInMonth(year, month)).toBe(expectedDays);
    });

    it('should throw for year not in calendar data', () => {
      const yearNotInData = 3050;
      
      if (!BS_CALENDAR_DATA[yearNotInData]) {
        expect(() => {
          getDaysInMonth(yearNotInData, 1);
        }).toThrow(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
      }
    });

    it('should throw for invalid month', () => {
      const year = 2080;
      
      expect(() => {
        getDaysInMonth(year, 0);
      }).toThrow('Month must be between 1 and 12');
      
      expect(() => {
        getDaysInMonth(year, 13);
      }).toThrow('Month must be between 1 and 12');
    });
  });

  describe('parseDateInput', () => {
    it('should correctly parse NepaliDate object', () => {
      const dateObject: NepaliDate = {
        year: 2078,
        month: 5,
        day: 15
      };
      
      expect(parseDateInput(dateObject)).toEqual({
        year: 2078,
        month: 5,
        day: 15
      });
    });

    it('should correctly parse date array', () => {
      const dateArray = [2078, 5, 15] as [number, number, number];
      
      expect(parseDateInput(dateArray)).toEqual({
        year: 2078,
        month: 5,
        day: 15
      });
    });

    it('should throw for invalid input format', () => {
      const invalidString = '2078-05-15' as unknown as NepaliDate;
      expect(() => {
        parseDateInput(invalidString);
      }).toThrow('Invalid date format. Provide a NepaliDate object or [year, month, day] array.');

      const emptyObject = {} as unknown as NepaliDate;
      expect(() => {
        parseDateInput(emptyObject);
      }).toThrow('Invalid date format. Provide a NepaliDate object or [year, month, day] array.');

      const tooShortArray = [2078, 5] as unknown as number[];
      expect(() => {
        parseDateInput(tooShortArray);
      }).toThrow('Invalid date format. Provide a NepaliDate object or [year, month, day] array.');
    });
  });
});