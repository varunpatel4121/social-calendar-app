'use client'

import { CalendarEvent } from '@/types/calendar'
import { getDaysInMonth, formatMonthYear } from '@/lib/utils/date'
import CalendarDay from '@/components/calendar/CalendarDay'

interface CalendarMonthProps {
  date: Date
  onDayClick: (date: Date, events: CalendarEvent[]) => void
  events?: CalendarEvent[]
}

export default function CalendarMonth({ date, onDayClick, events }: CalendarMonthProps) {
  const days = getDaysInMonth(date)
  
  return (
    <div className="mb-12">
      {/* Month Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {formatMonthYear(date)}
        </h2>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <CalendarDay
            key={day.date.toISOString()}
            day={day}
            onDayClick={onDayClick}
            events={events}
          />
        ))}
      </div>
    </div>
  )
} 