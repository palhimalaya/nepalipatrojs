import { format } from 'path';
import { MAX_BS_YEAR, MIN_BS_YEAR } from '../constants/calendar-data';
import NepaliPatro, { NepaliDate } from '../index';

describe('NepaliPatro', () => {
  describe('convertADToBS', () => {
    it('should convert AD date to BS date', () => {
      const adDate = new Date(2022, 0, 1);
      
      const bsDate = NepaliPatro.convertADToBS(adDate);
      
      expect(bsDate).toEqual({
        year: 2078,
        month: 9, 
        day: 17
      });
    });
    
    it('should handle array input for AD date', () => {
      const adDate = [2022, 1, 1];
      
      const bsDate = NepaliPatro.convertADToBS(adDate);
      
      expect(bsDate).toEqual({
        year: 2078,
        month: 9,
        day: 17
      });      
    });
    
    it('should throw error for dates before minimum supported year', () => {
      const adDate = new Date(1943, 0, 1);
      
      expect(() => {
        NepaliPatro.convertADToBS(adDate);
      }).toThrow(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
    });
  });

  describe('convertBSToAD', () => {
    it('should convert BS date to AD date', () => {
      const bsDate: NepaliDate = {
        year: 2078,
        month: 1,
        day: 1
      };
      
      const adDate = NepaliPatro.convertBSToAD(bsDate);
      
      expect(adDate.getFullYear()).toBe(2021);
      expect(adDate.getMonth()).toBe(4);
      expect(adDate.getDate()).toBe(15);
    });
    
    it('should handle array input for BS date', () => {
      const bsDate = [2079, 1, 1];
      
      const adDate = NepaliPatro.convertBSToAD(bsDate);
      
      expect(adDate.getFullYear()).toBe(2022);
      expect(adDate.getMonth()).toBe(4);
      expect(adDate.getDate()).toBe(15);
    });
    
    it('should throw error for dates outside supported range', () => {
      const bsDate: NepaliDate = {
        year: 1999,
        month: 1,
        day: 1
      };
      
      expect(() => {
        NepaliPatro.convertBSToAD(bsDate);
      }).toThrow(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
    });
  });

  describe('getCurrentBSDate', () => {
    it('should return the current date in BS', () => {
      const currentDate = new Date();
      
      const currentBSDate = NepaliPatro.getCurrentBSDate();
      
      expect(currentBSDate).toHaveProperty('year');
      expect(currentBSDate).toHaveProperty('month');
      expect(currentBSDate).toHaveProperty('day');
      
      expect(currentBSDate.year).toBeGreaterThanOrEqual(2078);
      expect(currentBSDate.year).toBeLessThanOrEqual(2085);
    });
  });

  describe('formatBS', () => {
    it('should format BS date with default format', () => {
      const bsDate: NepaliDate = {
        year: 2078,
        month: 1,
        day: 1
      };
      
      const formatted = NepaliPatro.formatBS(bsDate);
      
      expect(formatted).toBe('2078-01-01');
    });
    
    it('should format BS date with custom format', () => {
      const bsDate: NepaliDate = {
        year: 2078,
        month: 1,
        day: 1
      };
      
      const formatted = NepaliPatro.formatBS(bsDate, 'DD/MM/YYYY');
      
      expect(formatted).toBe('01/01/2078');
    });
    
    it('should format BS date with month name', () => {
      const bsDate: NepaliDate = {
        year: 2078,
        month: 1,
        day: 1
      };
      
      const formatted = NepaliPatro.formatBS(bsDate, 'MMMM D, YYYY');
      
      expect(formatted).toBe('Baisakh 1, 2078');
    });
    
    it('should format BS date in Nepali language', () => {
      const bsDate: NepaliDate = {
        year: 2078,
        month: 1,
        day: 1
      };
      
      const formatted = NepaliPatro.formatBS(bsDate, 'MMMM D, YYYY', { language: 'np' });
      
      expect(formatted).toBe('बैशाख १, २०७८');
    });
  });

  describe('getDaysInMonth', () => {
    it('should return the correct number of days for a month', () => {
      const year = 2078;
      const month = 2;
      
      const days = NepaliPatro.getDaysInMonth(year, month);
      
      expect(days).toBe(31);
    });
    
    it('should throw error for year out of range', () => {
      const year = 1999;
      const month = 1;
      
      expect(() => {
        NepaliPatro.getDaysInMonth(year, month);
      }).toThrow(`Year out of range. Supported BS years: ${MIN_BS_YEAR} to ${MAX_BS_YEAR}`);
    });
    
    it('should throw error for invalid month', () => {
      const year = 2078;
      const month = 13; 
      
      expect(() => {
        NepaliPatro.getDaysInMonth(year, month);
      }).toThrow('Month must be between 1 and 12');
    });
  });
});