/**
 * Stage 3.7 — theme tokens, scoping, and styling hooks.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { NepaliDatePicker } from '../../ui/NepaliDatePicker';
import { buildCalendarElement } from '../../ui/render';

const CSS_PATH = join(__dirname, '../../ui/styles.css');

describe('Stage 3.7 theme tokens', () => {
  const css = readFileSync(CSS_PATH, 'utf8');

  it('defines core --np-* tokens on .nepali-datepicker', () => {
    const required = [
      '--np-surface',
      '--np-text',
      '--np-text-muted',
      '--np-border',
      '--np-accent',
      '--np-selected-bg',
      '--np-today-bg',
      '--np-focus-ring',
      '--np-radius',
      '--np-space-2',
      '--np-font',
      '--np-day-size',
      '--np-shadow',
    ];
    for (const token of required) {
      expect(css).toContain(token);
    }
  });

  it('scopes rules to .nepali-datepicker (no bare html/body selectors)', () => {
    expect(css).not.toMatch(/(^|\n)\s*html\s*\{/);
    expect(css).not.toMatch(/(^|\n)\s*body\s*\{/);
    expect(css).not.toMatch(/(^|\n)\s*\*\s*\{/);
  });

  it('dark theme redefines tokens on .nepali-datepicker-dark', () => {
    expect(css).toMatch(/\.nepali-datepicker-dark\s*\{/);
    expect(css).toMatch(
      /\.nepali-datepicker-dark\s*\{[\s\S]*--np-surface:/
    );
  });

  it('preserves light/dark theme class hooks at runtime', () => {
    document.body.innerHTML = '<input id="t" />';
    const input = document.getElementById('t') as HTMLInputElement;
    const light = new NepaliDatePicker(input, { theme: 'light' });
    input.click();
    expect(
      document.querySelector('.nepali-datepicker-light')
    ).toBeTruthy();
    light.destroy();

    const dark = new NepaliDatePicker(input, { theme: 'dark' });
    input.click();
    expect(
      document.querySelector('.nepali-datepicker-dark')
    ).toBeTruthy();
    dark.destroy();
  });

  it('keeps selected / today / disabled / focus styling class hooks', () => {
    const root = buildCalendarElement({
      theme: 'light',
      language: 'en',
      viewYear: 2080,
      viewMonth: 1,
      selected: { year: 2080, month: 1, day: 15 },
      focused: { year: 2080, month: 1, day: 15 },
      today: { year: 2080, month: 1, day: 10 },
      popupId: 'theme-hooks',
      isDateDisabled: (d) => d.day === 20,
    });
    expect(root.querySelector('.nepali-selected')).toBeTruthy();
    expect(root.querySelector('.nepali-today')).toBeTruthy();
    expect(root.querySelector('.nepali-disabled')).toBeTruthy();
    expect(root.querySelector('.nepali-day-ad')).toBeTruthy();
    expect(root.querySelector('.nepali-ad-equivalent')).toBeTruthy();
    expect(css).toContain(':focus-visible');
    expect(css).toContain('--np-focus-ring');
  });

  it('documents narrow-screen token overrides (Stage 4.4)', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*480px\)/);
    expect(css).toContain('--np-day-size: 44px');
    expect(css).toContain('--np-popup-width: 344px');
    expect(css).toContain('max-width: calc(100vw - 16px)');
  });

  it('keeps desktop day size at 42px outside the mobile media query', () => {
    const rootBlock = css.match(
      /\.nepali-datepicker\s*\{([\s\S]*?)\n\}/
    );
    expect(rootBlock?.[1]).toContain('--np-day-size: 42px');
    expect(rootBlock?.[1]).toContain('--np-popup-width: 328px');
  });

  it('defines AD text token and darkened selected fill (ISS-026/027)', () => {
    expect(css).toContain('--np-ad-text');
    expect(css).toMatch(/--np-selected-bg:\s*#2b6cb0/);
    expect(css).toMatch(/\.nepali-day-ad\s*\{[\s\S]*color:\s*var\(--np-ad-text\)/);
  });
});
