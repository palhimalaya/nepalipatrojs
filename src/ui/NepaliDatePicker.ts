import { getCurrentBSDate } from "../core/converters/ad-to-bs";
import { getDaysInMonth } from "../core/calendar";
import { NepaliDate } from "../core/types";
import { NepaliDatePickerOptions } from "./types";
import { formatBS as formatBSDate } from "../i18n/format";
import {
  localizeMonth,
  nepaliDigitsToEnglish,
  getDateFormatPatterns,
} from "../i18n/localization";
import {
  DateConstraints,
  isDateSelectable,
  normalizeConstraints,
} from "./constraints";
import {
  clampDay,
  initialFocusedDate,
  isCalendarNavKey,
  navigateFocusedDateSelectable,
  nearestSelectableInMonth,
  resolveInitialFocus,
} from "./keyboard";
import {
  applyPopupPositionStyles,
  computePopupPosition,
  readViewport,
  resolveZIndex,
} from "./position";
import { buildCalendarElement, setAdEquivalentFooter } from "./render";
import {
  clearSelected,
  closePicker,
  createInitialState,
  DatePickerState,
  isDestroyed,
  markDestroyed,
  nextMonth as stateNextMonth,
  openPicker,
  previousMonth as statePreviousMonth,
  setFocused,
  setSelected,
  setView,
} from "./state";

let popupIdSeq = 0;

export class NepaliDatePicker {
  private static instances: Set<NepaliDatePicker> = new Set();

  private inputElement: HTMLInputElement;
  private state: DatePickerState;
  private floatingCalendar: HTMLElement | null = null;
  private format: string;
  private theme: "light" | "dark";
  private language: "en" | "np";
  /** Constructor `options.zIndex` (if provided). */
  private readonly constructorZIndex: number | undefined;
  /** Runtime override from `setZIndex()` (sticky until destroyed). */
  private runtimeZIndex: number | undefined;
  private readonly constraints: DateConstraints;
  private readonly popupId: string;
  private readonly inputAriaBackup: {
    haspopup: string | null;
    expanded: string | null;
    controls: string | null;
  };
  private positionListenersAttached = false;
  private repositionScheduled = false;
  private repositionRaf: number | null = null;

  /** Tracked so destroy() can remove every listener (ISS-022 / Stage 3.3). */
  private readonly onInputClick = (e: MouseEvent): void => {
    e.stopPropagation();
    this.toggleCalendar();
  };

  private readonly onDocumentClick = (event: MouseEvent): void => {
    if (isDestroyed(this.state)) return;
    const target = event.target as Node | null;
    if (
      this.floatingCalendar &&
      target &&
      !this.floatingCalendar.contains(target) &&
      !this.inputElement.contains(target)
    ) {
      this.closeCalendar({ restoreFocus: false });
    }
  };

  private readonly onDocumentKeydown = (event: KeyboardEvent): void => {
    if (isDestroyed(this.state) || !this.state.open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      this.closeCalendar({ restoreFocus: true });
      return;
    }

    const active = document.activeElement as HTMLElement | null;
    const onDay = Boolean(active?.classList.contains("nepali-day"));
    if (!onDay) {
      return;
    }

    if (isCalendarNavKey(event.key)) {
      event.preventDefault();
      this.moveFocusByKey(event.key);
      return;
    }

    // Space: preventDefault blocks native click synthesis — select explicitly.
    // Enter: leave to native button → click → handleBSDateClick.
    if (event.key === " ") {
      event.preventDefault();
      if (active) {
        this.selectBSDate(active);
      }
    }
  };

  /** Popup listeners (removed when calendar DOM is torn down). */
  private readonly onPrevMonthClick = (e: MouseEvent): void => {
    e.stopPropagation();
    this.previousBSMonth();
  };

  private readonly onNextMonthClick = (e: MouseEvent): void => {
    e.stopPropagation();
    this.nextBSMonth();
  };

  private readonly onMonthSelectChange = (e: Event): void => {
    e.stopPropagation();
    this.changeBSMonth(e);
  };

  private readonly onYearSelectChange = (e: Event): void => {
    e.stopPropagation();
    this.changeBSYear(e);
  };

