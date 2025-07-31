import { BS_CALENDAR_DATA } from "../constants/calendar-data";
import {
  getCurrentBSDate,
  convertBSToAD,
  formatBSDate,
  NepaliDate,
  NepaliMonth,
  NepaliMonthNepali,
  NepaliWeekDay,
  NepaliWeekDayNepali,
  NepaliDatepickerOptions
} from "../index";
import { localizeDigits, localizeMonth } from "../utils/helpers";

export class NepaliDatepicker {
  private inputElement: HTMLInputElement;
  private calendarVisible = false;
  private currentBSYear: number = getCurrentBSDate().year;
  private currentBSMonth: number = getCurrentBSDate().month - 1;
  private currentBSDay: number = getCurrentBSDate().day;
  private floatingCalendar: HTMLElement | null = null;
  private format: string;
  private theme: "light" | "dark";
  private language: "en" | "np";

  constructor(
    inputElement: HTMLInputElement,
    options: NepaliDatepickerOptions = {}
  ) {
    this.inputElement = inputElement;
    this.format = options.format || "MMMM D, YYYY";
    this.theme = options.theme || "light";
    this.language = options.language || "en";
    this.init();
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

  private openCalendar(): void {
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

    document.body.appendChild(calendarDiv);
    this.floatingCalendar = calendarDiv;

    this.positionCalendarPopup();
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
    this.floatingCalendar.style.zIndex = "9999";

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
}
