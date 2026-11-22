/**
 * Safe DOM construction for the datepicker popup (Phase 3 Stage 3.2 / ISS-014).
 * ARIA / grid semantics (Phase 3 Stage 3.3).
 * Constraints / Today / Clear (Phase 3 Stage 3.5).
 * Dynamic labels use textContent / createTextNode only.
 */

import { MAX_BS_YEAR, MIN_BS_YEAR } from '../core/calendar-data';
import { NepaliDate } from '../core/types';
import { localizeDigits, localizeMonth } from '../i18n/localization';
import { buildBsMonthGrid, CalendarCell } from './grid';

export type DatePickerTheme = 'light' | 'dark';
export type DatePickerLanguage = 'en' | 'np';

export interface RenderCalendarOptions {
  theme: DatePickerTheme;
  language: DatePickerLanguage;
  viewYear: number;
  /** 1-based BS month */
  viewMonth: number;
  selected: NepaliDate | null;
  focused: NepaliDate;
  today: NepaliDate;
  /** Root element id (aria-controls target) */
  popupId: string;
  /** True when the cell date must not be selectable. */
  isDateDisabled?: (date: NepaliDate) => boolean;
  /** Disable the Today action when today is not selectable. */
  todayDisabled?: boolean;
  minYear?: number;
  maxYear?: number;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  return node;
}

/** Create an element whose only child content is a text node (never HTML). */
export function textElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string | undefined,
  text: string
): HTMLElementTagNameMap[K] {
  const node = el(tag, className);
  node.appendChild(document.createTextNode(text));
  return node;
}

function weekdayLabels(language: DatePickerLanguage): string[] {
  return language === 'np'
    ? ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
}