  private readonly onCalendarClick = (e: MouseEvent): void => {
    this.handleBSDateClick(e);
  };

  private readonly onTodayClick = (e: MouseEvent): void => {
    e.stopPropagation();
    this.selectToday();
  };

  private readonly onClearClick = (e: MouseEvent): void => {
    e.stopPropagation();
    this.clearDate();
  };

  private readonly onViewportChange = (): void => {
    this.scheduleReposition();
  };

  constructor(
    inputElement: HTMLInputElement,
    options: NepaliDatePickerOptions = {}
  ) {
    this.inputElement = inputElement;
    this.format = options.format || "YYYY-MM-DD";
    this.theme = options.theme || "light";
    this.language = options.language || "en";
    this.state = createInitialState(getCurrentBSDate());
    this.popupId = `nepali-datepicker-${++popupIdSeq}`;
    this.constructorZIndex = options.zIndex;
    this.runtimeZIndex = undefined;
    this.constraints = normalizeConstraints({
      minDate: options.minDate,
      maxDate: options.maxDate,
      disabledDates: options.disabledDates,
      isDateDisabled: options.isDateDisabled,
    });

    this.inputAriaBackup = {
      haspopup: inputElement.getAttribute("aria-haspopup"),
      expanded: inputElement.getAttribute("aria-expanded"),
      controls: inputElement.getAttribute("aria-controls"),
    };

    NepaliDatePicker.instances.add(this);

    this.init();
  }

  private effectiveZIndex(): number {
    return resolveZIndex({
      runtimeOverride: this.runtimeZIndex,
      constructorOption: this.constructorZIndex,
    }).value;
  }

  private canSelect(date: NepaliDate): boolean {
    return isDateSelectable(date, this.constraints);
  }

  private init(): void {
    this.inputElement.setAttribute("aria-haspopup", "dialog");
    this.inputElement.setAttribute("aria-expanded", "false");
    this.inputElement.setAttribute("aria-controls", this.popupId);
    this.inputElement.addEventListener("click", this.onInputClick);
    document.addEventListener("click", this.onDocumentClick);
    document.addEventListener("keydown", this.onDocumentKeydown);
  }

  private setExpanded(expanded: boolean): void {
    this.inputElement.setAttribute(
      "aria-expanded",
      expanded ? "true" : "false"
    );
  }

  private restoreInputAria(): void {
    const { haspopup, expanded, controls } = this.inputAriaBackup;
    if (haspopup === null) {
      this.inputElement.removeAttribute("aria-haspopup");
    } else {
      this.inputElement.setAttribute("aria-haspopup", haspopup);
    }
    if (expanded === null) {
      this.inputElement.removeAttribute("aria-expanded");
    } else {
      this.inputElement.setAttribute("aria-expanded", expanded);
    }
    if (controls === null) {
      this.inputElement.removeAttribute("aria-controls");
    } else {
      this.inputElement.setAttribute("aria-controls", controls);
    }
  }

  private toggleCalendar(): void {
    if (isDestroyed(this.state)) return;
    if (this.state.open) {
      this.closeCalendar({ restoreFocus: false });
    } else {
      this.openCalendar();
    }
  }

  private parseAndSetDateFromInput(): void {
    const inputValue = this.inputElement.value.trim();
    if (!inputValue) {
      // No value in input, keep current date
      return;
    }

    try {
      const parsedDate = this.parseDateString(inputValue);
      if (parsedDate && this.canSelect(parsedDate)) {
        this.state = setSelected(this.state, parsedDate);
      }
    } catch (error) {
      // If parsing fails, keep current date
      console.warn("Unable to parse date from input:", inputValue, error);
    }
  }

