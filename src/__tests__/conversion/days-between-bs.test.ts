import { daysBetweenBS } from '../../core/converters/bs-to-ad';
import { BS_CALENDAR_DATA, REF_BS } from '../../core/calendar-data';
import { getDaysInMonth } from '../../core/calendar';

type Ymd = { year: number; month: number; day: number };

/**
 * Independent day difference using absolute indices from REF (2000-01-01).
 * Built only from BS_CALENDAR_DATA / getDaysInMonth — not from daysBetweenBS.
 */
function expectedDaysFromRef(date: Ymd): number {
  let days = 0;
  for (let y = REF_BS.year; y < date.year; y++) {
    days += BS_CALENDAR_DATA[y][1];
  }
  for (let m = 1; m < date.month; m++) {
    days += getDaysInMonth(date.year, m);
  }
  days += date.day - 1;
  return days;
}

function expectedDaysBetween(a: Ymd, b: Ymd): number {
  return expectedDaysFromRef(b) - expectedDaysFromRef(a);
}

describe('daysBetweenBS (ISS-019)', () => {
  it('reference to itself is 0', () => {
    expect(daysBetweenBS(REF_BS, REF_BS)).toBe(0);
  });

  it('one day after reference is 1', () => {
    expect(
      daysBetweenBS(REF_BS, { year: 2000, month: 1, day: 2 })
    ).toBe(1);
    expect(expectedDaysBetween(REF_BS, { year: 2000, month: 1, day: 2 })).toBe(
      1
    );
  });

  it('same-month spans after day 1', () => {
    const a = { year: 2000, month: 1, day: 5 };
    const b = { year: 2000, month: 1, day: 12 };
    expect(expectedDaysBetween(a, b)).toBe(7);
    expect(daysBetweenBS(a, b)).toBe(7);
    expect(daysBetweenBS(b, a)).toBe(-7);
  });

  it('first day to last day of a month', () => {
    const last = getDaysInMonth(2000, 1);
    expect(last).toBe(30);
    expect(
      daysBetweenBS(
        { year: 2000, month: 1, day: 1 },
        { year: 2000, month: 1, day: last }
      )
    ).toBe(last - 1);
  });

  it('last day of month to first day of next month', () => {
    const last = getDaysInMonth(2000, 1);
    expect(
      daysBetweenBS(
        { year: 2000, month: 1, day: last },
        { year: 2000, month: 2, day: 1 }
      )
    ).toBe(1);
  });

  it('month 12 to month 1 of next year (no extra Baisakh)', () => {
    const lastChaitra = getDaysInMonth(2000, 12);
    expect(
      daysBetweenBS(
        { year: 2000, month: 12, day: lastChaitra },
        { year: 2001, month: 1, day: 1 }
      )
    ).toBe(1);

    // Full year span REF → next New Year equals year total
    expect(
      daysBetweenBS(REF_BS, { year: 2001, month: 1, day: 1 })
    ).toBe(BS_CALENDAR_DATA[2000][1]);
  });

  it('multiple year transitions match sum of year totals', () => {
    let sum = 0;
    for (let y = 2000; y < 2080; y++) sum += BS_CALENDAR_DATA[y][1];
    expect(sum).toBe(29220);
    expect(
      daysBetweenBS(REF_BS, { year: 2080, month: 1, day: 1 })
    ).toBe(sum);
  });

  it('matches independent absolute-index expectations for sample pairs', () => {
    const pairs: [Ymd, Ymd][] = [
      [REF_BS, { year: 2000, month: 2, day: 1 }],
      [REF_BS, { year: 2000, month: 12, day: getDaysInMonth(2000, 12) }],
      [
        { year: 2079, month: 12, day: getDaysInMonth(2079, 12) },
        { year: 2080, month: 1, day: 1 },
      ],
      [
        { year: 2080, month: 1, day: 1 },
        { year: 2080, month: 11, day: 17 },
      ],
    ];
    for (const [a, b] of pairs) {
      expect(daysBetweenBS(a, b)).toBe(expectedDaysBetween(a, b));
    }
  });
});
