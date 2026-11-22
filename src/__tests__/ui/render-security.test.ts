/**
 * Stage 3.2 / ISS-014 — safe DOM rendering security + structure regressions.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { NepaliDatePicker } from '../../ui/NepaliDatePicker';
import { buildCalendarElement, textElement } from '../../ui/render';

jest.mock('../../i18n/localization', () => {
  const actual = jest.requireActual('../../i18n/localization');
  return {
    ...actual,
    localizeMonth: () => '<img src=x onerror="window.__np_xss=1">',
    localizeDigits: (num: string | number) =>
      String(num) === '15'
        ? '<script>window.__np_xss=1</script>'
        : `<b onclick="window.__np_xss=1">${num}</b>`,
  };
});

describe('Stage 3.2 safe rendering (ISS-014)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    (window as unknown as { __np_xss?: number }).__np_xss = 0;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as unknown as { __np_xss?: number }).__np_xss;
  });

  it('NepaliDatePicker source has no innerHTML / insertAdjacentHTML', () => {
    const src = readFileSync(
      join(__dirname, '../../ui/NepaliDatePicker.ts'),
      'utf8'
    );
    expect(src).not.toMatch(/innerHTML/);
    expect(src).not.toMatch(/insertAdjacentHTML/);
    expect(src).not.toMatch(/outerHTML\s*=/);
  });

  it('render module has no innerHTML assignment', () => {
    const src = readFileSync(join(__dirname, '../../ui/render.ts'), 'utf8');
    expect(src).not.toMatch(/\.innerHTML\s*=/);
    expect(src).not.toMatch(/insertAdjacentHTML/);
  });

  it('textElement never creates child elements from HTML-looking strings', () => {
    const node = textElement(
      'div',
      'x',
      '<img src=x onerror="window.__np_xss=1"><script>window.__np_xss=1</script>'
    );
    expect(node.childElementCount).toBe(0);
    expect(node.querySelector('img')).toBeNull();
    expect(node.querySelector('script')).toBeNull();
    expect(node.textContent).toContain('<img');
    expect((window as unknown as { __np_xss?: number }).__np_xss).toBe(0);
  });

  const baseOpts = {
    theme: 'light' as const,
    language: 'en' as const,
    viewYear: 2080,
    viewMonth: 1,
    selected: { year: 2080, month: 1, day: 15 },
    focused: { year: 2080, month: 1, day: 15 },
    today: { year: 2080, month: 1, day: 10 },
    popupId: 'nepali-datepicker-test',
  };

  it('malicious localization strings render as text, not markup', () => {
    const root = buildCalendarElement(baseOpts);
    document.body.appendChild(root);

    expect(root.querySelectorAll('img').length).toBe(0);
    expect(root.querySelectorAll('script').length).toBe(0);
    expect(root.querySelectorAll('b').length).toBe(0);
    expect(
      Array.from(root.querySelectorAll('*')).every(
        (el) =>
          !Array.from(el.attributes).some((a) => /^on/i.test(a.name))
      )
    ).toBe(true);

    const monthOpt = root.querySelector(
      '.nepali-month-select option'
    ) as HTMLOptionElement;
    expect(monthOpt.textContent).toContain('<img');
    expect(monthOpt.childElementCount).toBe(0);

    const selected = root.querySelector('.nepali-day.nepali-selected');
    expect(selected?.textContent).toContain('<script>');
    expect(selected?.childElementCount).toBe(0);
    expect((window as unknown as { __np_xss?: number }).__np_xss).toBe(0);
  });

  it('theme className injection cannot create elements', () => {
    const root = buildCalendarElement({
      ...baseOpts,
      theme: 'light"><img src=x onerror=alert(1) class="' as 'light',
      selected: { year: 2080, month: 1, day: 1 },
      focused: { year: 2080, month: 1, day: 1 },
    });
    expect(root.querySelector('img')).toBeNull();
    expect(root.tagName).toBe('DIV');
    expect(root.className).toContain('nepali-datepicker');
  });

  it('renders 42 day cells with expected CSS hooks', () => {
    const root = buildCalendarElement({
      ...baseOpts,
      theme: 'dark',
      viewMonth: 2,
      selected: { year: 2080, month: 2, day: 1 },
      focused: { year: 2080, month: 2, day: 1 },
      today: { year: 2080, month: 2, day: 1 },
    });
    expect(root.classList.contains('nepali-datepicker-dark')).toBe(true);
    expect(root.querySelector('.nepali-datepicker-header')).toBeTruthy();
    expect(root.querySelector('.nepali-month-select')).toBeTruthy();
    expect(root.querySelector('.nepali-year-select')).toBeTruthy();
    expect(root.querySelectorAll('.nepali-weekday').length).toBe(7);
    expect(root.querySelectorAll('.nepali-day').length).toBe(42);
    expect(
      root.querySelectorAll('.nepali-day:not(.nepali-other-month)').length
    ).toBe(32);
  });

  it('live picker open/nav does not leave innerHTML-built markup or scripts', () => {
    document.body.innerHTML = '<input id="d" />';
    const input = document.getElementById('d') as HTMLInputElement;
    const dp = new NepaliDatePicker(input, { theme: 'light', language: 'en' });
    input.click();
    const cal = document.querySelector('.nepali-datepicker') as HTMLElement;
    expect(cal).toBeTruthy();
    expect(cal.querySelectorAll('script').length).toBe(0);
    expect(cal.querySelectorAll('img').length).toBe(0);
    (
      document.querySelector('.nepali-next-btn') as HTMLButtonElement
    ).click();
    expect(document.querySelectorAll('.nepali-day').length).toBe(42);
    dp.destroy();
  });
});
