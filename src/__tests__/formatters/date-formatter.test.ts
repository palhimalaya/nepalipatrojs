import { formatBS, toNepaliDigits } from '../../i18n/format';
import { NepaliDate } from '../../core/types';
import {
  NepaliMonth,
  NepaliMonthNepali,
  NepaliWeekDay,
} from '../../i18n/names';

/** English month names from the enum (not from formatBS). */
const ENGLISH_MONTHS: Record<number, string> = {
  1: 'Baisakh',
  2: 'Jestha',
  3: 'Ashadh',
  4: 'Shrawan',
  5: 'Bhadra',
  6: 'Ashwin',
  7: 'Kartik',
  8: 'Mangsir',
  9: 'Poush',
  10: 'Magh',
  11: 'Falgun',
  12: 'Chaitra',
};

const NEPALI_MONTHS: Record<number, string> = {
  1: 'बैशाख',
  2: 'जेष्ठ',
  3: 'आषाढ',
  4: 'श्रावण',
  5: 'भाद्र',
  6: 'आश्विन',
  7: 'कार्तिक',
  8: 'मंसिर',
  9: 'पौष',
  10: 'माघ',
  11: 'फाल्गुन',
  12: 'चैत्र',
};

/**
 * Known BS 2080-01-01..07 weekdays.
 * AD equivalents: Fri–Thu starting 2023-04-14 (ISS-019 corrected; local calendar fields).
 * Mapping: JS getDay()+1 → NepaliWeekDay (1=Aitabar … 7=Sanibar).
 */
const WEEKDAYS_2080_BAISAKH: Record<number, { name: string; d: number }> = {
  1: { name: 'Sukrabar', d: 6 },
  2: { name: 'Sanibar', d: 7 },
  3: { name: 'Aitabar', d: 1 },
  4: { name: 'Sombar', d: 2 },
  5: { name: 'Mangalbar', d: 3 },
  6: { name: 'Budhabar', d: 4 },
  7: { name: 'Bihibar', d: 5 },
};