  private parseDateString(dateString: string): NepaliDate | null {
    if (!dateString) return null;

    const normalizedString = nepaliDigitsToEnglish(dateString);

    const monthNameDate = this.parseWithMonthNames(normalizedString);
    if (monthNameDate) {
      return monthNameDate;
    }

    const formatPatterns = getDateFormatPatterns();

    for (const pattern of formatPatterns) {
      const match = normalizedString.match(pattern.regex);
      if (match) {
        try {
          const year = parseInt(match[pattern.yearIndex], 10);
          const month = parseInt(match[pattern.monthIndex], 10);
          const day = parseInt(match[pattern.dayIndex], 10);

          // Validate the parsed date
          if (this.isValidBSDate(year, month, day)) {
            return { year, month, day };
          }
        } catch (e) {
          continue;
        }
      }
    }

    return null;
  }

  private parseWithMonthNames(dateString: string): NepaliDate | null {
    const englishMonths: string[] = [];
    const nepaliMonths: string[] = [];

    for (let i = 1; i <= 12; i++) {
      englishMonths.push(localizeMonth(i, "en"));
      nepaliMonths.push(localizeMonth(i, "np"));
    }

    // Try English month names first
    for (let i = 0; i < englishMonths.length; i++) {
      const monthName = englishMonths[i];
      // Escape special regex characters and create flexible patterns
      const escapedMonth = monthName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const monthRegex = new RegExp(`${escapedMonth}\\s+(\\d{1,2}),?\\s+(\\d{4})|${escapedMonth}\\s+(\\d{1,2})\\s+(\\d{4})|(\\d{1,2})\\s+${escapedMonth}\\s+(\\d{4})`, 'i');
      const match = dateString.match(monthRegex);

      if (match) {
        const day = parseInt(match[1] || match[3] || match[5], 10);
        const year = parseInt(match[2] || match[4] || match[6], 10);
        const month = i + 1;

        if (this.isValidBSDate(year, month, day)) {
          return { year, month, day };
        }
      }
    }

    // Try Nepali month names
    for (let i = 0; i < nepaliMonths.length; i++) {
      const monthName = nepaliMonths[i];
      // Escape special regex characters for Nepali month names
      const escapedMonth = monthName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const monthRegex = new RegExp(`${escapedMonth}\\s+(\\d{1,2}),?\\s+(\\d{4})|${escapedMonth}\\s+(\\d{1,2})\\s+(\\d{4})|(\\d{1,2})\\s+${escapedMonth}\\s+(\\d{4})`);
      const match = dateString.match(monthRegex);

      if (match) {
        const day = parseInt(match[1] || match[3] || match[5], 10);
        const year = parseInt(match[2] || match[4] || match[6], 10);
        const month = i + 1;

        if (this.isValidBSDate(year, month, day)) {
          return { year, month, day };
        }
      }
    }

    return null;
  }

  private isValidBSDate(year: number, month: number, day: number): boolean {
    if (month < 1 || month > 12) {
      return false;
    }
    try {
      const daysInMonth = getDaysInMonth(year, month);
      return day >= 1 && day <= daysInMonth;
    } catch {
      return false;
    }
  }

  private openCalendar(): void {
    if (isDestroyed(this.state)) return;

    // Close all other calendars before opening this one
    this.closeAllOtherCalendars();

    // Parse existing value from input field if present
    this.parseAndSetDateFromInput();

    this.state = openPicker(this.state);
    const preferred = initialFocusedDate(
      this.state.view.year,
      this.state.view.month,
      this.state.selected,
      this.state.today
    );
    this.state = setFocused(
      this.state,
      resolveInitialFocus(preferred, (d) => this.canSelect(d))
    );
    this.setExpanded(true);
    this.renderCalendar(this.state.view.year, this.state.view.month, {
      moveDomFocus: true,
    });
  }

  private renderCalendar(
    bsYear: number,
    bsMonth1Based: number,
    opts: { moveDomFocus: boolean }
  ): void {
    this.teardownCalendarDom();

    const calendarDiv = buildCalendarElement({
      theme: this.theme,
      language: this.language,
      viewYear: bsYear,
      viewMonth: bsMonth1Based,
      selected: this.state.selected,
      focused: this.state.focused,
      today: this.state.today,
      popupId: this.popupId,
      isDateDisabled: (d) => !this.canSelect(d),
      todayDisabled: !this.canSelect(this.state.today),
    });

    this.setupCalendarEvents(calendarDiv);

    // Body-attached absolute positioning (document coordinates).
    document.body.appendChild(calendarDiv);
    this.floatingCalendar = calendarDiv;

    this.positionCalendarPopup();
    this.attachPositionListeners();

    if (opts.moveDomFocus) {
      this.focusFocusedDay();
    }
  }

