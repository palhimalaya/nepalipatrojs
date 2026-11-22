import { readFileSync } from 'fs';
import { join } from 'path';
import { NepaliDatePicker } from '../../ui/NepaliDatePicker';
import { getDaysInMonth } from '../../utils/helpers';
import { MAX_BS_YEAR, MIN_BS_YEAR } from '../../constants/calendar-data';

describe('NepaliDatePicker', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = '<input id="dateInput" />';
    input = document.getElementById('dateInput') as HTMLInputElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should initialize and attach click event', () => {
    const dp = new NepaliDatePicker(input);
    expect(input).toBeDefined();
    input.click();
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
  });

  it('should respect format and theme options', () => {
    const dp = new NepaliDatePicker(input, { format: 'YYYY/MM/DD', theme: 'dark', language: 'en' });
    input.click();
    const calendar = document.querySelector('.nepali-datepicker-dark');
    expect(calendar).toBeTruthy();
  });

  it('should select a date and update input value', () => {
    const dp = new NepaliDatePicker(input, { format: 'YYYY-MM-DD', language: 'en' });
    input.click();
    const firstDay = document.querySelector('.nepali-day[data-day="1"]') as HTMLElement;
    firstDay.click();
    expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should close calendar on outside click', () => {
    const dp = new NepaliDatePicker(input);
    input.click();
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    document.body.click();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
  });

  it('should parse predefined date from input and highlight it in calendar', () => {
    // Set a predefined date value
    input.value = '2081-01-15';
    
    const dp = new NepaliDatePicker(input, { format: 'YYYY-MM-DD', language: 'en' });
    input.click();
    
    // Check if calendar opened
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    
    // Check if the day 15 is selected/highlighted
    const selectedDay = document.querySelector('.nepali-day.nepali-selected');
    expect(selectedDay).toBeTruthy();
    expect(selectedDay?.getAttribute('data-day')).toBe('15');
  });

  it('should parse different date formats', () => {
    // Test DD/MM/YYYY format
    input.value = '15/01/2081';
    
    const dp = new NepaliDatePicker(input, { format: 'DD/MM/YYYY', language: 'en' });
    input.click();
    
    // Check if calendar opened and correct date is selected
    const selectedDay = document.querySelector('.nepali-day.nepali-selected');
    expect(selectedDay).toBeTruthy();
    expect(selectedDay?.getAttribute('data-day')).toBe('15');
  });

  it('should parse Nepali digits', () => {
    // Test with Nepali digits
    input.value = '२०८१-०१-१५';
    
    const dp = new NepaliDatePicker(input, { format: 'YYYY-MM-DD', language: 'np' });
    input.click();
    
    // Check if calendar opened and correct date is selected
    const selectedDay = document.querySelector('.nepali-day.nepali-selected');
    expect(selectedDay).toBeTruthy();
    expect(selectedDay?.getAttribute('data-day')).toBe('15');
  });

  it('should handle empty input gracefully', () => {
    // Empty input should use current date
    input.value = '';
    
    const dp = new NepaliDatePicker(input);
    input.click();
    
    // Calendar should still open
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    
    // Should have some selected date (current date)
    const selectedDay = document.querySelector('.nepali-day.nepali-selected');
    expect(selectedDay).toBeTruthy();
    dp.destroy();
  });

  it('should destroy and remove listeners/DOM', () => {
    const dp = new NepaliDatePicker(input);
    input.click();
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    dp.destroy();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
  });

  describe('Stage 2.2 — no raw BS_CALENDAR_DATA', () => {
    it('source must not import or reference BS_CALENDAR_DATA', () => {
      const src = readFileSync(
        join(__dirname, '../../ui/NepaliDatePicker.ts'),
        'utf8'
      );
      expect(src).not.toMatch(/BS_CALENDAR_DATA/);
    });

    it('renders correct day count for Baisakh 2080 (31 days)', () => {
      input.value = '2080-01-01';
      const dp = new NepaliDatePicker(input, { format: 'YYYY-MM-DD' });
      input.click();
      const days = document.querySelectorAll('.nepali-day:not(.nepali-other-month)');
      expect(getDaysInMonth(2080, 1)).toBe(31);
      expect(days.length).toBe(31);
      expect(
        document.querySelector('.nepali-day[data-day="31"]:not(.nepali-other-month)')
      ).toBeTruthy();
      expect(
        document.querySelector('.nepali-day[data-day="32"]:not(.nepali-other-month)')
      ).toBeFalsy();
      dp.destroy();
    });

    it('renders Jestha 2080 with 32 days (leap-like BS month)', () => {
      input.value = '2080-02-01';
      const dp = new NepaliDatePicker(input, { format: 'YYYY-MM-DD' });
      input.click();
      expect(getDaysInMonth(2080, 2)).toBe(32);
      const days = document.querySelectorAll('.nepali-day:not(.nepali-other-month)');
      expect(days.length).toBe(32);
      dp.destroy();
    });

    it('year select spans MIN_BS_YEAR..MAX_BS_YEAR', () => {
      const dp = new NepaliDatePicker(input);
      input.click();
      const options = Array.from(
        document.querySelectorAll('.nepali-year-select option')
      ).map((o) => Number((o as HTMLOptionElement).value));
      expect(options[0]).toBe(MIN_BS_YEAR);
      expect(options[options.length - 1]).toBe(MAX_BS_YEAR);
      expect(options.length).toBe(MAX_BS_YEAR - MIN_BS_YEAR + 1);
      dp.destroy();
    });

    it('navigates across year boundary (Chaitra → Baisakh)', () => {
      input.value = '2080-12-01';
      const dp = new NepaliDatePicker(input, { format: 'YYYY-MM-DD' });
      input.click();
      const next = document.querySelector('.nepali-next-btn') as HTMLButtonElement;
      next.click();
      const yearSelect = document.querySelector(
        '.nepali-year-select'
      ) as HTMLSelectElement;
      const monthSelect = document.querySelector(
        '.nepali-month-select'
      ) as HTMLSelectElement;
      expect(Number(yearSelect.value)).toBe(2081);
      expect(Number(monthSelect.value)).toBe(0); // Baisakh (0-based)
      dp.destroy();
    });

    it('rejects invalid out-of-range input without crashing', () => {
      input.value = '1999-01-01';
      const dp = new NepaliDatePicker(input, { format: 'YYYY-MM-DD' });
      expect(() => input.click()).not.toThrow();
      expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
      dp.destroy();
    });
  });
});