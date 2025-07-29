export class NepaliDatepicker {
  private inputElement: HTMLInputElement
  private calendarVisible = false
  private currentDate: Date = new Date()
  private floatingCalendar: HTMLElement | null = null

  constructor(inputElement: HTMLInputElement) {
    this.inputElement = inputElement
    this.init()
  }

  private init(): void {
    this.inputElement.addEventListener("click", (e) => {
      e.stopPropagation()
      this.toggleCalendar()
    })

    document.addEventListener("click", this.handleClickOutside)
  }

  private toggleCalendar(): void {
    if (this.calendarVisible) {
      this.closeCalendar()
    } else {
      this.openCalendar()
    }
  }

  private handleClickOutside = (event: MouseEvent): void => {
    const target = event.target as Node | null
    if (
      this.floatingCalendar &&
      target &&
      !this.floatingCalendar.contains(target) &&
      !this.inputElement.contains(target)
    ) {
      this.closeCalendar()
    }
  }

  private openCalendar(): void {
    this.calendarVisible = true
    this.renderCalendar(this.currentDate.getFullYear(), this.currentDate.getMonth())
  }

  private renderCalendar(year: number, month: number): void {
    // Clear previous calendar if exists
    if (this.floatingCalendar && this.floatingCalendar.parentNode) {
      this.floatingCalendar.parentNode.removeChild(this.floatingCalendar)
    }

    // Generate calendar HTML & elements
    const calendarDiv = document.createElement("div")
    calendarDiv.className = "nepali-datepicker"

    calendarDiv.innerHTML = this.generateCalendarHtml(year, month)

    // Setup event listeners on calendar controls
    this.setupCalendarEvents(calendarDiv)

    // Append to body
    document.body.appendChild(calendarDiv)
    this.floatingCalendar = calendarDiv

    this.positionCalendarPopup()
  }

  private generateCalendarHtml(year: number, month: number): string {
    // Similar to your original month/year options + days grid HTML

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay()
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate()

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]

    let monthOptions = ""
    for (let i = 0; i < 12; i++) {
      monthOptions += `<option value="${i}"${i === month ? " selected" : ""}>${monthNames[i]}</option>`
    }

    let yearOptions = ""
    const currentYear = new Date().getFullYear()
    for (let y = currentYear - 100; y <= currentYear + 20; y++) {
      yearOptions += `<option value="${y}"${y === year ? " selected" : ""}>${y}</option>`
    }

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
        <div class="nepali-weekday">Sun</div>
        <div class="nepali-weekday">Mon</div>
        <div class="nepali-weekday">Tue</div>
        <div class="nepali-weekday">Wed</div>
        <div class="nepali-weekday">Thu</div>
        <div class="nepali-weekday">Fri</div>
        <div class="nepali-weekday">Sat</div>
      </div>
      <div class="nepali-calendar-body">
        ${this.generateDaysFullGrid(year, month, daysInMonth, firstDayOfWeek, lastDayOfPrevMonth)}
      </div>
    `
  }

  private setupCalendarEvents(calendarDiv: HTMLElement): void {
    const prevButton = calendarDiv.querySelector<HTMLButtonElement>(".nepali-prev-btn")
    const nextButton = calendarDiv.querySelector<HTMLButtonElement>(".nepali-next-btn")
    const monthSelect = calendarDiv.querySelector<HTMLSelectElement>(".nepali-month-select")
    const yearSelect = calendarDiv.querySelector<HTMLSelectElement>(".nepali-year-select")

    prevButton?.addEventListener("click", (e) => {
      e.stopPropagation()
      this.previousMonth()
    })

    nextButton?.addEventListener("click", (e) => {
      e.stopPropagation()
      this.nextMonth()
    })

    monthSelect?.addEventListener("change", (e) => {
      e.stopPropagation()
      this.changeMonth(e)
    })

    yearSelect?.addEventListener("change", (e) => {
      e.stopPropagation()
      this.changeYear(e)
    })

    calendarDiv.addEventListener("click", (e) => this.handleDateClick(e))
  }

  private positionCalendarPopup(): void {
    if (!this.floatingCalendar) return

    this.floatingCalendar.style.position = "absolute"
    this.floatingCalendar.style.zIndex = "9999"

    const inputRect = this.inputElement.getBoundingClientRect()
    const calendarRect = this.floatingCalendar.getBoundingClientRect()

    let top = inputRect.bottom + window.scrollY + 4
    let left = inputRect.left + window.scrollX

    if (window.innerHeight - inputRect.bottom < calendarRect.height && inputRect.top > calendarRect.height) {
      top = inputRect.top + window.scrollY - calendarRect.height - 4
    }

    if (window.innerWidth - inputRect.left < calendarRect.width) {
      left = inputRect.right + window.scrollX - calendarRect.width
    }

    this.floatingCalendar.style.top = `${top}px`
    this.floatingCalendar.style.left = `${left}px`
  }

  private closeCalendar(): void {
    this.calendarVisible = false
    if (this.floatingCalendar && this.floatingCalendar.parentNode) {
      this.floatingCalendar.parentNode.removeChild(this.floatingCalendar)
      this.floatingCalendar = null
    }
  }

  private handleDateClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const dayEl = target.closest<HTMLElement>(".nepali-day")
    if (!dayEl) return

    event.stopPropagation()
    this.selectDate(dayEl)
  }

  private selectDate(dayElement: HTMLElement): void {
    const day = parseInt(dayElement.dataset.day ?? "0", 10)
    let month = this.currentDate.getMonth()
    let year = this.currentDate.getFullYear()

    if (this.floatingCalendar) {
      const monthSelect = this.floatingCalendar.querySelector<HTMLSelectElement>(".nepali-month-select")
      const yearSelect = this.floatingCalendar.querySelector<HTMLSelectElement>(".nepali-year-select")
      if (monthSelect && yearSelect) {
        month = parseInt(monthSelect.value, 10)
        year = parseInt(yearSelect.value, 10)
      }
    }

    if (dayElement.dataset.other === "prev") {
      month -= 1
      if (month < 0) {
        month = 11
        year -= 1
      }
    } else if (dayElement.dataset.other === "next") {
      month += 1
      if (month > 11) {
        month = 0
        year += 1
      }
    }

    const date = new Date(year, month, day)
    this.currentDate = new Date(date)

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]
    const formatted = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`

    this.inputElement.value = formatted
    this.inputElement.dispatchEvent(new Event("change", { bubbles: true }))
    this.closeCalendar()
  }

  private isToday(date: Date): boolean {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  private isSelectedDate(date: Date): boolean {
    if (!this.inputElement.value) return false
    const inputDate = new Date(this.inputElement.value)
    return !isNaN(inputDate.getTime()) && inputDate.toDateString() === date.toDateString()
  }

  private generateDaysFullGrid(
    year: number,
    month: number,
    daysInMonth: number,
    firstDayOfWeek: number,
    lastDayOfPrevMonth: number
  ): string {
    let daysHTML = ""
    const totalCells = 42

    // Previous month days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDay = lastDayOfPrevMonth - firstDayOfWeek + i + 1
      daysHTML += `<div class="nepali-day nepali-other-month" data-day="${prevDay}" data-other="prev">${prevDay}</div>`
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = this.isToday(date)
      const isSelected = this.isSelectedDate(date)
      let classes = "nepali-day"

      if (isToday) classes += " nepali-today"
      if (isSelected) classes += " nepali-selected"

      daysHTML += `<div class="${classes}" data-day="${day}">${day}</div>`
    }

    // Next month days
    const daysFilled = firstDayOfWeek + daysInMonth
    for (let i = 1; i <= totalCells - daysFilled; i++) {
      daysHTML += `<div class="nepali-day nepali-other-month" data-day="${i}" data-other="next">${i}</div>`
    }

    return daysHTML
  }

  private previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1)
    this.renderCalendar(this.currentDate.getFullYear(), this.currentDate.getMonth())
  }

  private nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1)
    this.renderCalendar(this.currentDate.getFullYear(), this.currentDate.getMonth())
  }

  private changeMonth(event: Event): void {
    const target = event.target as HTMLSelectElement
    const newMonth = parseInt(target.value, 10)
    this.currentDate.setMonth(newMonth)
    this.renderCalendar(this.currentDate.getFullYear(), newMonth)
  }

  private changeYear(event: Event): void {
    const target = event.target as HTMLSelectElement
    const newYear = parseInt(target.value, 10)
    this.currentDate.setFullYear(newYear)
    this.renderCalendar(newYear, this.currentDate.getMonth())
  }
}