  private focusFocusedDay(): void {
    const day = this.findDayElement(this.state.focused);
    if (day) {
      day.focus();
    }
  }

  private findDayElement(date: NepaliDate): HTMLButtonElement | null {
    if (!this.floatingCalendar) return null;
    const days =
      this.floatingCalendar.querySelectorAll<HTMLButtonElement>(".nepali-day");
    for (const el of Array.from(days)) {
      if (
        Number(el.dataset.year) === date.year &&
        Number(el.dataset.month) === date.month &&
        Number(el.dataset.day) === date.day
      ) {
        return el;
      }
    }
    return null;
  }

  private moveFocusByKey(
    key: Parameters<typeof navigateFocusedDateSelectable>[1]
  ): void {
    const next = navigateFocusedDateSelectable(
      this.state.focused,
      key,
      (d) => this.canSelect(d)
    );
    this.state = setFocused(this.state, next);

    const viewChanged =
      next.year !== this.state.view.year || next.month !== this.state.view.month;
    if (viewChanged) {
      this.state = setView(this.state, next.year, next.month);
      this.renderCalendar(this.state.view.year, this.state.view.month, {
        moveDomFocus: true,
      });
      return;
    }

    // Update roving tabindex without full rebuild when staying in-month.
    if (!this.floatingCalendar) return;
    const days =
      this.floatingCalendar.querySelectorAll<HTMLElement>(".nepali-day");
    days.forEach((el) => {
      el.tabIndex = -1;
    });
    const target = this.findDayElement(next);
    if (target && !target.disabled) {
      target.tabIndex = 0;
      target.focus();
    }
    setAdEquivalentFooter(this.floatingCalendar, next, this.language);
  }

  private setupCalendarEvents(calendarDiv: HTMLElement): void {
    const prevButton =
      calendarDiv.querySelector<HTMLButtonElement>(".nepali-prev-btn");
    const nextButton =
      calendarDiv.querySelector<HTMLButtonElement>(".nepali-next-btn");
    const monthSelect = calendarDiv.querySelector<HTMLSelectElement>(
      ".nepali-month-select"
    );
    const yearSelect = calendarDiv.querySelector<HTMLSelectElement>(
      ".nepali-year-select"
    );
    const todayButton =
      calendarDiv.querySelector<HTMLButtonElement>(".nepali-today-btn");
    const clearButton =
      calendarDiv.querySelector<HTMLButtonElement>(".nepali-clear-btn");

    prevButton?.addEventListener("click", this.onPrevMonthClick);
    nextButton?.addEventListener("click", this.onNextMonthClick);
    monthSelect?.addEventListener("change", this.onMonthSelectChange);
    yearSelect?.addEventListener("change", this.onYearSelectChange);
    todayButton?.addEventListener("click", this.onTodayClick);
    clearButton?.addEventListener("click", this.onClearClick);
    calendarDiv.addEventListener("click", this.onCalendarClick);
  }

  private teardownCalendarDom(): void {
    this.detachPositionListeners();
    if (!this.floatingCalendar) return;
    const calendarDiv = this.floatingCalendar;
    const active = document.activeElement as HTMLElement | null;
    if (active && calendarDiv.contains(active)) {
      active.blur();
    }
    const prevButton =
      calendarDiv.querySelector<HTMLButtonElement>(".nepali-prev-btn");
    const nextButton =
      calendarDiv.querySelector<HTMLButtonElement>(".nepali-next-btn");
    const monthSelect = calendarDiv.querySelector<HTMLSelectElement>(
      ".nepali-month-select"
    );
    const yearSelect = calendarDiv.querySelector<HTMLSelectElement>(
      ".nepali-year-select"
    );
    const todayButton =
      calendarDiv.querySelector<HTMLButtonElement>(".nepali-today-btn");
    const clearButton =
      calendarDiv.querySelector<HTMLButtonElement>(".nepali-clear-btn");
    prevButton?.removeEventListener("click", this.onPrevMonthClick);
    nextButton?.removeEventListener("click", this.onNextMonthClick);
    monthSelect?.removeEventListener("change", this.onMonthSelectChange);
    yearSelect?.removeEventListener("change", this.onYearSelectChange);
    todayButton?.removeEventListener("click", this.onTodayClick);
    clearButton?.removeEventListener("click", this.onClearClick);
    calendarDiv.removeEventListener("click", this.onCalendarClick);
    if (calendarDiv.parentNode) {
      calendarDiv.parentNode.removeChild(calendarDiv);
    }
    this.floatingCalendar = null;
  }

