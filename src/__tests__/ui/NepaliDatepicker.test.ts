import { NepaliDatepicker } from '../../ui/NepaliDatepicker';

describe('NepaliDatepicker', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = '<input id="dateInput" />';
    input = document.getElementById('dateInput') as HTMLInputElement;
  });

  it('should initialize and attach click event', () => {
    const dp = new NepaliDatepicker(input);
    expect(input).toBeDefined();
    input.click();
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
  });

  it('should respect format and theme options', () => {
    const dp = new NepaliDatepicker(input, { format: 'YYYY/MM/DD', theme: 'dark', language: 'en' });
    input.click();
    const calendar = document.querySelector('.nepali-datepicker-dark');
    expect(calendar).toBeTruthy();
  });

  it('should select a date and update input value', () => {
    const dp = new NepaliDatepicker(input, { format: 'YYYY-MM-DD', language: 'en' });
    input.click();
    const firstDay = document.querySelector('.nepali-day[data-day="1"]') as HTMLElement;
    firstDay.click();
    expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should close calendar on outside click', () => {
    const dp = new NepaliDatepicker(input);
    input.click();
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    document.body.click();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
  });
});