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
import { buildCalendarElement } from "./render";
import {
  closePicker,
  createInitialState,
  DatePickerState,
  isDestroyed,
  markDestroyed,
  nextMonth as stateNextMonth,
  openPicker,
  previousMonth as statePreviousMonth,
  setSelected,
  setView,
} from "./state";

export class NepaliDatePicker {
  private static instances: Set<NepaliDatePicker> = new Set();

  private inputElement: HTMLInputElement;
  private state: DatePickerState;
  private floatingCalendar: HTMLElement | null = null;
  private format: string;
  private theme: "light" | "dark";
  private language: "en" | "np";
  private zIndex: number;

  /** Tracked so destroy() can remove every listener (ISS-022). */
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
      this.closeCalendar();
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

  constructor(
    inputElement: HTMLInputElement,
    options: NepaliDatePickerOptions = {}
  ) {
    this.inputElement = inputElement;
    this.format = options.format || "YYYY-MM-DD";
    this.theme = options.theme || "light";
    this.language = options.language || "en";
    this.state = createInitialState(getCurrentBSDate());

    // Calculate appropriate z-index
    this.zIndex = this.calculateZIndex(options.zIndex);

    NepaliDatePicker.instances.add(this);

    this.init();
  }

  // Method to calculate the appropriate z-index
  private calculateZIndex(customZIndex?: number): number {
    if (customZIndex) {
      return customZIndex;
    }

    // Find the highest z-index in the current context
    const highestZIndex = this.getHighestZIndex();

    // Use a much higher base z-index for modals
    const baseZIndex = Math.max(highestZIndex + 1000, 999999);

    return baseZIndex;
  }