  private attachPositionListeners(): void {
    if (this.positionListenersAttached) return;
    window.addEventListener("resize", this.onViewportChange, {
      passive: true,
    });
    // Capture phase so nested scroll containers trigger reposition.
    window.addEventListener("scroll", this.onViewportChange, true);
    this.positionListenersAttached = true;
  }

  private detachPositionListeners(): void {
    if (!this.positionListenersAttached) return;
    window.removeEventListener("resize", this.onViewportChange);
    window.removeEventListener("scroll", this.onViewportChange, true);
    this.positionListenersAttached = false;
    this.repositionScheduled = false;
    if (this.repositionRaf !== null) {
      cancelAnimationFrame(this.repositionRaf);
      this.repositionRaf = null;
    }
  }

  private scheduleReposition(): void {
    if (!this.floatingCalendar || isDestroyed(this.state)) return;
    if (this.repositionScheduled) return;
    this.repositionScheduled = true;
    this.repositionRaf = requestAnimationFrame(() => {
      this.repositionScheduled = false;
      this.repositionRaf = null;
      this.positionCalendarPopup();
    });
  }

  private handleBSDateClick(event: MouseEvent): void {
    if (isDestroyed(this.state)) return;
    const target = event.target as HTMLElement;
    const dayEl = target.closest<HTMLButtonElement>(".nepali-day");
    if (!dayEl || dayEl.disabled) return;
    event.stopPropagation();
    this.selectBSDate(dayEl);
  }

  private commitDate(date: NepaliDate): void {
    if (isDestroyed(this.state) || !this.canSelect(date)) return;
    this.state = setSelected(this.state, date);
    const formatted = formatBSDate(date, this.format, {
      language: this.language,
    });
    this.inputElement.value = formatted;
    this.inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    this.closeCalendar({ restoreFocus: true });
  }

  private selectBSDate(dayElement: HTMLElement): void {
    if (isDestroyed(this.state)) return;
    if (
      dayElement instanceof HTMLButtonElement &&
      dayElement.disabled
    ) {
      return;
    }

    const yearAttr = dayElement.dataset.year;
    const monthAttr = dayElement.dataset.month;
    const dayAttr = dayElement.dataset.day;

    let day = parseInt(dayAttr ?? "0", 10);
    let month = yearAttr && monthAttr
      ? parseInt(monthAttr, 10)
      : this.state.view.month;
    let year = yearAttr ? parseInt(yearAttr, 10) : this.state.view.year;

    if (!yearAttr || !monthAttr) {
      // Fallback for legacy attributes
      month = this.state.view.month;
      year = this.state.view.year;
      if (this.floatingCalendar) {
        const monthSelect =
          this.floatingCalendar.querySelector<HTMLSelectElement>(
            ".nepali-month-select"
          );
        const yearSelect =
          this.floatingCalendar.querySelector<HTMLSelectElement>(
            ".nepali-year-select"
          );
        if (monthSelect && yearSelect) {
          month = parseInt(monthSelect.value, 10) + 1;
          year = parseInt(yearSelect.value, 10);
        }
      }
      if (dayElement.dataset.other === "prev") {
        month -= 1;
        if (month < 1) {
          month = 12;
          year -= 1;
        }
      } else if (dayElement.dataset.other === "next") {
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
      }
    }

    this.commitDate({ year, month, day });
  }

