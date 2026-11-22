/**
 * Pure datepicker state (Phase 3 Stage 3.1).
 * No DOM / browser APIs. Months are 1-based (BS domain).
 */

import { NepaliDate } from '../core/types';

export interface ViewMonth {
  year: number;
  month: number; // 1–12
}

export interface DatePickerState {
  open: boolean;
  destroyed: boolean;
  /** Currently displayed BS month */
  view: ViewMonth;
  /**
   * Selected BS date, or `null` after Clear.
   * Initialized to today for v1 parity when the input is empty.
   */
  selected: NepaliDate | null;
  /** Keyboard-focused BS date (distinct from selected) */
  focused: NepaliDate;
  /** Civil "today" snapshot at init (BS) */
  today: NepaliDate;
}

export function createInitialState(today: NepaliDate): DatePickerState {
  const snap = { year: today.year, month: today.month, day: today.day };
  return {
    open: false,
    destroyed: false,
    view: { year: today.year, month: today.month },
    selected: { ...snap },
    focused: { ...snap },
    today: { ...snap },
  };
}

export function openPicker(state: DatePickerState): DatePickerState {
  if (state.destroyed) return state;
  return { ...state, open: true };
}

export function closePicker(state: DatePickerState): DatePickerState {
  if (state.destroyed) return state;
  return { ...state, open: false };
}

export function togglePicker(state: DatePickerState): DatePickerState {
  if (state.destroyed) return state;
  return { ...state, open: !state.open };
}

export function setSelected(
  state: DatePickerState,
  date: NepaliDate
): DatePickerState {
  if (state.destroyed) return state;
  const next = { year: date.year, month: date.month, day: date.day };
  return {
    ...state,
    selected: next,
    focused: next,
    view: { year: date.year, month: date.month },
  };
}

/** Clear selection without changing view/focused (Stage 3.5 Clear). */
export function clearSelected(state: DatePickerState): DatePickerState {
  if (state.destroyed) return state;
  return {
    ...state,
    selected: null,
  };
}

export function setFocused(
  state: DatePickerState,
  date: NepaliDate
): DatePickerState {
  if (state.destroyed) return state;
  return {
    ...state,
    focused: { year: date.year, month: date.month, day: date.day },
  };
}

export function setView(
  state: DatePickerState,
  year: number,
  month: number
): DatePickerState {
  if (state.destroyed) return state;
  return {
    ...state,
    view: { year, month },
  };
}

export function previousMonth(state: DatePickerState): DatePickerState {
  if (state.destroyed) return state;
  let { year, month } = state.view;
  month -= 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return { ...state, view: { year, month } };
}

export function nextMonth(state: DatePickerState): DatePickerState {
  if (state.destroyed) return state;
  let { year, month } = state.view;
  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return { ...state, view: { year, month } };
}

export function markDestroyed(state: DatePickerState): DatePickerState {
  return {
    ...state,
    open: false,
    destroyed: true,
  };
}

export function isDestroyed(state: DatePickerState): boolean {
  return state.destroyed;
}
