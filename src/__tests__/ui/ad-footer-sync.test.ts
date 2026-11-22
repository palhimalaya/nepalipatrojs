/**
 * Stage 3.7 preflight — AD footer tracks focused BS date.
 * Documents sync paths; mouse day-click closes (no lingering footer).
 */

import { NepaliDatePicker } from '../../ui/NepaliDatePicker';
import { formatAdEquivalentLine } from '../../ui/ad-display';

function footerText(): string {
  return document.querySelector('.nepali-ad-equivalent')?.textContent ?? '';
}

describe('AD footer synchronization preflight (Stage 3.7)', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = '<input id="dateInput" />';
    input = document.getElementById('dateInput') as HTMLInputElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keyboard ArrowRight updates footer to the new focused date', () => {
    input.value = '2080-01-10';
    const dp = new NepaliDatePicker(input, {
      format: 'YYYY-MM-DD',
      language: 'en',
    });
    input.click();
    expect(footerText()).toBe(
      formatAdEquivalentLine({ year: 2080, month: 1, day: 10 }, 'en')
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      })
    );
    expect(footerText()).toBe(
      formatAdEquivalentLine({ year: 2080, month: 1, day: 11 }, 'en')
    );
    dp.destroy();
  });

  it('month navigation (next) re-renders footer for the new focused date', () => {
    input.value = '2080-01-15';
    const dp = new NepaliDatePicker(input, {
      format: 'YYYY-MM-DD',
      language: 'en',
    });
    input.click();
    (document.querySelector('.nepali-next-btn') as HTMLButtonElement).click();
    const focused = document.activeElement as HTMLElement;
    expect(focused.classList.contains('nepali-day')).toBe(true);
    const y = Number(focused.dataset.year);
    const m = Number(focused.dataset.month);
    const d = Number(focused.dataset.day);
    expect(footerText()).toBe(
      formatAdEquivalentLine({ year: y, month: m, day: d }, 'en')
    );
    expect(m).toBe(2);
    dp.destroy();
  });

  it('Clear keeps popup open and footer still matches focused date', () => {
    input.value = '2080-01-15';
    const dp = new NepaliDatePicker(input, {
      format: 'YYYY-MM-DD',
      language: 'en',
    });
    input.click();
    const before = footerText();
    (document.querySelector('.nepali-clear-btn') as HTMLButtonElement).click();
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    expect(footerText()).toBe(before);
    expect(footerText()).toBe(
      formatAdEquivalentLine({ year: 2080, month: 1, day: 15 }, 'en')
    );
    dp.destroy();
  });

  it('Today closes the popup (no stale open footer)', () => {
    const dp = new NepaliDatePicker(input, {
      format: 'YYYY-MM-DD',
      language: 'en',
    });
    input.click();
    expect(document.querySelector('.nepali-ad-equivalent')).toBeTruthy();
    (document.querySelector('.nepali-today-btn') as HTMLButtonElement).click();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
    expect(document.querySelector('.nepali-ad-equivalent')).toBeFalsy();
    dp.destroy();
  });

  it('mouse day selection closes popup (footer removed with calendar)', () => {
    input.value = '2080-01-15';
    const dp = new NepaliDatePicker(input, {
      format: 'YYYY-MM-DD',
      language: 'en',
    });
    input.click();
    (
      document.querySelector(
        '.nepali-day[data-day="16"]:not(.nepali-other-month)'
      ) as HTMLButtonElement
    ).click();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
    expect(input.value).toBe('2080-01-16');
    dp.destroy();
  });
});