  // Method to find the highest z-index in the current document
  private getHighestZIndex(): number {
    let highest = 0;

    // Check if input is inside a modal or high z-index container
    let element: HTMLElement | null = this.inputElement;
    while (element && element !== document.body) {
      const zIndex = window.getComputedStyle(element).zIndex;
      if (zIndex !== 'auto' && zIndex !== '' && !isNaN(parseInt(zIndex))) {
        const numericZIndex = parseInt(zIndex);
        if (numericZIndex > highest) {
          highest = numericZIndex;
        }
      }
      element = element.parentElement;
    }

    const modalSelectors = [
      '.modal',
      '.Modal',
      '[role="dialog"]',
      '[data-modal]',
      '.ant-modal',
      '.MuiModal-root',
      '.v-dialog',
      '.el-dialog',
      '.ui-dialog',
      '.swal2-container',
      '.popup',
      '.overlay',
      '.modal-overlay',
      '.dialog',
      '.lightbox'
    ];

    modalSelectors.forEach(selector => {
      const modals = document.querySelectorAll(selector);
      modals.forEach(modal => {
        const zIndex = window.getComputedStyle(modal as HTMLElement).zIndex;
        if (zIndex !== 'auto' && zIndex !== '' && !isNaN(parseInt(zIndex))) {
          const numericZIndex = parseInt(zIndex);
          if (numericZIndex > highest) {
            highest = numericZIndex;
          }
        }
      });
    });

    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const zIndex = window.getComputedStyle(el as HTMLElement).zIndex;
      if (zIndex !== 'auto' && zIndex !== '' && !isNaN(parseInt(zIndex))) {
        const numericZIndex = parseInt(zIndex);
        if (numericZIndex > highest) {
          highest = numericZIndex;
        }
      }
    });

    return highest;
  }

  private init(): void {
    this.inputElement.addEventListener("click", this.onInputClick);
    document.addEventListener("click", this.onDocumentClick);
  }

  private toggleCalendar(): void {
    if (isDestroyed(this.state)) return;
    if (this.state.open) {
      this.closeCalendar();
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
      if (parsedDate) {
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

    // Recalculate z-index in case the context has changed
    this.zIndex = this.calculateZIndex();

    // Parse existing value from input field if present
    this.parseAndSetDateFromInput();

    this.state = openPicker(this.state);
    this.renderCalendar(this.state.view.year, this.state.view.month);
  }

  private renderCalendar(bsYear: number, bsMonth1Based: number): void {
    this.teardownCalendarDom();

    const calendarDiv = buildCalendarElement({
      theme: this.theme,
      language: this.language,
      viewYear: bsYear,
      viewMonth: bsMonth1Based,
      selected: this.state.selected,
    });

    this.setupCalendarEvents(calendarDiv);

    const modalContainer = this.findModalContainer();
    const appendTarget = modalContainer || document.body;

    appendTarget.appendChild(calendarDiv);
    this.floatingCalendar = calendarDiv;

    this.positionCalendarPopup();
  }

  private findModalContainer(): HTMLElement | null {
    let element: HTMLElement | null = this.inputElement;

    while (element && element !== document.body) {
      const classList = element.classList;
      const role = element.getAttribute('role');
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'dialog') {
        return element;
      }

      if (
        classList.contains('modal') ||
        classList.contains('Modal') ||
        classList.contains('popup') ||
        classList.contains('dialog') ||
        classList.contains('overlay') ||
        role === 'dialog' ||
        element.hasAttribute('data-modal') ||
        // Check for high z-index that might indicate a modal
        (window.getComputedStyle(element).zIndex !== 'auto' &&
         parseInt(window.getComputedStyle(element).zIndex) > 1000)
      ) {
        return element;
      }

      element = element.parentElement;
    }

    return null;
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

    prevButton?.addEventListener("click", this.onPrevMonthClick);
    nextButton?.addEventListener("click", this.onNextMonthClick);
    monthSelect?.addEventListener("change", this.onMonthSelectChange);
    yearSelect?.addEventListener("change", this.onYearSelectChange);
    calendarDiv.addEventListener("click", this.onCalendarClick);
  }

  private teardownCalendarDom(): void {
    if (!this.floatingCalendar) return;
    const calendarDiv = this.floatingCalendar;
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
    prevButton?.removeEventListener("click", this.onPrevMonthClick);
    nextButton?.removeEventListener("click", this.onNextMonthClick);
    monthSelect?.removeEventListener("change", this.onMonthSelectChange);
    yearSelect?.removeEventListener("change", this.onYearSelectChange);
    calendarDiv.removeEventListener("click", this.onCalendarClick);
    if (calendarDiv.parentNode) {
      calendarDiv.parentNode.removeChild(calendarDiv);
    }
    this.floatingCalendar = null;
  }

  private handleBSDateClick(event: MouseEvent): void {
    if (isDestroyed(this.state)) return;
    const target = event.target as HTMLElement;
    const dayEl = target.closest<HTMLElement>(".nepali-day");
    if (!dayEl) return;
    event.stopPropagation();
    this.selectBSDate(dayEl);
  }

  private selectBSDate(dayElement: HTMLElement): void {
    if (isDestroyed(this.state)) return;

    let day = parseInt(dayElement.dataset.day ?? "0", 10);
    let month = this.state.view.month; // 1-based
    let year = this.state.view.year;

    if (this.floatingCalendar) {
      const monthSelect =
        this.floatingCalendar.querySelector<HTMLSelectElement>(
          ".nepali-month-select"
        );
      const yearSelect = this.floatingCalendar.querySelector<HTMLSelectElement>(
        ".nepali-year-select"
      );
      if (monthSelect && yearSelect) {
        month = parseInt(monthSelect.value, 10) + 1; // select is 0-based
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

    const date: NepaliDate = { year, month, day };
    this.state = setSelected(this.state, date);

    const formatted = formatBSDate(date, this.format, {
      language: this.language,
    });
    this.inputElement.value = formatted;
    this.inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    this.closeCalendar();
  }

  private previousBSMonth(): void {
    if (isDestroyed(this.state)) return;
    this.state = statePreviousMonth(this.state);
    this.renderCalendar(this.state.view.year, this.state.view.month);
  }

  private nextBSMonth(): void {
    if (isDestroyed(this.state)) return;
    this.state = stateNextMonth(this.state);
    this.renderCalendar(this.state.view.year, this.state.view.month);
  }

  private changeBSMonth(event: Event): void {
    if (isDestroyed(this.state)) return;
    const target = event.target as HTMLSelectElement;
    const newMonth0 = parseInt(target.value, 10);
    this.state = setView(this.state, this.state.view.year, newMonth0 + 1);
    this.renderCalendar(this.state.view.year, this.state.view.month);
  }

  private changeBSYear(event: Event): void {
    if (isDestroyed(this.state)) return;
    const target = event.target as HTMLSelectElement;
    const newYear = parseInt(target.value, 10);
    this.state = setView(this.state, newYear, this.state.view.month);
    this.renderCalendar(this.state.view.year, this.state.view.month);
  }

  private positionCalendarPopup(): void {
    if (!this.floatingCalendar) return;

    this.floatingCalendar.style.position = "absolute";
    this.floatingCalendar.style.zIndex = this.zIndex.toString();

    const inputRect = this.inputElement.getBoundingClientRect();
    const calendarRect = this.floatingCalendar.getBoundingClientRect();

    let top = inputRect.bottom + window.scrollY + 4;
    let left = inputRect.left + window.scrollX;

    if (
      window.innerHeight - inputRect.bottom < calendarRect.height &&
      inputRect.top > calendarRect.height
    ) {
      top = inputRect.top + window.scrollY - calendarRect.height - 4;
    }

    if (window.innerWidth - inputRect.left < calendarRect.width) {
      left = inputRect.right + window.scrollX - calendarRect.width;
    }

    this.floatingCalendar.style.top = `${top}px`;
    this.floatingCalendar.style.left = `${left}px`;
  }

  private closeCalendar(): void {
    this.state = closePicker(this.state);
    this.teardownCalendarDom();
  }

  private closeAllOtherCalendars(): void {
    NepaliDatePicker.instances.forEach(instance => {
      if (instance !== this && instance.state.open && !isDestroyed(instance.state)) {
        instance.closeCalendar();
      }
    });
  }

  public setZIndex(zIndex: number): void {
    if (isDestroyed(this.state)) return;
    this.zIndex = zIndex;
    if (this.floatingCalendar) {
      this.floatingCalendar.style.zIndex = zIndex.toString();
    }
  }

  public destroy(): void {
    if (isDestroyed(this.state)) {
      return;
    }
    this.closeCalendar();
    this.inputElement.removeEventListener("click", this.onInputClick);
    document.removeEventListener("click", this.onDocumentClick);
    this.state = markDestroyed(this.state);
    NepaliDatePicker.instances.delete(this);
  }
}
