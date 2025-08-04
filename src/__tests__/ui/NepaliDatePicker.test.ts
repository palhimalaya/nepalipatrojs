import { NepaliDatePicker } from '../../ui/NepaliDatePicker';

describe('NepaliDatePicker', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = '<input id="dateInput" />';
    input = document.getElementById('dateInput') as HTMLInputElement;
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
  });
});