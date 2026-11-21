import {
  addGregorianDays,
  daysBetweenGregorian,
  daysInGregorianMonth,
  gregorianDayNumber,
  gregorianFromDayNumber,
  isGregorianLeapYear,
} from '../../utils/gregorian';

describe('Gregorian civil helpers (no Date)', () => {
  it('leap years', () => {
    expect(isGregorianLeapYear(2024)).toBe(true);
    expect(isGregorianLeapYear(1900)).toBe(false);
    expect(isGregorianLeapYear(2000)).toBe(true);
    expect(daysInGregorianMonth(2024, 2)).toBe(29);
    expect(daysInGregorianMonth(2023, 2)).toBe(28);
  });

  it('day numbers round-trip and differ by calendar days', () => {
    const a = { year: 1943, month: 4, day: 14 };
    const b = { year: 2023, month: 4, day: 14 };
    expect(gregorianFromDayNumber(gregorianDayNumber(a.year, a.month, a.day))).toEqual(a);
    expect(daysBetweenGregorian(a, b)).toBe(29220);
    expect(addGregorianDays(a, 29220)).toEqual(b);
    expect(addGregorianDays(a, 1)).toEqual({ year: 1943, month: 4, day: 15 });
  });

  it('handles month and year boundaries', () => {
    expect(addGregorianDays({ year: 2023, month: 1, day: 31 }, 1)).toEqual({
      year: 2023,
      month: 2,
      day: 1,
    });
    expect(addGregorianDays({ year: 2023, month: 12, day: 31 }, 1)).toEqual({
      year: 2024,
      month: 1,
      day: 1,
    });
    expect(addGregorianDays({ year: 2024, month: 2, day: 28 }, 1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });
});
