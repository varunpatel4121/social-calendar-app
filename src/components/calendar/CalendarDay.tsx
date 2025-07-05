"use client";

import { CalendarDay as CalendarDayType } from "@/lib/utils/date";
import { CalendarEvent } from "@/types/calendar";

interface CalendarDayProps {
  day: CalendarDayType;
  onDayClick: (date: Date, events: CalendarEvent[]) => void;
  events?: CalendarEvent[];
}

export default function CalendarDay({
  day,
  onDayClick,
  events,
}: CalendarDayProps) {
  const dayEvents = events
    ? events.filter((e) => e.date === day.date.toISOString().split("T")[0])
    : [];

  const handleClick = () => {
    onDayClick(day.date, dayEvents);
  };

  const getEventImage = () => {
    if (dayEvents.length > 0) {
      return dayEvents[0].imageUrl;
    }
    return null;
  };

  const hasEvents = dayEvents.length > 0;
  const eventImage = getEventImage();

  return (
    <div
      className={`
        relative aspect-square rounded-2xl cursor-pointer transition-all duration-300
        hover:scale-105 active:scale-95 group
        ${
          day.isCurrentMonth
            ? "hover:shadow-lg hover:shadow-gray-200/50"
            : "opacity-30"
        }
      `}
      onClick={handleClick}
      aria-current={day.isToday ? "date" : undefined}
    >
      {/* Today's Date - Bold Animated Blue Ring */}
      {day.isToday && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-500 ring-offset-2 animate-pulse">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/20" />
        </div>
      )}

      {/* Event Day - Image Circle with Date Overlay */}
      {hasEvents && eventImage ? (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-md ring-1 ring-gray-200/50">
          {/* Event Image Background */}
          <div className="relative w-full h-full">
            <img
              src={eventImage}
              alt={`Event on ${day.dayNumber}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                // Fallback to gradient background if image fails
                const parent = target.parentElement;
                if (parent) {
                  parent.className =
                    "relative w-full h-full bg-gradient-to-br from-purple-400 to-pink-500";
                }
              }}
            />

            {/* Date Number Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 min-w-[32px] text-center">
                <span className="text-white font-semibold text-sm">
                  {day.dayNumber}
                </span>
              </div>
            </div>

            {/* Multiple Events Indicator */}
            {dayEvents.length > 1 && (
              <div className="absolute top-1 right-1">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 min-w-[20px] text-center shadow-sm">
                  <span className="text-xs font-bold text-gray-700">
                    {dayEvents.length > 9 ? "9+" : dayEvents.length}
                  </span>
                </div>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
        </div>
      ) : (
        /* Regular Day - Simple Background */
        <div
          className={`
          w-full h-full rounded-2xl p-1
          ${
            day.isToday
              ? "bg-gradient-to-br from-blue-50 to-blue-100"
              : "bg-white hover:bg-gray-50"
          }
        `}
        >
          <div className="w-full h-full rounded-xl relative flex items-center justify-center">
            {/* Date Number */}
            <span
              className={`
              text-lg font-bold transition-all duration-200
              ${
                day.isToday
                  ? "text-blue-900"
                  : day.isCurrentMonth
                    ? "text-gray-900"
                    : "text-gray-400"
              }
            `}
            >
              {day.dayNumber}
            </span>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 rounded-xl" />
          </div>
        </div>
      )}

      {/* Glow effect for today's date */}
      {day.isToday && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/30 to-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
      )}
    </div>
  );
}