function sameDate(a: NepaliDate, b: NepaliDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function accessibleDateLabel(
  cell: CalendarCell,
  language: DatePickerLanguage
): string {
  const monthName = localizeMonth(cell.month, language);
  const day = localizeDigits(cell.day, language);
  const year = localizeDigits(cell.year, language);
  const base = `${day} ${monthName} ${year}`;
  if (cell.disabled) {
    return language === 'np' ? `${base} (अक्षम)` : `${base} (unavailable)`;
  }
  return base;
}

function monthYearLabel(
  year: number,
  month: number,
  language: DatePickerLanguage
): string {
  return `${localizeMonth(month, language)} ${localizeDigits(year, language)}`;
}

function renderDayCell(
  cell: CalendarCell,
  language: DatePickerLanguage,
  focused: NepaliDate,
  today: NepaliDate
): HTMLDivElement {
  const classes = ['nepali-day'];
  if (cell.kind !== 'current') {
    classes.push('nepali-other-month');
  }
  if (cell.selected) {
    classes.push('nepali-selected');
  }
  if (cell.disabled) {
    classes.push('nepali-disabled');
  }
  const isToday = sameDate(
    { year: cell.year, month: cell.month, day: cell.day },
    today
  );
  if (isToday) {
    classes.push('nepali-today');
  }
  const isFocused = sameDate(
    { year: cell.year, month: cell.month, day: cell.day },
    focused
  );

  const gridcell = el('div', 'nepali-gridcell');
  gridcell.setAttribute('role', 'gridcell');
  gridcell.setAttribute('aria-selected', cell.selected ? 'true' : 'false');
  if (cell.disabled) {
    gridcell.setAttribute('aria-disabled', 'true');
  }
  if (isToday) {
    gridcell.setAttribute('aria-current', 'date');
  }

  const day = el('button', classes.join(' '));
  day.type = 'button';
  day.setAttribute('data-day', String(cell.day));
  day.setAttribute('data-year', String(cell.year));
  day.setAttribute('data-month', String(cell.month));
  if (cell.kind === 'prev') {
    day.setAttribute('data-other', 'prev');
  } else if (cell.kind === 'next') {
    day.setAttribute('data-other', 'next');
  }
  day.setAttribute('aria-label', accessibleDateLabel(cell, language));
  if (cell.disabled) {
    day.disabled = true;
    day.setAttribute('aria-disabled', 'true');
  }
  day.tabIndex = isFocused && !cell.disabled ? 0 : -1;
  day.appendChild(
    document.createTextNode(localizeDigits(cell.day, language))
  );

  gridcell.appendChild(day);
  return gridcell;
}

function renderActions(
  language: DatePickerLanguage,
  todayDisabled: boolean
): HTMLDivElement {
  const actions = el('div', 'nepali-datepicker-actions');

  const todayBtn = el('button', 'nepali-action-btn nepali-today-btn');
  todayBtn.type = 'button';
  todayBtn.appendChild(
    document.createTextNode(language === 'np' ? 'आज' : 'Today')
  );
  if (todayDisabled) {
    todayBtn.disabled = true;
    todayBtn.setAttribute('aria-disabled', 'true');
  }

  const clearBtn = el('button', 'nepali-action-btn nepali-clear-btn');
  clearBtn.type = 'button';
  clearBtn.appendChild(
    document.createTextNode(language === 'np' ? 'खाली' : 'Clear')
  );

  actions.append(todayBtn, clearBtn);
  return actions;
}

/**
 * Build the popup root `.nepali-datepicker` tree with createElement / textContent.
 * Does not attach event listeners (orchestrator owns that).
 */
export function buildCalendarElement(
  options: RenderCalendarOptions
): HTMLDivElement {
  const {
    theme,
    language,
    viewYear,
    viewMonth,
    selected,
    focused,
    today,
    popupId,
    isDateDisabled = () => false,
    todayDisabled = false,
    minYear = MIN_BS_YEAR,
    maxYear = MAX_BS_YEAR,
  } = options;

  const root = el('div', `nepali-datepicker nepali-datepicker-${theme}`);
  root.id = popupId;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'false');
  root.setAttribute(
    'aria-label',
    language === 'np' ? 'मिति छान्नुहोस्' : 'Choose date'
  );

  const header = el('div', 'nepali-datepicker-header');
  const prevBtn = el('button', 'nepali-nav-btn nepali-prev-btn');
  prevBtn.type = 'button';
  prevBtn.setAttribute(
    'aria-label',
    language === 'np' ? 'अघिल्लो महिना' : 'Previous month'
  );
  prevBtn.appendChild(document.createTextNode('\u25C0')); // ◀

  const nextBtn = el('button', 'nepali-nav-btn nepali-next-btn');
  nextBtn.type = 'button';
  nextBtn.setAttribute(
    'aria-label',
    language === 'np' ? 'अर्को महिना' : 'Next month'
  );
  nextBtn.appendChild(document.createTextNode('\u25B6')); // ▶

  const headerContent = el('div', 'nepali-header-content');
  const titleId = `${popupId}-label`;

  const monthSelect = el('select', 'nepali-month-select');
  monthSelect.setAttribute(
    'aria-label',
    language === 'np' ? 'महिना' : 'Month'
  );
  for (let i = 0; i < 12; i++) {
    const month1 = i + 1;
    const opt = el('option');
    opt.value = String(i);
    opt.appendChild(
      document.createTextNode(localizeMonth(month1, language))
    );
    if (month1 === viewMonth) {
      opt.selected = true;
    }
    monthSelect.appendChild(opt);
  }

  const yearSelect = el('select', 'nepali-year-select');
  yearSelect.setAttribute(
    'aria-label',
    language === 'np' ? 'वर्ष' : 'Year'
  );
  for (let y = minYear; y <= maxYear; y++) {
    const opt = el('option');
    opt.value = String(y);
    opt.appendChild(
      document.createTextNode(localizeDigits(y, language))
    );
    if (y === viewYear) {
      opt.selected = true;
    }
    yearSelect.appendChild(opt);
  }

  headerContent.append(monthSelect, yearSelect);
  header.append(prevBtn, headerContent, nextBtn);

  const live = el('div', 'nepali-datepicker-live');
  live.id = titleId;
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  live.appendChild(
    document.createTextNode(monthYearLabel(viewYear, viewMonth, language))
  );

  const weekdays = el('div', 'nepali-weekdays');
  weekdays.setAttribute('aria-hidden', 'true');
  for (const label of weekdayLabels(language)) {
    weekdays.appendChild(textElement('div', 'nepali-weekday', label));
  }

  const body = el('div', 'nepali-calendar-body');
  body.setAttribute('role', 'grid');
  body.setAttribute('aria-labelledby', titleId);

  const model = buildBsMonthGrid(
    viewYear,
    viewMonth,
    selected,
    isDateDisabled
  );
  for (let row = 0; row < 6; row++) {
    const week = el('div', 'nepali-week');
    week.setAttribute('role', 'row');
    for (let col = 0; col < 7; col++) {
      const cell = model.cells[row * 7 + col];
      week.appendChild(renderDayCell(cell, language, focused, today));
    }
    body.appendChild(week);
  }

  const actions = renderActions(language, todayDisabled);

  root.append(header, live, weekdays, body, actions);
  return root;
}
