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
  isToday,
} from "date-fns";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNumber: number;
}

export function getMonthsAroundDate(
  centerDate: Date,
  monthsAfter: number = 11,
): Date[] {
  const months: Date[] = [];
  months.push(centerDate);
  for (let i = 1; i <= monthsAfter; i++) {
    months.push(addMonths(centerDate, i));
  }
  return months;
}

export function getDaysInMonth(monthDate: Date): CalendarDay[] {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  return days.map((date) => ({
    date,
    isCurrentMonth: isSameMonth(date, monthDate),
    isToday: isToday(date),
    dayNumber: date.getDate(),
  }));
}

export function areSameDay(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

export function isDateToday(date: Date): boolean {
  return isToday(date);
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function formatMonthYearShort(date: Date): string {
  return format(date, "MMM yyyy");
}

export function formatDay(date: Date): string {
  return format(date, "d");
}

export function getCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function isPastMonth(date: Date): boolean {
  const currentMonth = getCurrentMonth();
  return date < currentMonth;
}
