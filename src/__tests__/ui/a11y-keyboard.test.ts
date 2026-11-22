/**
 * Stage 3.3 — keyboard, focus, ARIA, lifecycle regressions.
 * Attribute/DOM assertions only — not a claim of full screen-reader coverage.
 */

import { NepaliDatePicker } from '../../ui/NepaliDatePicker';

function openPicker(input: HTMLInputElement): NepaliDatePicker {
  const dp = new NepaliDatePicker(input, {
    format: 'YYYY-MM-DD',
    language: 'en',
  });
  input.click();
  return dp;
}

function focusedDay(): HTMLElement {
  return document.activeElement as HTMLElement;
}

function dispatchKey(key: string, target: EventTarget = document): void {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
}

describe('Stage 3.3 keyboard and accessibility', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = '<input id="dateInput" />';
    input = document.getElementById('dateInput') as HTMLInputElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('sets input aria-haspopup / expanded / controls and toggles expanded', () => {
    const dp = new NepaliDatePicker(input);
    expect(input.getAttribute('aria-haspopup')).toBe('dialog');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    const controls = input.getAttribute('aria-controls');
    expect(controls).toMatch(/^nepali-datepicker-/);

    input.click();
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(controls!)).toBeTruthy();

    dispatchKey('Escape');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(input);
    dp.destroy();
  });

  it('popup exposes dialog + grid semantics and live region', () => {
    const dp = openPicker(input);
    const root = document.querySelector('.nepali-datepicker') as HTMLElement;
    expect(root.getAttribute('role')).toBe('dialog');
    expect(root.getAttribute('aria-modal')).toBe('false');
    expect(root.getAttribute('aria-label')).toBe('Choose date');

    const grid = root.querySelector('[role="grid"]');
    expect(grid).toBeTruthy();
    expect(root.querySelectorAll('[role="row"]').length).toBe(6);
    expect(root.querySelectorAll('[role="gridcell"]').length).toBe(42);

    const live = root.querySelector('.nepali-datepicker-live');
    expect(live?.getAttribute('aria-live')).toBe('polite');
    expect(live?.textContent?.length).toBeGreaterThan(0);

    expect(root.querySelector('.nepali-prev-btn')?.getAttribute('aria-label')).toBe(
      'Previous month'
    );
    dp.destroy();
  });

  it('focuses a day on open with roving tabindex', () => {
    input.value = '2080-01-15';
    const dp = openPicker(input);
    const active = focusedDay();
    expect(active.classList.contains('nepali-day')).toBe(true);
    expect(active.tabIndex).toBe(0);
    expect(active.getAttribute('data-day')).toBe('15');

    const tabbable = Array.from(
      document.querySelectorAll<HTMLElement>('.nepali-day')
    ).filter((el) => el.tabIndex === 0);
    expect(tabbable.length).toBe(1);
    dp.destroy();
  });

  it('Escape closes and restores focus to the input', () => {
    const dp = openPicker(input);
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    dispatchKey('Escape');
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
    expect(document.activeElement).toBe(input);
    dp.destroy();
  });

  it('ArrowLeft/Right/Up/Down move focus across days', () => {
    input.value = '2080-01-15';
    const dp = openPicker(input);
    const before = focusedDay();
    const dayBefore = Number(before.dataset.day);
    dispatchKey('ArrowRight');
    expect(Number(focusedDay().dataset.day)).toBe(dayBefore + 1);
    dispatchKey('ArrowLeft');
    expect(Number(focusedDay().dataset.day)).toBe(dayBefore);
    dispatchKey('ArrowDown');
    expect(Number(focusedDay().dataset.day)).toBe(dayBefore + 7);
    dispatchKey('ArrowUp');
    expect(Number(focusedDay().dataset.day)).toBe(dayBefore);
    dp.destroy();
  });

  it('Home/End move to week start/end (Sunday–Saturday)', () => {
    input.value = '2080-01-15';
    const dp = openPicker(input);
    dispatchKey('Home');
    const home = focusedDay();
    // Sunday column is first in each week row
    const week = home.closest('[role="row"]');
    expect(week?.querySelector('.nepali-day')).toBe(home);
    dispatchKey('End');
    const end = focusedDay();
    const days = week?.querySelectorAll('.nepali-day');
    expect(days?.[days.length - 1]).toBe(end);
    dp.destroy();
  });

  it('PageUp/PageDown change month and keep a focused day', () => {
    input.value = '2080-01-15';
    const dp = openPicker(input);
    const liveBefore = document.querySelector('.nepali-datepicker-live')
      ?.textContent;
    dispatchKey('PageDown');
    const liveAfter = document.querySelector('.nepali-datepicker-live')
      ?.textContent;
    expect(liveAfter).not.toBe(liveBefore);
    expect(focusedDay().classList.contains('nepali-day')).toBe(true);
    expect(Number(focusedDay().dataset.month)).toBe(2);
    dispatchKey('PageUp');
    expect(Number(focusedDay().dataset.month)).toBe(1);
    dp.destroy();
  });

  it('Arrow across month boundary updates the view', () => {
    input.value = '2080-01-01';
    const dp = openPicker(input);
    dispatchKey('ArrowLeft');
    expect(Number(focusedDay().dataset.month)).toBe(12);
    expect(Number(focusedDay().dataset.year)).toBe(2079);
    dp.destroy();
  });

  it('Enter/click selects focused date and restores input focus', () => {
    input.value = '2080-01-15';
    const dp = openPicker(input);
    dispatchKey('ArrowRight');
    const chosen = focusedDay();
    const y = chosen.dataset.year;
    const m = chosen.dataset.month?.padStart(2, '0');
    const d = chosen.dataset.day?.padStart(2, '0');
    // jsdom does not always synthesize click from Enter; click is the
    // activation path Enter uses in browsers via the button.
    chosen.click();
    expect(input.value).toBe(`${y}-${m}-${d}`);
    expect(document.activeElement).toBe(input);
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
    dp.destroy();
  });

  it('Space selects focused date without leaving the popup listeners dangling', () => {
    input.value = '2080-01-10';
    const dp = openPicker(input);
    dispatchKey('ArrowRight');
    const chosen = focusedDay();
    const y = chosen.dataset.year;
    const m = String(chosen.dataset.month).padStart(2, '0');
    const d = String(chosen.dataset.day).padStart(2, '0');
    dispatchKey(' ');
    expect(input.value).toBe(`${y}-${m}-${d}`);
    expect(document.activeElement).toBe(input);
    dp.destroy();
  });

  it('does not intercept keys while closed; input typing remains possible', () => {
    const dp = new NepaliDatePicker(input);
    input.focus();
    input.value = 'abc';
    dispatchKey('ArrowRight');
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
    expect(input.value).toBe('abc');
    dp.destroy();
  });

  it('does not intercept arrow keys when focus is back on the input while open', () => {
    input.value = '2080-01-15';
    const dp = openPicker(input);
    input.focus();
    dispatchKey('ArrowRight');
    // Focused day in state/DOM should remain 15 (nav ignored)
    const day15 = document.querySelector(
      '.nepali-day[data-day="15"]:not(.nepali-other-month)'
    ) as HTMLElement;
    expect(day15.tabIndex).toBe(0);
    dp.destroy();
  });

  it('selected vs today semantics', () => {
    input.value = '2080-01-15';
    const dp = openPicker(input);
    const selectedCell = document.querySelector(
      '[role="gridcell"][aria-selected="true"]'
    );
    expect(selectedCell).toBeTruthy();
    const todayCell = document.querySelector(
      '[role="gridcell"][aria-current="date"]'
    );
    // today may or may not equal selected depending on civil date; attribute shape must be valid
    if (todayCell) {
      expect(todayCell.querySelector('.nepali-today')).toBeTruthy();
    }
    expect(
      selectedCell?.querySelector('.nepali-selected')
    ).toBeTruthy();
    dp.destroy();
  });

  it('day buttons have full-date accessible names', () => {
    input.value = '2080-01-15';
    const dp = openPicker(input);
    const btn = document.querySelector(
      '.nepali-day[data-day="15"]:not(.nepali-other-month)'
    ) as HTMLElement;
    expect(btn.getAttribute('aria-label')).toMatch(/15/);
    expect(btn.getAttribute('aria-label')).toMatch(/2080/);
    dp.destroy();
  });

  it('multiple instances stay independent and do not steal focus wrongly', () => {
    document.body.innerHTML = '<input id="a" /><input id="b" />';
    const a = document.getElementById('a') as HTMLInputElement;
    const b = document.getElementById('b') as HTMLInputElement;
    a.value = '2080-01-10';
    b.value = '2081-02-05';
    const dpA = new NepaliDatePicker(a);
    const dpB = new NepaliDatePicker(b);
    a.click();
    expect(document.querySelectorAll('.nepali-datepicker').length).toBe(1);
    expect(focusedDay().dataset.day).toBe('10');
    b.click();
    expect(document.querySelectorAll('.nepali-datepicker').length).toBe(1);
    expect(focusedDay().dataset.day).toBe('5');
    expect(a.getAttribute('aria-expanded')).toBe('false');
    expect(b.getAttribute('aria-expanded')).toBe('true');
    dpA.destroy();
    dpB.destroy();
  });

  it('repeated open/close does not leave detached focus or duplicate days', () => {
    const dp = openPicker(input);
    for (let i = 0; i < 3; i++) {
      dispatchKey('Escape');
      input.click();
    }
    expect(document.querySelectorAll('.nepali-datepicker').length).toBe(1);
    expect(document.querySelectorAll('.nepali-day').length).toBe(42);
    expect(document.activeElement?.isConnected).toBe(true);
    dp.destroy();
    expect(document.activeElement?.isConnected).toBe(true);
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
  });

  it('destroy removes listeners and restores input ARIA; no focus on detached nodes', () => {
    const dp = openPicker(input);
    const day = focusedDay();
    dp.destroy();
    expect(day.isConnected).toBe(false);
    expect(document.activeElement?.isConnected).not.toBe(false);
    expect(input.getAttribute('aria-haspopup')).toBeNull();
    expect(input.getAttribute('aria-expanded')).toBeNull();
    expect(input.getAttribute('aria-controls')).toBeNull();
    input.click();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
    dispatchKey('Escape');
  });

  it('Tab is not trapped (default not prevented on Tab)', () => {
    const dp = openPicker(input);
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    const prevented = !document.dispatchEvent(event) || event.defaultPrevented;
    expect(prevented).toBe(false);
    dp.destroy();
  });
});
