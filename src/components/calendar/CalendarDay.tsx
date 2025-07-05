'use client'

import { CalendarDay as CalendarDayType } from '@/lib/utils/date'
import { CalendarEvent } from '@/types/calendar'
import StoryBubble from '@/components/calendar/StoryBubble'

interface CalendarDayProps {
  day: CalendarDayType
  onDayClick: (date: Date, events: CalendarEvent[]) => void
  events?: CalendarEvent[]
}

export default function CalendarDay({ day, onDayClick, events }: CalendarDayProps) {
  // Only use provided events, no fallback to mock events
  const dayEvents = events ? events.filter(e => e.date === day.date.toISOString().split('T')[0]) : []
  
  const handleClick = () => {
    onDayClick(day.date, dayEvents)
  }

  // If there are events, show the first one as a story bubble
  if (dayEvents.length > 0) {
    const firstEvent = dayEvents[0]
    return (
      <StoryBubble
        event={firstEvent}
        dayNumber={day.dayNumber}
        isCurrentMonth={day.isCurrentMonth}
        isToday={day.isToday}
        onClick={handleClick}
      />
    )
  }

  // Otherwise, show a regular day cell
  return (
    <div
      className={`
        relative aspect-square rounded-2xl p-1 cursor-pointer transition-all duration-200
        ${day.isCurrentMonth 
          ? 'hover:bg-gray-50 active:bg-gray-100' 
          : 'opacity-30'
        }
        ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
      onClick={handleClick}
    >
      {/* Date Number */}
      <div className={`
        w-full h-full rounded-xl flex items-center justify-center text-sm font-medium
        ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
        ${day.isToday ? 'bg-blue-50 text-blue-700' : ''}
      `}>
        {day.dayNumber}
      </div>
    </div>
  )
} 