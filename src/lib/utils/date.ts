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
  subMonths,
  isToday,
  isAfter,
} from "date-fns";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNumber: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  date: string;
  color?: string;
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

export function getMonthsForInfiniteScroll(
  centerDate: Date,
  monthsBefore: number = 6,
  monthsAfter: number = 6,
): Date[] {
  const months: Date[] = [];
  
  // Add past months (including current)
  for (let i = monthsBefore; i >= 0; i--) {
    months.push(subMonths(centerDate, i));
  }
  
  // Add future months
  for (let i = 1; i <= monthsAfter; i++) {
    months.push(addMonths(centerDate, i));
  }
  
  return months;
}

export function getMonthsWithEvents(
  events: CalendarEvent[],
  centerDate: Date,
  monthsBefore: number = 12,
  monthsAfter: number = 12,
): Date[] {
  const months: Date[] = [];
  const currentMonth = getCurrentMonth();
  
  // Always include current month
  months.push(currentMonth);
  
  // Get all potential months
  const allMonths = getMonthsForInfiniteScroll(centerDate, monthsBefore, monthsAfter);
  
  // Filter months that have events
  allMonths.forEach(month => {
    const monthStr = month.toISOString().slice(0, 7); // 'YYYY-MM'
    const hasEvents = events.some(event => event.date.startsWith(monthStr));
    
    if (hasEvents && !months.some(m => isSameMonth(m, month))) {
      months.push(month);
    }
  });
  
  // Sort months chronologically
  return months.sort((a, b) => a.getTime() - b.getTime());
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

export function isFutureMonth(date: Date): boolean {
  const currentMonth = getCurrentMonth();
  return isAfter(date, currentMonth);
}

export function getMonthEventCount(events: CalendarEvent[], month: Date): number {
  const monthStr = month.toISOString().slice(0, 7); // 'YYYY-MM'
  return events.filter(event => event.date.startsWith(monthStr)).length;
}