describe('Date Formatter', () => {
  describe('toNepaliDigits', () => {
    it('should convert English digits to Nepali digits', () => {
      expect(toNepaliDigits(123)).toBe('१२३');
      expect(toNepaliDigits('456')).toBe('४५६');
      expect(toNepaliDigits('2078-01-15')).toBe('२०७८-०१-१५');
    });
  });

  describe('formatBS', () => {
    const baisakh15: NepaliDate = { year: 2078, month: 1, day: 15 };

    it('should format date with default format', () => {
      expect(formatBS(baisakh15)).toBe('2078-01-15');
    });

    it('should format date with custom numeric formats', () => {
      expect(formatBS(baisakh15, 'YYYY/MM/DD')).toBe('2078/01/15');
      expect(formatBS(baisakh15, 'DD-MM-YYYY')).toBe('15-01-2078');
      expect(formatBS(baisakh15, 'D-M-YYYY')).toBe('15-1-2078');
      expect(formatBS(baisakh15, 'YY/MM/DD')).toBe('78/01/15');
    });

    it('should format Baisakh with English month names', () => {
      expect(formatBS(baisakh15, 'MMMM D, YYYY')).toBe('Baisakh 15, 2078');
      expect(formatBS(baisakh15, 'MMM D, YYYY')).toBe('Bai 15, 2078');
    });

    it('should format with Nepali month names and digits', () => {
      expect(formatBS(baisakh15, 'MMMM D, YYYY', { language: 'np' })).toBe(
        'बैशाख १५, २०७८'
      );
      expect(formatBS(baisakh15, 'MMM D, YYYY', { language: 'np' })).toBe(
        'बैशाख १५, २०७८'
      );
      expect(formatBS(baisakh15, 'YYYY-MM-DD', { language: 'np' })).toBe(
        '२०७८-०१-१५'
      );
      expect(formatBS(baisakh15, 'D/M/YYYY', { language: 'np' })).toBe(
        '१५/१/२०७८'
      );
    });

    describe('ISS-006: month names must not be corrupted', () => {
      it.each(
        Object.entries(ENGLISH_MONTHS).map(([m, name]) => [Number(m), name] as const)
      )('English MMMM for month %i is %s (exact)', (month, name) => {
        expect(NepaliMonth[month]).toBe(name);
        const date: NepaliDate = { year: 2080, month, day: 5 };
        expect(formatBS(date, 'MMMM')).toBe(name);
        expect(formatBS(date, 'MMMM D, YYYY')).toBe(`${name} 5, 2080`);
        expect(formatBS(date, 'MMM')).toBe(name.substring(0, 3));
      });

      it('does not corrupt Mangsir or Magh (known ISS-006 failures)', () => {
        expect(formatBS({ year: 2080, month: 8, day: 5 }, 'MMMM D, YYYY')).toBe(
          'Mangsir 5, 2080'
        );
        expect(formatBS({ year: 2080, month: 10, day: 5 }, 'MMMM D, YYYY')).toBe(
          'Magh 5, 2080'
        );
        expect(formatBS({ year: 2080, month: 8, day: 5 }, 'MMM')).toBe('Man');
        expect(formatBS({ year: 2080, month: 10, day: 5 }, 'MMM')).toBe('Mag');
      });

      it.each(
        Object.entries(NEPALI_MONTHS).map(([m, name]) => [Number(m), name] as const)
      )('Nepali MMMM for month %i is exact', (month, name) => {
        expect(NepaliMonthNepali[month]).toBe(name);
        const date: NepaliDate = { year: 2080, month, day: 5 };
        expect(formatBS(date, 'MMMM', { language: 'np' })).toBe(name);
      });
    });

    describe('ISS-006: weekday names must not be corrupted', () => {
      it.each(
        Object.entries(WEEKDAYS_2080_BAISAKH).map(
          ([day, info]) => [Number(day), info.name, info.d] as const
        )
      )('2080-01-%i formats as %s (d=%i)', (day, name, d) => {
        expect(NepaliWeekDay[d]).toBe(name);
        const date: NepaliDate = { year: 2080, month: 1, day };
        expect(formatBS(date, 'dddd')).toBe(name);
        expect(formatBS(date, 'ddd')).toBe(name.substring(0, 3));
        expect(formatBS(date, 'd')).toBe(String(d));
        expect(formatBS(date, 'dddd (d)')).toBe(`${name} (${d})`);
      });

      it('does not corrupt Budhabar (known ISS-006 failure)', () => {
        // 2080-01-06 BS = 2023-04-19 AD (Wednesday) → Budhabar
        expect(formatBS({ year: 2080, month: 1, day: 6 }, 'dddd')).toBe('Budhabar');
        expect(formatBS({ year: 2080, month: 1, day: 6 }, 'dddd, MMMM D')).toBe(
          'Budhabar, Baisakh 6'
        );
      });
    });

    it('handles repeated and mixed tokens without double-substitution', () => {
      const date: NepaliDate = { year: 2080, month: 8, day: 5 };
      expect(formatBS(date, 'YYYY-YYYY')).toBe('2080-2080');
      expect(formatBS(date, 'MM/DD')).toBe('08/05');
      expect(formatBS(date, 'MMMM MMM MM M')).toBe('Mangsir Man 08 8');
      expect(formatBS(date, 'dddd ddd d')).toBe('Mangalbar Man 3');
    });

    it('preserves literal punctuation and bracket-escaped text', () => {
      const date: NepaliDate = { year: 2080, month: 8, day: 5 };
      expect(formatBS(date, 'YYYY/MM/DD')).toBe('2080/08/05');
      expect(formatBS(date, 'MMMM, YYYY')).toBe('Mangsir, 2080');
      expect(formatBS(date, 'on MMMM')).toBe('on Mangsir');
      // Bracket-escaped literals keep token-like characters unchanged
      expect(formatBS(date, '[Month] MMMM')).toBe('Month Mangsir');
      expect(formatBS(date, '[d] dddd')).toBe('d Mangalbar');
      expect(formatBS(date, 'YYYY年MM月DD日')).toBe('2080年08月05日');
    });

    it('formats numeric day of week with Nepali digits', () => {
      // 2080-01-06 is Budhabar → d = 4
      expect(
        formatBS({ year: 2080, month: 1, day: 6 }, 'd', { language: 'np' })
      ).toBe('४');
    });
  });
});
