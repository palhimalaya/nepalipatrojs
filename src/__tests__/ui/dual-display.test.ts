/**
 * Stage 3.6 — dual AD/BS presentation in the datepicker DOM.
 */

import { REF_BS } from '../../core/calendar-data';
import { convertBsToAd } from '../../core/converters/date-only';
import { NepaliDatePicker } from '../../ui/NepaliDatePicker';
import { buildCalendarElement } from '../../ui/render';
import { formatAdCellDay, formatAdEquivalentLine } from '../../ui/ad-display';

describe('Stage 3.6 dual AD/BS display', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = '<input id="dateInput" />';
    input = document.getElementById('dateInput') as HTMLInputElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders AD day subtitle and data-ad on cells (BS remains primary)', () => {
    const root = buildCalendarElement({
      theme: 'light',
      language: 'en',
      viewYear: 2080,
      viewMonth: 1,
      selected: { year: 2080, month: 1, day: 1 },
      focused: { year: 2080, month: 1, day: 1 },
      today: { year: 2080, month: 1, day: 1 },
      popupId: 'np-dual',
    });
    const day1 = root.querySelector(
      '.nepali-day[data-day="1"]:not(.nepali-other-month)'
    ) as HTMLButtonElement;
    const ad = convertBsToAd({ year: 2080, month: 1, day: 1 });
    expect(day1.querySelector('.nepali-day-bs')?.textContent).toBe('1');
    expect(day1.querySelector('.nepali-day-ad')?.textContent).toBe(
      formatAdCellDay(ad, 'en')
    );
    expect(day1.querySelector('.nepali-day-ad')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
    expect(day1.getAttribute('data-ad')).toBe(
      `${ad.year}-${ad.month}-${ad.day}`
    );
    expect(day1.getAttribute('aria-label')).toContain('AD');
    expect(day1.getAttribute('aria-label')).toContain('14 Apr 2023');
  });

  it('footer shows AD equivalent for the focused BS date', () => {
    const root = buildCalendarElement({
      theme: 'light',
      language: 'en',
      viewYear: 2080,
      viewMonth: 1,
      selected: { year: 2080, month: 1, day: 1 },
      focused: { year: 2080, month: 1, day: 1 },
      today: { year: 2080, month: 1, day: 1 },
      popupId: 'np-dual-footer',
    });
    const footer = root.querySelector('.nepali-ad-equivalent');
    expect(footer?.textContent).toBe(
      formatAdEquivalentLine({ year: 2080, month: 1, day: 1 }, 'en')
    );
    expect(footer?.getAttribute('aria-live')).toBe('polite');
  });

  it('Nepali language localizes AD digits in cell and footer', () => {
    const root = buildCalendarElement({
      theme: 'light',
      language: 'np',
      viewYear: 2080,
      viewMonth: 1,
      selected: { year: 2080, month: 1, day: 1 },
      focused: { year: 2080, month: 1, day: 1 },
      today: { year: 2080, month: 1, day: 1 },
      popupId: 'np-dual-np',
    });
    const day1 = root.querySelector(
      '.nepali-day[data-day="1"]:not(.nepali-other-month)'
    ) as HTMLButtonElement;
    expect(day1.querySelector('.nepali-day-bs')?.textContent).toBe('१');
    expect(day1.querySelector('.nepali-day-ad')?.textContent).toBe('१४');
    expect(root.querySelector('.nepali-ad-equivalent')?.textContent).toContain(
      'ईस्वी'
    );
  });

  it('disabled dates still show AD but remain non-selectable', () => {
    const root = buildCalendarElement({
      theme: 'light',
      language: 'en',
      viewYear: 2080,
      viewMonth: 1,
      selected: { year: 2080, month: 1, day: 2 },
      focused: { year: 2080, month: 1, day: 2 },
      today: { year: 2080, month: 1, day: 2 },
      popupId: 'np-dual-dis',
      isDateDisabled: (d) => d.day === 1,
    });
    const day1 = root.querySelector(
      '.nepali-day[data-day="1"]:not(.nepali-other-month)'
    ) as HTMLButtonElement;
    expect(day1.disabled).toBe(true);
    expect(day1.getAttribute('data-ad')).toBeTruthy();
    expect(day1.getAttribute('aria-label')).toMatch(/unavailable/i);
  });

  it('live picker keyboard focus updates AD footer without AD grid', () => {
    input.value = '2080-01-01';
    const dp = new NepaliDatePicker(input, {
      format: 'YYYY-MM-DD',
      language: 'en',
    });
    input.click();
    expect(document.querySelector('.nepali-ad-equivalent')?.textContent).toBe(
      formatAdEquivalentLine({ year: 2080, month: 1, day: 1 }, 'en')
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      })
    );
    expect(document.querySelector('.nepali-ad-equivalent')?.textContent).toBe(
      formatAdEquivalentLine({ year: 2080, month: 1, day: 2 }, 'en')
    );
    // No AD month navigation controls
    expect(document.querySelector('.nepali-ad-month-select')).toBeNull();
    expect(document.querySelectorAll('.nepali-datepicker').length).toBe(1);
    dp.destroy();
  });

  it('reference BS cell matches REF_AD via data-ad', () => {
    // Open a view that includes REF_BS if in range — use build directly
    const root = buildCalendarElement({
      theme: 'light',
      language: 'en',
      viewYear: REF_BS.year,
      viewMonth: REF_BS.month,
      selected: { ...REF_BS },
      focused: { ...REF_BS },
      today: { ...REF_BS },
      popupId: 'np-ref',
    });
    const cell = root.querySelector(
      `.nepali-day[data-day="${REF_BS.day}"]:not(.nepali-other-month)`
    ) as HTMLButtonElement;
    expect(cell.getAttribute('data-ad')).toBe('1943-4-14');
  });

  it('multiple instances keep independent AD footers', () => {
    document.body.innerHTML = '<input id="a" /><input id="b" />';
    const a = document.getElementById('a') as HTMLInputElement;
    const b = document.getElementById('b') as HTMLInputElement;
    a.value = '2080-01-01';
    b.value = '2081-01-01';
    const dpA = new NepaliDatePicker(a, { format: 'YYYY-MM-DD' });
    const dpB = new NepaliDatePicker(b, { format: 'YYYY-MM-DD' });
    a.click();
    expect(document.querySelector('.nepali-ad-equivalent')?.textContent).toBe(
      formatAdEquivalentLine({ year: 2080, month: 1, day: 1 }, 'en')
    );
    b.click();
    expect(document.querySelector('.nepali-ad-equivalent')?.textContent).toBe(
      formatAdEquivalentLine({ year: 2081, month: 1, day: 1 }, 'en')
    );
    dpA.destroy();
    dpB.destroy();
  });
});
