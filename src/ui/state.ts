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
  /** Selected BS date (always set in v1 parity) */
  selected: NepaliDate;
  /** Civil "today" snapshot at init (BS) */
  today: NepaliDate;
}

export function createInitialState(today: NepaliDate): DatePickerState {
  return {
    open: false,
    destroyed: false,
    view: { year: today.year, month: today.month },
    selected: { year: today.year, month: today.month, day: today.day },
    today: { year: today.year, month: today.month, day: today.day },
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
  return {
    ...state,
    selected: { year: date.year, month: date.month, day: date.day },
    view: { year: date.year, month: date.month },
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
