/**
 * Stage 3.5 — pure constraint model (inclusive bounds, TZ-independent).
 */

import {
  compareBsDates,
  emptyConstraints,
  isDateSelectable,
  isValidBsCivilDate,
  normalizeConstraints,
} from '../../ui/constraints';

describe('constraints (pure)', () => {
  const warnings: string[] = [];
  const warn = (m: string) => warnings.push(m);

  beforeEach(() => {
    warnings.length = 0;
  });

  it('compareBsDates is timezone-independent civil order', () => {
    expect(
      compareBsDates(
        { year: 2080, month: 1, day: 1 },
        { year: 2080, month: 1, day: 2 }
      )
    ).toBeLessThan(0);
    expect(
      compareBsDates(
        { year: 2080, month: 2, day: 1 },
        { year: 2080, month: 1, day: 32 }
      )
    ).toBeGreaterThan(0);
  });

  it('min/max are inclusive', () => {
    const c = normalizeConstraints({
      minDate: { year: 2080, month: 1, day: 10 },
      maxDate: { year: 2080, month: 1, day: 20 },
    });
    expect(isDateSelectable({ year: 2080, month: 1, day: 10 }, c)).toBe(true);
    expect(isDateSelectable({ year: 2080, month: 1, day: 20 }, c)).toBe(true);
    expect(isDateSelectable({ year: 2080, month: 1, day: 9 }, c)).toBe(false);
    expect(isDateSelectable({ year: 2080, month: 1, day: 21 }, c)).toBe(false);
  });

  it('disabledDates and isDateDisabled combine with bounds', () => {
    const c = normalizeConstraints({
      minDate: { year: 2080, month: 1, day: 1 },
      maxDate: { year: 2080, month: 1, day: 31 },
      disabledDates: [{ year: 2080, month: 1, day: 15 }],
      isDateDisabled: (d) => d.day === 1,
    });
    expect(isDateSelectable({ year: 2080, month: 1, day: 15 }, c)).toBe(false);
    expect(isDateSelectable({ year: 2080, month: 1, day: 1 }, c)).toBe(false);
    expect(isDateSelectable({ year: 2080, month: 1, day: 16 }, c)).toBe(true);
  });

  it('rejects contradictory min > max (ignores both)', () => {
    const c = normalizeConstraints(
      {
        minDate: { year: 2080, month: 2, day: 1 },
        maxDate: { year: 2080, month: 1, day: 1 },
      },
      warn
    );
    expect(c.minDate).toBeNull();
    expect(c.maxDate).toBeNull();
    expect(warnings.some((w) => /minDate is after maxDate/i.test(w))).toBe(
      true
    );
    expect(isDateSelectable({ year: 2080, month: 1, day: 1 }, c)).toBe(true);
  });

  it('ignores malformed constraint dates', () => {
    const c = normalizeConstraints(
      {
        minDate: { year: 2080, month: 13, day: 1 },
        disabledDates: [{ year: 2080, month: 1, day: 99 }],
      },
      warn
    );
    expect(c.minDate).toBeNull();
    expect(c.disabledDates).toHaveLength(0);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('isValidBsCivilDate rejects impossible days', () => {
    expect(isValidBsCivilDate({ year: 2080, month: 1, day: 31 })).toBe(true);
    expect(isValidBsCivilDate({ year: 2080, month: 1, day: 32 })).toBe(false);
  });

  it('emptyConstraints allows all valid dates', () => {
    const c = emptyConstraints();
    expect(isDateSelectable({ year: 2080, month: 5, day: 10 }, c)).toBe(true);
  });

  it('disabledDates is snapshotted (caller array/object mutation ignored)', () => {
    const caller = [{ year: 2080, month: 1, day: 15 }];
    const c = normalizeConstraints({ disabledDates: caller });
    caller.push({ year: 2080, month: 1, day: 16 });
    caller[0].day = 1;
    expect(isDateSelectable({ year: 2080, month: 1, day: 15 }, c)).toBe(false);
    expect(isDateSelectable({ year: 2080, month: 1, day: 16 }, c)).toBe(true);
    expect(isDateSelectable({ year: 2080, month: 1, day: 1 }, c)).toBe(true);
    expect(c.disabledDates).not.toBe(caller);
  });

  it('isDateDisabled is evaluated dynamically on each check', () => {
    let blocked = true;
    const c = normalizeConstraints({
      isDateDisabled: () => blocked,
    });
    const d = { year: 2080, month: 5, day: 10 };
    expect(isDateSelectable(d, c)).toBe(false);
    blocked = false;
    expect(isDateSelectable(d, c)).toBe(true);
    blocked = true;
    expect(isDateSelectable(d, c)).toBe(false);
  });
});
