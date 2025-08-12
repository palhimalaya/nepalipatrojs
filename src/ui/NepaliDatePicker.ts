import { BS_CALENDAR_DATA } from "../constants/calendar-data";
import {
  getCurrentBSDate,
  convertBSToAD,
  formatBSDate,
  NepaliDate,
  NepaliDatePickerOptions
} from "../index";
import { localizeDigits, localizeMonth, nepaliDigitsToEnglish, getDateFormatPatterns } from "../utils/helpers";

export class NepaliDatePicker {
  private static instances: Set<NepaliDatePicker> = new Set();
  
  private inputElement: HTMLInputElement;
  private calendarVisible = false;
  private currentBSYear: number = getCurrentBSDate().year;
  private currentBSMonth: number = getCurrentBSDate().month - 1;
  private currentBSDay: number = getCurrentBSDate().day;
  private floatingCalendar: HTMLElement | null = null;
  private format: string;
  private theme: "light" | "dark";
  private language: "en" | "np";
  private zIndex: number;

  constructor(
    inputElement: HTMLInputElement,
    options: NepaliDatePickerOptions = {}
  ) {
    this.inputElement = inputElement;
    this.format = options.format || "YYYY-MM-DD";
    this.theme = options.theme || "light";
    this.language = options.language || "en";
    
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
    this.inputElement.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleCalendar();
    });

    document.addEventListener("click", this.handleClickOutside);
  }

  private toggleCalendar(): void {
    if (this.calendarVisible) {
      this.closeCalendar();
    } else {
      this.openCalendar();
    }
  }

  private handleClickOutside = (event: MouseEvent): void => {
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

  private parseAndSetDateFromInput(): void {
    const inputValue = this.inputElement.value.trim();
    if (!inputValue) {
      // No value in input, keep current date
      return;
    }

    try {
      const parsedDate = this.parseDateString(inputValue);
      if (parsedDate) {
        this.currentBSYear = parsedDate.year;
        this.currentBSMonth = parsedDate.month - 1;
        this.currentBSDay = parsedDate.day;
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
    if (!BS_CALENDAR_DATA[year]) {
      return false;
    }
    
    if (month < 1 || month > 12) {
      return false;
    }
    
    // Check if day is valid for the given month and year
    const monthData = BS_CALENDAR_DATA[year][0][month - 1];
    const daysInMonth = Array.isArray(monthData) ? monthData[0] : monthData;
    
    return day >= 1 && day <= daysInMonth;
  }

  private openCalendar(): void {
    // Close all other calendars before opening this one
    this.closeAllOtherCalendars();
    
    // Recalculate z-index in case the context has changed
    this.zIndex = this.calculateZIndex();
    
    // Parse existing value from input field if present
    this.parseAndSetDateFromInput();
    
    this.calendarVisible = true;
    this.renderCalendar(this.currentBSYear, this.currentBSMonth);
  }

  private renderCalendar(bsYear: number, bsMonth: number): void {
    if (this.floatingCalendar && this.floatingCalendar.parentNode) {
      this.floatingCalendar.parentNode.removeChild(this.floatingCalendar);
    }

    const calendarDiv = document.createElement("div");
    calendarDiv.className = `nepali-datepicker nepali-datepicker-${this.theme}`;

    calendarDiv.innerHTML = this.generateCalendarHtml(bsYear, bsMonth);

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

  private generateCalendarHtml(bsYear: number, bsMonth: number): string {
    // Get available years from BS_CALENDAR_DATA
    const bsYears = Object.keys(BS_CALENDAR_DATA)
      .map(Number)
      .sort((a, b) => a - b);
    let yearOptions = "";
    for (const y of bsYears) {
      yearOptions += `<option value="${y}"${
        y === bsYear ? " selected" : ""
      }>${localizeDigits(y, this.language)}</option>`;
    }
    let monthOptions = "";
    for (let i = 0; i < 12; i++) {
      monthOptions += `<option value="${i}"${
        i === bsMonth ? " selected" : ""
      }>${localizeMonth(i + 1, this.language)}</option>`;
    }
    // Get days in this BS month
    const rawDaysInMonth = BS_CALENDAR_DATA[bsYear]?.[0][bsMonth];
    const daysInMonth = Array.isArray(rawDaysInMonth)
      ? rawDaysInMonth[0]
      : typeof rawDaysInMonth === "number"
      ? rawDaysInMonth
      : 30;
    // Calculate the weekday of the 1st day of this BS month
    const firstDayOfWeek = this.getBSFirstDayOfWeek(bsYear, bsMonth);
    // Get days in previous month
    let prevMonth = bsMonth - 1;
    let prevYear = bsYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }
    const rawLastDayOfPrevMonth = BS_CALENDAR_DATA[prevYear]?.[0][prevMonth];
    const lastDayOfPrevMonth = Array.isArray(rawLastDayOfPrevMonth)
      ? rawLastDayOfPrevMonth[0]
      : typeof rawLastDayOfPrevMonth === "number"
      ? rawLastDayOfPrevMonth
      : 30;
    const weekdays = this.language === "np"
    ? ["आ", "सो", "मं", "बु", "बि", "शु", "श"]
    : ["S", "M", "T", "W", "T", "F", "S"];

    return `
      <div class="nepali-datepicker-header">
        <button type="button" class="nepali-nav-btn nepali-prev-btn">&#9664;</button>
        <div class="nepali-header-content">
          <select class="nepali-month-select">${monthOptions}</select>
          <select class="nepali-year-select">${yearOptions}</select>
        </div>
        <button type="button" class="nepali-nav-btn nepali-next-btn">&#9654;</button>
      </div>
      <div class="nepali-weekdays">
        ${weekdays.map(day => `<div class="nepali-weekday">${day}</div>`).join('')}
      </div>
      <div class="nepali-calendar-body">
        ${this.generateBSDaysFullGrid(
          bsYear,
          bsMonth,
          daysInMonth,
          firstDayOfWeek,
          lastDayOfPrevMonth
        )}
      </div>
    `;
  }

  private getBSFirstDayOfWeek(bsYear: number, bsMonth: number): number {
    try {
      const adDate = convertBSToAD({
        year: bsYear,
        month: bsMonth + 1,
        day: 1,
      });
      if (adDate instanceof Date && !isNaN(adDate.getTime())) {
        return adDate.getDay();
      }
    } catch (e) {
      console.log("Error converting BS to AD:", e);
    }
    return 0;
  }

  // Render the days grid for BS calendar
  private generateBSDaysFullGrid(
    bsYear: number,
    bsMonth: number,
    daysInMonth: number,
    firstDayOfWeek: number,
    lastDayOfPrevMonth: number
  ): string {
    let daysHTML = "";
    const totalCells = 42;
    // Previous month days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDay = lastDayOfPrevMonth - firstDayOfWeek + i + 1;
      daysHTML += `<div class="nepali-day nepali-other-month" data-day="${prevDay}" data-other="prev">${localizeDigits(prevDay, this.language)}</div>`;
    }
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      let classes = "nepali-day";
      if (this.isBSSelectedDate(bsYear, bsMonth, day))
        classes += " nepali-selected";
      daysHTML += `<div class="${classes}" data-day="${day}">${localizeDigits(day, this.language)}</div>`;
    }
    // Next month days
    const daysFilled = firstDayOfWeek + daysInMonth;
    for (let i = 1; i <= totalCells - daysFilled; i++) {
      daysHTML += `<div class="nepali-day nepali-other-month" data-day="${i}" data-other="next">${localizeDigits(i, this.language)}</div>`;
    }
    return daysHTML;
  }

  private isBSSelectedDate(
    bsYear: number,
    bsMonth: number,
    bsDay: number
  ): boolean {
    return (
      bsYear === this.currentBSYear &&
      bsMonth === this.currentBSMonth &&
      bsDay === this.currentBSDay
    );
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

    prevButton?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.previousBSMonth();
    });

    nextButton?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.nextBSMonth();
    });

    monthSelect?.addEventListener("change", (e) => {
      e.stopPropagation();
      this.changeBSMonth(e);
    });

    yearSelect?.addEventListener("change", (e) => {
      e.stopPropagation();
      this.changeBSYear(e);
    });

    calendarDiv.addEventListener("click", (e) => this.handleBSDateClick(e));
  }

  private handleBSDateClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dayEl = target.closest<HTMLElement>(".nepali-day");
    if (!dayEl) return;
    event.stopPropagation();
    this.selectBSDate(dayEl);
  }

  private selectBSDate(dayElement: HTMLElement): void {
    let day = parseInt(dayElement.dataset.day ?? "0", 10);
    let month = this.currentBSMonth;
    let year = this.currentBSYear;

    if (this.floatingCalendar) {
      const monthSelect =
        this.floatingCalendar.querySelector<HTMLSelectElement>(
          ".nepali-month-select"
        );
      const yearSelect = this.floatingCalendar.querySelector<HTMLSelectElement>(
        ".nepali-year-select"
      );
      if (monthSelect && yearSelect) {
        month = parseInt(monthSelect.value, 10);
        year = parseInt(yearSelect.value, 10);
      }
    }

    if (dayElement.dataset.other === "prev") {
      month -= 1;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
    } else if (dayElement.dataset.other === "next") {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }

    this.currentBSYear = year;
    this.currentBSMonth = month;
    this.currentBSDay = day;

    const date: NepaliDate = {
      year: this.currentBSYear,
      month: this.currentBSMonth + 1,
      day: this.currentBSDay,
    };
    const formatted = formatBSDate(date, this.format, {
      language: this.language,
    });
    this.inputElement.value = formatted;
    this.inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    this.closeCalendar();
  }

  private previousBSMonth(): void {
    let month = this.currentBSMonth - 1;
    let year = this.currentBSYear;
    if (month < 0) {
      month = 11;
      year--;
    }
    this.currentBSMonth = month;
    this.currentBSYear = year;
    this.renderCalendar(year, month);
  }

  private nextBSMonth(): void {
    let month = this.currentBSMonth + 1;
    let year = this.currentBSYear;
    if (month > 11) {
      month = 0;
      year++;
    }
    this.currentBSMonth = month;
    this.currentBSYear = year;
    this.renderCalendar(year, month);
  }

  private changeBSMonth(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newMonth = parseInt(target.value, 10);
    this.currentBSMonth = newMonth;
    this.renderCalendar(this.currentBSYear, newMonth);
  }

  private changeBSYear(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newYear = parseInt(target.value, 10);
    this.currentBSYear = newYear;
    this.renderCalendar(newYear, this.currentBSMonth);
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
    this.calendarVisible = false;
    if (this.floatingCalendar && this.floatingCalendar.parentNode) {
      this.floatingCalendar.parentNode.removeChild(this.floatingCalendar);
      this.floatingCalendar = null;
    }
  }

  private closeAllOtherCalendars(): void {
    NepaliDatePicker.instances.forEach(instance => {
      if (instance !== this && instance.calendarVisible) {
        instance.closeCalendar();
      }
    });
  }

  public setZIndex(zIndex: number): void {
    this.zIndex = zIndex;
    if (this.floatingCalendar) {
      this.floatingCalendar.style.zIndex = zIndex.toString();
    }
  }

  public destroy(): void {
    this.closeCalendar();
    document.removeEventListener("click", this.handleClickOutside);
    NepaliDatePicker.instances.delete(this);
  }
}