  private selectToday(): void {
    if (isDestroyed(this.state)) return;
    if (!this.canSelect(this.state.today)) {
      return;
    }
    this.commitDate({ ...this.state.today });
  }

  /**
   * Clear: empty input, clear selection, fire `change`, keep popup open.
   * Does not select today or any fallback date.
   */
  private clearDate(): void {
    if (isDestroyed(this.state)) return;
    this.state = clearSelected(this.state);
    this.inputElement.value = "";
    this.inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    this.renderCalendar(this.state.view.year, this.state.view.month, {
      moveDomFocus: true,
    });
  }

  private syncFocusedToView(): void {
    const preferred = clampDay(
      this.state.view.year,
      this.state.view.month,
      this.state.focused.day
    );
    const next =
      nearestSelectableInMonth(preferred, (d) => this.canSelect(d)) ??
      resolveInitialFocus(preferred, (d) => this.canSelect(d));
    this.state = setFocused(this.state, next);
  }

  private previousBSMonth(): void {
    if (isDestroyed(this.state)) return;
    this.state = statePreviousMonth(this.state);
    this.syncFocusedToView();
    this.renderCalendar(this.state.view.year, this.state.view.month, {
      moveDomFocus: true,
    });
  }

  private nextBSMonth(): void {
    if (isDestroyed(this.state)) return;
    this.state = stateNextMonth(this.state);
    this.syncFocusedToView();
    this.renderCalendar(this.state.view.year, this.state.view.month, {
      moveDomFocus: true,
    });
  }

  private changeBSMonth(event: Event): void {
    if (isDestroyed(this.state)) return;
    const target = event.target as HTMLSelectElement;
    const newMonth0 = parseInt(target.value, 10);
    this.state = setView(this.state, this.state.view.year, newMonth0 + 1);
    this.syncFocusedToView();
    this.renderCalendar(this.state.view.year, this.state.view.month, {
      moveDomFocus: true,
    });
  }

  private changeBSYear(event: Event): void {
    if (isDestroyed(this.state)) return;
    const target = event.target as HTMLSelectElement;
    const newYear = parseInt(target.value, 10);
    this.state = setView(this.state, newYear, this.state.view.month);
    this.syncFocusedToView();
    this.renderCalendar(this.state.view.year, this.state.view.month, {
      moveDomFocus: true,
    });
  }

  private positionCalendarPopup(): void {
    if (!this.floatingCalendar) return;

    // Measure once, then write styles (avoid interleaving reads/writes).
    const inputRect = this.inputElement.getBoundingClientRect();
    const calendarRect = this.floatingCalendar.getBoundingClientRect();
    const viewport = readViewport(window);
    const position = computePopupPosition(inputRect, calendarRect, viewport);
    applyPopupPositionStyles(
      this.floatingCalendar,
      position,
      this.effectiveZIndex()
    );
  }

  private closeCalendar(opts: { restoreFocus: boolean }): void {
    this.state = closePicker(this.state);
    this.setExpanded(false);
    this.teardownCalendarDom();
    if (opts.restoreFocus) {
      this.inputElement.focus();
    }
  }

  private closeAllOtherCalendars(): void {
    NepaliDatePicker.instances.forEach(instance => {
      if (instance !== this && instance.state.open && !isDestroyed(instance.state)) {
        instance.closeCalendar({ restoreFocus: false });
      }
    });
  }

  public setZIndex(zIndex: number): void {
    if (isDestroyed(this.state)) return;
    this.runtimeZIndex = zIndex;
    if (this.floatingCalendar) {
      this.floatingCalendar.style.zIndex = String(this.effectiveZIndex());
    }
  }

  public destroy(): void {
    if (isDestroyed(this.state)) {
      return;
    }
    this.closeCalendar({ restoreFocus: false });
    this.detachPositionListeners();
    this.inputElement.removeEventListener("click", this.onInputClick);
    document.removeEventListener("click", this.onDocumentClick);
    document.removeEventListener("keydown", this.onDocumentKeydown);
    this.restoreInputAria();
    this.state = markDestroyed(this.state);
    NepaliDatePicker.instances.delete(this);
  }
}
