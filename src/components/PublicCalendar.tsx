"use client";

import { useState, useEffect } from "react";
import { CalendarEvent } from "@/types/calendar";
import { getMonthsAroundDate, getCurrentMonth } from "@/lib/utils/date";
import CalendarMonth from "./calendar/CalendarMonth";
import EventModal from "@/components/modals/EventModal";
import PublicCalendarHeader from "./PublicCalendarHeader";

interface PublicCalendarProps {
  events: CalendarEvent[];
  calendarTitle: string;
  ownerName: string;
  publicId: string;
}

export default function PublicCalendar({
  events,
  calendarTitle,
  ownerName,
}: PublicCalendarProps) {
  const [currentViewMonth, setCurrentViewMonth] = useState(getCurrentMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [eventCount, setEventCount] = useState(0);

  // Show current + 11 future months
  const months = getMonthsAroundDate(currentViewMonth, 11);

  // Calculate event count for current month
  useEffect(() => {
    const currentMonthEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentViewMonth.getMonth() && 
             eventDate.getFullYear() === currentViewMonth.getFullYear();
    });
    setEventCount(currentMonthEvents.length);
  }, [events, currentViewMonth]);

  const handleDayClick = (date: Date, events: CalendarEvent[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
    if (events.length > 0) {
      console.log("Events for", date.toDateString(), ":", events);
    }
  };

  const navigateToToday = () => {
    setCurrentViewMonth(getCurrentMonth());
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedDate) {
        setSelectedDate(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <PublicCalendarHeader
        calendarTitle={calendarTitle}
        ownerName={ownerName}
        eventCount={eventCount}
        currentViewMonth={currentViewMonth}
        onMonthChange={setCurrentViewMonth}
        onYearChange={setCurrentViewMonth}
        onTodayClick={navigateToToday}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Container with subtle background gradient */}
        <div className="relative">
          {/* Subtle background gradient behind calendar */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-blue-50 rounded-3xl -z-10" />
          
          <div className="space-y-8">
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

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-6">
                This calendar is empty. Check back later for updates!
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Public Calendar
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Powered by <span className="font-semibold text-purple-600">Debrief</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Create your own social calendar at debrief.app
          </p>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        events={selectedEvents}
      />
    </div>
  );
} 