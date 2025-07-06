"use client";

import { CalendarEvent } from "@/types/calendar";
import { getDaysInMonth } from "@/lib/utils/date";
import CalendarDay from "@/components/calendar/CalendarDay";
import { format } from "date-fns";

interface CalendarMonthProps {
  date: Date;
  onDayClick: (date: Date, events: CalendarEvent[]) => void;
  events?: CalendarEvent[];
}

export default function CalendarMonth({
  date,
  onDayClick,
  events,
}: CalendarMonthProps) {
  const days = getDaysInMonth(date);

  return (
    <div className="mb-12">
      {/* Month Title - Full-width section header */}
      <div className="sticky top-20 z-40 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 mb-6 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(date, "MMMM yyyy")}
          </h2>
        </div>
      </div>

      {/* Calendar Container with subtle shadow */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
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
    </div>
  );
}
