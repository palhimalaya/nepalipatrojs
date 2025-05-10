import { formatBS, toNepaliDigits } from '../../formatters/date-formatter';
import { NepaliDate } from '../../types';

describe('Date Formatter', () => {
  describe('toNepaliDigits', () => {
    it('should convert English digits to Nepali digits', () => {
      expect(toNepaliDigits(123)).toBe('१२३');
      expect(toNepaliDigits('456')).toBe('४५६');
      expect(toNepaliDigits('2078-01-15')).toBe('२०७८-०१-१५');
    });
  });

  describe('formatBS', () => {
    const testDate: NepaliDate = { year: 2078, month: 1, day: 15 };

    it('should format date with default format', () => {
      expect(formatBS(testDate)).toBe('2078-01-15');
    });

    it('should format date with custom format', () => {
      expect(formatBS(testDate, 'YYYY/MM/DD')).toBe('2078/01/15');
      expect(formatBS(testDate, 'DD-MM-YYYY')).toBe('15-01-2078');
      expect(formatBS(testDate, 'D-M-YYYY')).toBe('15-1-2078');
      expect(formatBS(testDate, 'YY/MM/DD')).toBe('78/01/15');
    });

    it('should format date with month names in English', () => {
      expect(formatBS(testDate, 'MMMM D, YYYY')).toBe('Baisakh 15, 2078');
      expect(formatBS(testDate, 'MMM D, YYYY')).toBe('Bai 15, 2078');
    });

    it('should format date with month names in Nepali', () => {
      expect(formatBS(testDate, 'MMMM D, YYYY', { language: 'np' })).toBe('बैशाख १५, २०७८');
      expect(formatBS(testDate, 'MMM D, YYYY', { language: 'np' })).toBe('बैशाख १५, २०७८');
    });

    it('should format date with weekday', () => {
      expect(formatBS(testDate, 'dddd, MMMM D, YYYY')).toMatch(/\w+, Baisakh 15, 2078/);
      expect(formatBS(testDate, 'ddd, MMM D, YY')).toMatch(/\w+, Bai 15, 78/);
    });

    it('should format date with all Nepali digits', () => {
      expect(formatBS(testDate, 'YYYY-MM-DD', { language: 'np' })).toBe('२०७८-०१-१५');
      expect(formatBS(testDate, 'D/M/YYYY', { language: 'np' })).toBe('१५/१/२०७८');
    });

    it('should handle numeric day of week', () => {
      expect(formatBS(testDate, 'dddd (d)')).toMatch(/\w+ \(\d\)/);
      expect(formatBS(testDate, 'd', { language: 'np' })).toMatch(/[१-७]/);
    });
  });
});