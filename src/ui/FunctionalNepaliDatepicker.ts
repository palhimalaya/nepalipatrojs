export interface DatepickerState {
  inputElement: HTMLInputElement
  calendarVisible: boolean
  currentDate: Date
  floatingCalendar: HTMLElement | null
}

export interface DatepickerConfig {
  inputElement: HTMLInputElement
  onDateChange?: (date: Date) => void
  dateFormat?: (date: Date) => string
}

// Month names constant
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

// Create initial state
const createDatepickerState = (inputElement: HTMLInputElement): DatepickerState => ({
  inputElement,
  calendarVisible: false,
  currentDate: new Date(),
  floatingCalendar: null
})

// Default date formatter
const defaultDateFormatter = (date: Date): string => {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

// Event handlers
const createClickOutsideHandler = (state: DatepickerState) => (event: MouseEvent): void => {
  const target = event.target as Node | null
  if (
    state.floatingCalendar &&
    target &&
    !state.floatingCalendar.contains(target) &&
    !state.inputElement.contains(target)
  ) {
    closeCalendar(state)
  }
}

const createInputClickHandler = (state: DatepickerState) => (e: Event): void => {
  e.stopPropagation()
  toggleCalendar(state)
}

// Calendar visibility functions
const toggleCalendar = (state: DatepickerState): void => {
  if (state.calendarVisible) {
    closeCalendar(state)
  } else {
    openCalendar(state)
  }
}

const openCalendar = (state: DatepickerState): void => {
  state.calendarVisible = true
  renderCalendar(state, state.currentDate.getFullYear(), state.currentDate.getMonth())
}

const closeCalendar = (state: DatepickerState): void => {
  state.calendarVisible = false
  if (state.floatingCalendar && state.floatingCalendar.parentNode) {
    state.floatingCalendar.parentNode.removeChild(state.floatingCalendar)
    state.floatingCalendar = null
  }
}

// Calendar rendering functions
const renderCalendar = (state: DatepickerState, year: number, month: number): void => {
  // Clear previous calendar if exists
  if (state.floatingCalendar && state.floatingCalendar.parentNode) {
    state.floatingCalendar.parentNode.removeChild(state.floatingCalendar)
  }

  // Generate calendar HTML & elements
  const calendarDiv = document.createElement("div")
  calendarDiv.className = "nepali-datepicker"
  calendarDiv.innerHTML = generateCalendarHtml(state, year, month)

  // Setup event listeners on calendar controls
  setupCalendarEvents(state, calendarDiv)

  // Append to body
  document.body.appendChild(calendarDiv)
  state.floatingCalendar = calendarDiv

  positionCalendarPopup(state)
}

const generateCalendarHtml = (state: DatepickerState, year: number, month: number): string => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const firstDayOfWeek = firstDay.getDay()
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate()

  const monthOptions = MONTH_NAMES
    .map((name, i) => `<option value="${i}"${i === month ? " selected" : ""}>${name}</option>`)
    .join("")

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 121 }, (_, i) => currentYear - 100 + i)
    .map(y => `<option value="${y}"${y === year ? " selected" : ""}>${y}</option>`)
    .join("")

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
      ${generateDaysFullGrid(state, year, month, daysInMonth, firstDayOfWeek, lastDayOfPrevMonth)}
    </div>
  `
}

const generateDaysFullGrid = (
  state: DatepickerState,
  year: number,
  month: number,
  daysInMonth: number,
  firstDayOfWeek: number,
  lastDayOfPrevMonth: number
): string => {
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
    const isToday = checkIsToday(date)
    const isSelected = checkIsSelectedDate(state, date)
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

// Event setup functions
const setupCalendarEvents = (state: DatepickerState, calendarDiv: HTMLElement): void => {
  const prevButton = calendarDiv.querySelector<HTMLButtonElement>(".nepali-prev-btn")
  const nextButton = calendarDiv.querySelector<HTMLButtonElement>(".nepali-next-btn")
  const monthSelect = calendarDiv.querySelector<HTMLSelectElement>(".nepali-month-select")
  const yearSelect = calendarDiv.querySelector<HTMLSelectElement>(".nepali-year-select")

  prevButton?.addEventListener("click", createNavigationHandler(state, "prev"))
  nextButton?.addEventListener("click", createNavigationHandler(state, "next"))
  monthSelect?.addEventListener("change", createMonthChangeHandler(state))
  yearSelect?.addEventListener("change", createYearChangeHandler(state))
  calendarDiv.addEventListener("click", createDateClickHandler(state))
}

const createNavigationHandler = (state: DatepickerState, direction: "prev" | "next") => (e: Event): void => {
  e.stopPropagation()
  if (direction === "prev") {
    navigateToPreviousMonth(state)
  } else {
    navigateToNextMonth(state)
  }
}

const createMonthChangeHandler = (state: DatepickerState) => (e: Event): void => {
  e.stopPropagation()
  const target = e.target as HTMLSelectElement
  const newMonth = parseInt(target.value, 10)
  state.currentDate.setMonth(newMonth)
  renderCalendar(state, state.currentDate.getFullYear(), newMonth)
}

const createYearChangeHandler = (state: DatepickerState) => (e: Event): void => {
  e.stopPropagation()
  const target = e.target as HTMLSelectElement
  const newYear = parseInt(target.value, 10)
  state.currentDate.setFullYear(newYear)
  renderCalendar(state, newYear, state.currentDate.getMonth())
}

const createDateClickHandler = (state: DatepickerState) => (event: MouseEvent): void => {
  const target = event.target as HTMLElement
  const dayEl = target.closest<HTMLElement>(".nepali-day")
  if (!dayEl) return

  event.stopPropagation()
  selectDate(state, dayEl)
}

// Navigation functions
const navigateToPreviousMonth = (state: DatepickerState): void => {
  state.currentDate.setMonth(state.currentDate.getMonth() - 1)
  renderCalendar(state, state.currentDate.getFullYear(), state.currentDate.getMonth())
}

const navigateToNextMonth = (state: DatepickerState): void => {
  state.currentDate.setMonth(state.currentDate.getMonth() + 1)
  renderCalendar(state, state.currentDate.getFullYear(), state.currentDate.getMonth())
}

// Date selection functions
const selectDate = (state: DatepickerState, dayElement: HTMLElement, formatter = defaultDateFormatter): void => {
  const day = parseInt(dayElement.dataset.day ?? "0", 10)
  let month = state.currentDate.getMonth()
  let year = state.currentDate.getFullYear()

  if (state.floatingCalendar) {
    const monthSelect = state.floatingCalendar.querySelector<HTMLSelectElement>(".nepali-month-select")
    const yearSelect = state.floatingCalendar.querySelector<HTMLSelectElement>(".nepali-year-select")
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
  state.currentDate = new Date(date)

  const formatted = formatter(date)
  state.inputElement.value = formatted
  state.inputElement.dispatchEvent(new Event("change", { bubbles: true }))
  closeCalendar(state)
}

// Utility functions
const positionCalendarPopup = (state: DatepickerState): void => {
  if (!state.floatingCalendar) return

  state.floatingCalendar.style.position = "absolute"
  state.floatingCalendar.style.zIndex = "9999"

  const inputRect = state.inputElement.getBoundingClientRect()
  const calendarRect = state.floatingCalendar.getBoundingClientRect()

  let top = inputRect.bottom + window.scrollY + 4
  let left = inputRect.left + window.scrollX

  if (window.innerHeight - inputRect.bottom < calendarRect.height && inputRect.top > calendarRect.height) {
    top = inputRect.top + window.scrollY - calendarRect.height - 4
  }

  if (window.innerWidth - inputRect.left < calendarRect.width) {
    left = inputRect.right + window.scrollX - calendarRect.width
  }

  state.floatingCalendar.style.top = `${top}px`
  state.floatingCalendar.style.left = `${left}px`
}

const checkIsToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const checkIsSelectedDate = (state: DatepickerState, date: Date): boolean => {
  if (!state.inputElement.value) return false
  const inputDate = new Date(state.inputElement.value)
  return !isNaN(inputDate.getTime()) && inputDate.toDateString() === date.toDateString()
}

// Main initialization function
export const createNepaliDatepicker = (config: DatepickerConfig): (() => void) => {
  const state = createDatepickerState(config.inputElement)
  const clickOutsideHandler = createClickOutsideHandler(state)
  const inputClickHandler = createInputClickHandler(state)

  // Initialize event listeners
  state.inputElement.addEventListener("click", inputClickHandler)
  document.addEventListener("click", clickOutsideHandler)

  // Return cleanup function
  return (): void => {
    state.inputElement.removeEventListener("click", inputClickHandler)
    document.removeEventListener("click", clickOutsideHandler)
    closeCalendar(state)
  }
}

// Alternative factory function for more control
export const initNepaliDatepicker = (
  inputElement: HTMLInputElement,
  options: {
    dateFormatter?: (date: Date) => string
    onDateChange?: (date: Date) => void
  } = {}
): {
  destroy: () => void
  openCalendar: () => void
  closeCalendar: () => void
  setDate: (date: Date) => void
} => {
  const state = createDatepickerState(inputElement)
  const { dateFormatter = defaultDateFormatter, onDateChange } = options
  
  const clickOutsideHandler = createClickOutsideHandler(state)
  const inputClickHandler = createInputClickHandler(state)

  // Override selectDate to use custom formatter and callback
  const customSelectDate = (dayElement: HTMLElement): void => {
    selectDate(state, dayElement, dateFormatter)
    if (onDateChange) {
      onDateChange(state.currentDate)
    }
  }

  // Initialize
  inputElement.addEventListener("click", inputClickHandler)
  document.addEventListener("click", clickOutsideHandler)

  return {
    destroy: (): void => {
      inputElement.removeEventListener("click", inputClickHandler)
      document.removeEventListener("click", clickOutsideHandler)
      closeCalendar(state)
    },
    openCalendar: (): void => openCalendar(state),
    closeCalendar: (): void => closeCalendar(state),
    setDate: (date: Date): void => {
      state.currentDate = new Date(date)
      inputElement.value = dateFormatter(date)
    }
  }
}