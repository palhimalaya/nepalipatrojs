/**
 * Stage 3.5 — Today / Clear / constraints interaction (jsdom).
 */

import { NepaliDatePicker } from '../../ui/NepaliDatePicker';
import { navigateFocusedDateSelectable } from '../../ui/keyboard';
import { getCurrentBSDate } from '../../core/converters/ad-to-bs';

function open(
  input: HTMLInputElement,
  options: ConstructorParameters<typeof NepaliDatePicker>[1] = {}
): NepaliDatePicker {
  const dp = new NepaliDatePicker(input, {
    format: 'YYYY-MM-DD',
    language: 'en',
    ...options,
  });
  input.click();
  return dp;
}

describe('Stage 3.5 constraints UI', () => {
  let input: HTMLInputElement;
  let realToday: ReturnType<typeof getCurrentBSDate>;

  beforeEach(() => {
    document.body.innerHTML = '<input id="dateInput" />';
    input = document.getElementById('dateInput') as HTMLInputElement;
    realToday = getCurrentBSDate();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('preserves unconstrained selection behavior', () => {
    input.value = '2080-01-15';
    const dp = open(input);
    const day = document.querySelector(
      '.nepali-day[data-day="16"]:not(.nepali-other-month)'
    ) as HTMLButtonElement;
    day.click();
    expect(input.value).toBe('2080-01-16');
    dp.destroy();
  });

  it('renders min/max disabled cells and blocks mouse selection', () => {
    input.value = '2080-01-15';
    const dp = open(input, {
      minDate: { year: 2080, month: 1, day: 10 },
      maxDate: { year: 2080, month: 1, day: 20 },
    });
    const below = document.querySelector(
      '.nepali-day[data-day="9"]:not(.nepali-other-month)'
    ) as HTMLButtonElement;
    const above = document.querySelector(
      '.nepali-day[data-day="21"]:not(.nepali-other-month)'
    ) as HTMLButtonElement;
    const ok = document.querySelector(
      '.nepali-day[data-day="10"]:not(.nepali-other-month)'
    ) as HTMLButtonElement;
    expect(below.disabled).toBe(true);
    expect(above.disabled).toBe(true);
    expect(ok.disabled).toBe(false);
    below.click();
    expect(input.value).toBe('2080-01-15');
    ok.click();
    expect(input.value).toBe('2080-01-10');
    dp.destroy();
  });

  it('disabledDates at month edges cannot be selected', () => {
    input.value = '2080-01-15';
    const dp = open(input, {
      disabledDates: [
        { year: 2080, month: 1, day: 1 },
        { year: 2080, month: 1, day: 31 },
      ],
    });
    const first = document.querySelector(
      '.nepali-day[data-day="1"]:not(.nepali-other-month)'
    ) as HTMLButtonElement;
    const last = document.querySelector(
      '.nepali-day[data-day="31"]:not(.nepali-other-month)'
    ) as HTMLButtonElement;
    expect(first.disabled).toBe(true);
    expect(last.disabled).toBe(true);
    first.click();
    expect(input.value).toBe('2080-01-15');
    dp.destroy();
  });

  it('all dates disabled in a month: days are disabled, nav still works', () => {
    // Disable the civil "today" month so the open view is fully unavailable.
    const y = realToday.year;
    const m = realToday.month;
    const dp = open(input, {
      isDateDisabled: (d) => d.year === y && d.month === m,
    });
    const inMonth = document.querySelectorAll(
      `.nepali-day[data-year="${y}"][data-month="${m}"]`
    );
    expect(inMonth.length).toBeGreaterThan(0);
    expect(
      Array.from(inMonth).every((el) => (el as HTMLButtonElement).disabled)
    ).toBe(true);
    (document.querySelector('.nepali-next-btn') as HTMLButtonElement).click();
    expect(document.querySelectorAll('.nepali-day').length).toBe(42);
    dp.destroy();
  });

  it('keyboard skips disabled dates; Enter/Space cannot select disabled', () => {
    const isSelectable = (d: {
      year: number;
      month: number;
      day: number;
    }) => !(d.year === 2080 && d.month === 1 && d.day === 16);
    const next = navigateFocusedDateSelectable(
      { year: 2080, month: 1, day: 15 },
      'ArrowRight',
      isSelectable
    );
    expect(next).toEqual({ year: 2080, month: 1, day: 17 });

    input.value = '2080-01-15';
    const dp = open(input, {
      disabledDates: [{ year: 2080, month: 1, day: 16 }],
    });
    const disabled = document.querySelector(
      '.nepali-day[data-day="16"]:not(.nepali-other-month)'
    ) as HTMLButtonElement;
    disabled.focus();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    );
    expect(input.value).toBe('2080-01-15');
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    dp.destroy();
  });

  it('Today commits when selectable', () => {
    const dp = open(input);
    const todayBtn = document.querySelector(
      '.nepali-today-btn'
    ) as HTMLButtonElement;
    expect(todayBtn.disabled).toBe(false);
    todayBtn.click();
    expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
    expect(document.activeElement).toBe(input);
    dp.destroy();
  });

  it('Today is disabled when today is outside maxDate', () => {
    const maxDate = {
      year: realToday.year,
      month: realToday.month,
      day: Math.max(1, realToday.day - 1),
    };
    // If today is day 1, force a prior month max
    const bound =
      realToday.day === 1
        ? {
            year: realToday.month === 1 ? realToday.year - 1 : realToday.year,
            month: realToday.month === 1 ? 12 : realToday.month - 1,
            day: 28,
          }
        : maxDate;
    const dp = open(input, { maxDate: bound });
    const todayBtn = document.querySelector(
      '.nepali-today-btn'
    ) as HTMLButtonElement;
    expect(todayBtn.disabled).toBe(true);
    todayBtn.click();
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    dp.destroy();
  });

  it('Today respects disabledDates for civil today', () => {
    const dp = open(input, { disabledDates: [{ ...realToday }] });
    const todayBtn = document.querySelector(
      '.nepali-today-btn'
    ) as HTMLButtonElement;
    expect(todayBtn.disabled).toBe(true);
    dp.destroy();
  });

  it('Clear empties input, fires change, keeps open, does not select today', () => {
    input.value = '2080-01-15';
    const dp = open(input);
    const changes: string[] = [];
    input.addEventListener('change', () => changes.push(input.value));
    (document.querySelector('.nepali-clear-btn') as HTMLButtonElement).click();
    expect(input.value).toBe('');
    expect(changes).toEqual(['']);
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    expect(document.querySelector('.nepali-day.nepali-selected')).toBeNull();
    dp.destroy();
  });

  it('ignores out-of-range value when parsing input on open', () => {
    input.value = '2079-06-05';
    const dp = open(input, {
      minDate: { year: 2080, month: 1, day: 10 },
    });
    // Rejected parse must not move the view to 2079
    const yearSelect = document.querySelector(
      '.nepali-year-select'
    ) as HTMLSelectElement;
    expect(yearSelect.value).not.toBe('2079');
    dp.destroy();
  });

  it('multiple instances keep independent constraints', () => {
    document.body.innerHTML = '<input id="a" /><input id="b" />';
    const a = document.getElementById('a') as HTMLInputElement;
    const b = document.getElementById('b') as HTMLInputElement;
    a.value = '2080-01-15';
    b.value = '2080-01-15';
    const dpA = new NepaliDatePicker(a, {
      format: 'YYYY-MM-DD',
      minDate: { year: 2080, month: 1, day: 10 },
    });
    const dpB = new NepaliDatePicker(b, {
      format: 'YYYY-MM-DD',
      maxDate: { year: 2080, month: 1, day: 20 },
    });
    a.click();
    expect(
      (
        document.querySelector(
          '.nepali-day[data-day="9"]:not(.nepali-other-month)'
        ) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    b.click();
    expect(
      (
        document.querySelector(
          '.nepali-day[data-day="21"]:not(.nepali-other-month)'
        ) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    dpA.destroy();
    dpB.destroy();
  });

  it('destroy while open with constraints cleans up', () => {
    const dp = open(input, {
      minDate: { year: 2080, month: 1, day: 1 },
      maxDate: { year: 2080, month: 12, day: 30 },
    });
    dp.destroy();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
    input.click();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
  });
});
