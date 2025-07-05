'use client'

import { useState, useEffect, useRef } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { CalendarEvent } from '@/types/calendar'
import { getMonthsAroundDate, getCurrentMonth, isPastMonth } from '@/lib/utils/date'
import CalendarMonth from './CalendarMonth'
import EventModal from '@/components/modals/EventModal'
import EventCreateButton from '@/components/EventCreateButton'
import { supabase } from '@/lib/supabaseClient'

interface CalendarProps {
  userId: string
  events?: CalendarEvent[]
  onEventClick?: (date: Date, events: CalendarEvent[]) => void
}

export default function Calendar({ userId, events: propEvents, onEventClick }: CalendarProps) {
  const [currentViewMonth, setCurrentViewMonth] = useState(getCurrentMonth())
  const [datePickerValue, setDatePickerValue] = useState(format(getCurrentMonth(), 'yyyy-MM'))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>(propEvents || [])
  const containerRef = useRef<HTMLDivElement>(null)

  // Infinite scroll: for now, just show current + 11 future months, but logic is ready for extension
  const months = getMonthsAroundDate(currentViewMonth, 11)

  const handleDayClick = (date: Date, events: CalendarEvent[]) => {
    setSelectedDate(date)
    setSelectedEvents(events)
    if (events.length > 0) {
      console.log('Events for', date.toDateString(), ':', events)
    }
    onEventClick?.(date, events)
  }

  const navigateToMonth = (direction: 'prev' | 'next') => {
    setCurrentViewMonth(prev => {
      const newDate = direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
      const currentMonth = getCurrentMonth()
      if (direction === 'prev' && isPastMonth(newDate)) {
        return currentMonth
      }
      return newDate
    })
  }

  const navigateToYear = (direction: 'prev' | 'next') => {
    setCurrentViewMonth(prev => {
      const newDate = direction === 'next' ? addMonths(prev, 12) : subMonths(prev, 12)
      const currentMonth = getCurrentMonth()
      if (direction === 'prev' && isPastMonth(newDate)) {
        return currentMonth
      }
      return newDate
    })
  }

  const navigateToToday = () => {
    setCurrentViewMonth(getCurrentMonth())
  }

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDatePickerValue(value)
    if (value) {
      const [year, month] = value.split('-').map(Number)
      const selectedDate = new Date(year, month - 1, 1)
      const currentMonth = getCurrentMonth()
      if (isPastMonth(selectedDate)) {
        setCurrentViewMonth(currentMonth)
        setDatePickerValue(format(currentMonth, 'yyyy-MM'))
      } else {
        setCurrentViewMonth(selectedDate)
      }
    }
  }

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', userId)

      if (error) {
        console.error('Error fetching events:', error)
        return
      }

      // Transform Supabase data to CalendarEvent format
      const transformedEvents: CalendarEvent[] = data?.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        imageUrl: event.location, // Using location field for image URL
        date: new Date(event.start_time).toISOString().split('T')[0], // Convert timestamp to date string
        color: event.color
      })) || []

      setEvents(transformedEvents)
    }

    if (userId) {
      fetchEvents()
    }
  }, [userId])

  useEffect(() => {
    setDatePickerValue(format(currentViewMonth, 'yyyy-MM'))
  }, [currentViewMonth])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedDate) {
        setSelectedDate(null)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [selectedDate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Top Row - Brand & Stats */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Social Calendar</h1>
                <p className="text-blue-100 text-sm">Share your moments</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-white font-bold text-lg">{events?.length || 0}</div>
                <div className="text-blue-100 text-xs">Events</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">{format(new Date(), 'd')}</div>
                <div className="text-blue-100 text-xs">Today</div>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                <span className="text-white text-sm font-medium">
                  {format(new Date(), 'MMM yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row - Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Year Navigation */}
              <button
                onClick={() => navigateToYear('prev')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous year"
                disabled={isPastMonth(subMonths(currentViewMonth, 12))}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>

              {/* Month Navigation */}
              <button
                onClick={() => navigateToMonth('prev')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous month"
                disabled={isPastMonth(subMonths(currentViewMonth, 1))}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => navigateToMonth('next')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Next month"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Today Button */}
              <button
                onClick={navigateToToday}
                className="px-3 py-1.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                Today
              </button>
            </div>

            {/* Date Picker */}
            <div className="flex items-center space-x-2">
              <input
                id="date-picker"
                type="month"
                value={datePickerValue}
                onChange={handleDatePickerChange}
                min={format(getCurrentMonth(), 'yyyy-MM')}
                max="2030-12"
                className="px-3 py-1.5 bg-white/90 backdrop-blur-sm border-0 rounded-lg focus:ring-2 focus:ring-white/50 focus:bg-white text-sm"
                placeholder="Select month"
                title="Select a month (current month or later)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div ref={containerRef} className="space-y-8">
          {months.map((month) => (
            <CalendarMonth
              key={month.toISOString()}
              date={month}
              onDayClick={handleDayClick}
              events={events}
            />
          ))}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        events={selectedEvents}
      />

      {/* Floating Create Event Button */}
      <EventCreateButton selectedDate={selectedDate || undefined} />
    </div>
  )
} 