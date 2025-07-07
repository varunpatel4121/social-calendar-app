"use client";

import { CalendarEvent } from "@/types/calendar";
import { getDaysInMonth } from "@/lib/utils/date";
import CalendarDay from "@/components/calendar/CalendarDay";

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
