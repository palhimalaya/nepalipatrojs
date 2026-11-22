import {
  addDaysBs,
  bsWeekdayIndex0,
  endOfWeekBs,
  initialFocusedDate,
  navigateFocusedDate,
  navigateFocusedDateSelectable,
  shiftMonthClamped,
  startOfWeekBs,
} from '../../ui/keyboard';

describe('keyboard navigation (pure, Sunday-start week)', () => {
  it('addDaysBs crosses month and year boundaries', () => {
    const next = addDaysBs({ year: 2080, month: 1, day: 30 }, 5);
    expect(next.month).toBe(2);
    expect(next.year).toBe(2080);
    const prev = addDaysBs({ year: 2080, month: 1, day: 1 }, -1);
    expect(prev.year).toBe(2079);
    expect(prev.month).toBe(12);
    expect(prev.day).toBeGreaterThanOrEqual(29);
  });

  it('Home/End use Sunday–Saturday week matching the grid', () => {
    // 2080-01-15 is a known mid-week date in suite usage
    const mid = { year: 2080, month: 1, day: 15 };
    const start = startOfWeekBs(mid);
    const end = endOfWeekBs(mid);
    expect(bsWeekdayIndex0(start)).toBe(0);
    expect(bsWeekdayIndex0(end)).toBe(6);
    expect(navigateFocusedDate(mid, 'Home')).toEqual(start);
    expect(navigateFocusedDate(mid, 'End')).toEqual(end);
  });

  it('arrows move 1 / 7 days', () => {
    const d = { year: 2080, month: 5, day: 10 };
    expect(navigateFocusedDate(d, 'ArrowLeft')).toEqual(
      addDaysBs(d, -1)
    );
    expect(navigateFocusedDate(d, 'ArrowRight')).toEqual(
      addDaysBs(d, 1)
    );
    expect(navigateFocusedDate(d, 'ArrowUp')).toEqual(addDaysBs(d, -7));
    expect(navigateFocusedDate(d, 'ArrowDown')).toEqual(addDaysBs(d, 7));
  });

  it('PageUp/PageDown shift month and clamp day', () => {
    const d = { year: 2080, month: 1, day: 31 };
    const prev = shiftMonthClamped(d, -1);
    expect(prev.month).toBe(12);
    expect(prev.year).toBe(2079);
    expect(prev.day).toBeLessThanOrEqual(30);
    expect(navigateFocusedDate(d, 'PageDown').month).toBe(2);
  });

  it('initialFocusedDate prefers selected, then today, then day 1', () => {
    expect(
      initialFocusedDate(
        2080,
        2,
        { year: 2080, month: 2, day: 9 },
        { year: 2080, month: 2, day: 1 }
      )
    ).toEqual({ year: 2080, month: 2, day: 9 });
    expect(
      initialFocusedDate(
        2080,
        2,
        { year: 2080, month: 1, day: 9 },
        { year: 2080, month: 2, day: 3 }
      )
    ).toEqual({ year: 2080, month: 2, day: 3 });
    expect(
      initialFocusedDate(
        2080,
        2,
        { year: 2080, month: 1, day: 9 },
        { year: 2080, month: 3, day: 3 }
      )
    ).toEqual({ year: 2080, month: 2, day: 1 });
    expect(
      initialFocusedDate(2080, 2, null, { year: 2080, month: 3, day: 3 })
    ).toEqual({ year: 2080, month: 2, day: 1 });
  });

  it('navigateFocusedDateSelectable skips disabled days', () => {
    const blocked = new Set(['2080-1-16', '2080-1-17']);
    const ok = (d: { year: number; month: number; day: number }) =>
      !blocked.has(`${d.year}-${d.month}-${d.day}`);
    expect(
      navigateFocusedDateSelectable(
        { year: 2080, month: 1, day: 15 },
        'ArrowRight',
        ok
      )
    ).toEqual({ year: 2080, month: 1, day: 18 });
  });
});
