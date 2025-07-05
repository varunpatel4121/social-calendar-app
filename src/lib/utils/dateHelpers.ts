import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  isToday
} from 'date-fns'

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  dayNumber: number
}

export interface CalendarMonth {
  date: Date
  monthName: string
  year: number
  days: CalendarDay[]
}

/**
 * Get an array of months starting from the current month and going forward
 */
export function getMonthsAroundDate(centerDate: Date, monthsAfter: number = 11): Date[] {
  const months: Date[] = []
  
  // Add center month
  months.push(centerDate)
  
  // Add months after
  for (let i = 1; i <= monthsAfter; i++) {
    months.push(addMonths(centerDate, i))
  }
  
  return months
}

/**
 * Get all days for a given month (including padding days from adjacent months)
 */
export function getDaysInMonth(monthDate: Date): CalendarDay[] {
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  return days.map(date => ({
    date,
    isCurrentMonth: isSameMonth(date, monthDate),
    isToday: isToday(date),
    dayNumber: date.getDate()
  }))
}

/**
 * Check if two dates are the same day
 */
export function areSameDay(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2)
}

/**
 * Check if a date is today
 */
export function isDateToday(date: Date): boolean {
  return isToday(date)
}

/**
 * Format a date as "Month Year" (e.g., "July 2025")
 */
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy')
}

/**
 * Format a date as "MMM yyyy" (e.g., "Jul 2025")
 */
export function formatMonthYearShort(date: Date): string {
  return format(date, 'MMM yyyy')
}

/**
 * Format a date as "d" (e.g., "15")
 */
export function formatDay(date: Date): string {
  return format(date, 'd')
}

/**
 * Get the current month as a Date object
 */
export function getCurrentMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

/**
 * Check if a date is in the past (before current month)
 */
export function isPastMonth(date: Date): boolean {
  const currentMonth = getCurrentMonth()
  return date < currentMonth
} 