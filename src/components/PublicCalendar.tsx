"use client";

import { useState, useEffect } from "react";
import { CalendarEvent } from "@/types/calendar";
import { getMonthsAroundDate, getCurrentMonth } from "@/lib/utils/date";
import CalendarMonth from "./calendar/CalendarMonth";
import EventModal from "@/components/modals/EventModal";

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
  publicId,
}: PublicCalendarProps) {
  const [currentViewMonth, setCurrentViewMonth] = useState(getCurrentMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

  // Show current + 11 future months
  const months = getMonthsAroundDate(currentViewMonth, 11);

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

  const navigateToPreviousMonth = () => {
    const newMonth = new Date(currentViewMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentViewMonth(newMonth);
  };

  const navigateToNextMonth = () => {
    const newMonth = new Date(currentViewMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentViewMonth(newMonth);
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
    <div className="w-full">
      {/* Calendar Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {calendarTitle}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Created by {ownerName}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {events.length} event{events.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Public Calendar
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={navigateToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={navigateToToday}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Today
            </button>
            
            <button
              onClick={navigateToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentViewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
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