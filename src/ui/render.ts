/**
 * Safe DOM construction for the datepicker popup (Phase 3 Stage 3.2 / ISS-014).
 * Dynamic labels use textContent / createTextNode only (ISS-014).
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
  selected: NepaliDate;
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

function renderDayCell(
  cell: CalendarCell,
  language: DatePickerLanguage
): HTMLDivElement {
  const classes = ['nepali-day'];
  if (cell.kind !== 'current') {
    classes.push('nepali-other-month');
  }
  if (cell.selected) {
    classes.push('nepali-selected');
  }
  const day = textElement('div', classes.join(' '), localizeDigits(cell.day, language));
  day.setAttribute('data-day', String(cell.day));
  if (cell.kind === 'prev') {
    day.setAttribute('data-other', 'prev');
  } else if (cell.kind === 'next') {
    day.setAttribute('data-other', 'next');
  }
  return day;
}

/**
 * Build the popup root `.nepali-datepicker` tree with createElement / textContent.
 * Does not attach event listeners (orchestrator owns that).
 */
export function buildCalendarElement(options: RenderCalendarOptions): HTMLDivElement {
  const {
    theme,
    language,
    viewYear,
    viewMonth,
    selected,
    minYear = MIN_BS_YEAR,
    maxYear = MAX_BS_YEAR,
  } = options;

  const root = el('div', `nepali-datepicker nepali-datepicker-${theme}`);

  const header = el('div', 'nepali-datepicker-header');
  const prevBtn = el('button', 'nepali-nav-btn nepali-prev-btn');
  prevBtn.type = 'button';
  prevBtn.appendChild(document.createTextNode('\u25C0')); // ◀

  const nextBtn = el('button', 'nepali-nav-btn nepali-next-btn');
  nextBtn.type = 'button';
  nextBtn.appendChild(document.createTextNode('\u25B6')); // ▶

  const headerContent = el('div', 'nepali-header-content');

  const monthSelect = el('select', 'nepali-month-select');
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

  const weekdays = el('div', 'nepali-weekdays');
  for (const label of weekdayLabels(language)) {
    weekdays.appendChild(textElement('div', 'nepali-weekday', label));
  }

  const body = el('div', 'nepali-calendar-body');
  const model = buildBsMonthGrid(viewYear, viewMonth, selected);
  for (const cell of model.cells) {
    body.appendChild(renderDayCell(cell, language));
  }

  root.append(header, weekdays, body);
  return root;
}
