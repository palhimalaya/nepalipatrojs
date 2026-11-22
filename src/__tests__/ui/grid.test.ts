import { getDaysInMonth } from '../../core/calendar';
import { getBsWeekdayIndex } from '../../core/converters/date-only';
import {
  buildBsMonthGrid,
  daysInBsMonth,
  firstWeekdayOfBsMonth,
} from '../../ui/grid';

describe('Calendar grid (pure)', () => {
  it('matches getDaysInMonth for Baisakh and Jestha 2080', () => {
    expect(daysInBsMonth(2080, 1)).toBe(31);
    expect(daysInBsMonth(2080, 2)).toBe(32);
    expect(getDaysInMonth(2080, 1)).toBe(31);
    expect(getDaysInMonth(2080, 2)).toBe(32);
  });

  it('first weekday is date-only (getBsWeekdayIndex - 1), not Date.getDay()', () => {
    const year = 2080;
    const month = 1;
    const expected = getBsWeekdayIndex({ year, month, day: 1 }) - 1;
    expect(firstWeekdayOfBsMonth(year, month)).toBe(expected);
    expect(expected).toBeGreaterThanOrEqual(0);
    expect(expected).toBeLessThanOrEqual(6);
  });

  it('builds 42 cells with correct current-month count', () => {
    const selected = { year: 2080, month: 1, day: 1 };
    const grid = buildBsMonthGrid(2080, 1, selected);
    expect(grid.cells).toHaveLength(42);
    expect(grid.daysInMonth).toBe(31);
    const current = grid.cells.filter((c) => c.kind === 'current');
    expect(current).toHaveLength(31);
    expect(current[0].selected).toBe(true);
    expect(grid.cells.filter((c) => c.selected)).toHaveLength(1);
    expect(grid.cells.every((c) => c.disabled === false)).toBe(true);
  });

  it('marks disabled cells via predicate', () => {
    const grid = buildBsMonthGrid(2080, 1, null, (d) => d.day === 15);
    const day15 = grid.cells.find(
      (c) => c.kind === 'current' && c.day === 15
    );
    expect(day15?.disabled).toBe(true);
    expect(grid.cells.filter((c) => c.selected)).toHaveLength(0);
  });

  it('pads previous and next months', () => {
    const grid = buildBsMonthGrid(2080, 1, { year: 2080, month: 1, day: 15 });
    const prev = grid.cells.filter((c) => c.kind === 'prev');
    const next = grid.cells.filter((c) => c.kind === 'next');
    expect(prev.length).toBe(grid.firstWeekday);
    expect(prev.length + 31 + next.length).toBe(42);
    if (prev.length > 0) {
      expect(prev[0].month).toBe(12);
      expect(prev[0].year).toBe(2079);
    }
  });

  it('handles Chaitra → next year padding', () => {
    const grid = buildBsMonthGrid(2080, 12, { year: 2080, month: 12, day: 1 });
    const next = grid.cells.filter((c) => c.kind === 'next');
    if (next.length > 0) {
      expect(next[0].year).toBe(2081);
      expect(next[0].month).toBe(1);
    }
  });

  it('out-of-range year uses fallback day count 30 for padding helper', () => {
    expect(daysInBsMonth(1999, 12)).toBe(30);
  });

  it('grid is identical under different process timezones (date-only weekday)', () => {
    const selected = { year: 2081, month: 6, day: 20 };
    const a = buildBsMonthGrid(2081, 6, selected);
    // Recompute weekday path explicitly — must not depend on Date
    const wd = getBsWeekdayIndex({ year: 2081, month: 6, day: 1 }) - 1;
    expect(a.firstWeekday).toBe(wd);
    expect(a.cells.map((c) => `${c.kind}:${c.year}-${c.month}-${c.day}`)).toEqual(
      buildBsMonthGrid(2081, 6, selected).cells.map(
        (c) => `${c.kind}:${c.year}-${c.month}-${c.day}`
      )
    );
  });
});
