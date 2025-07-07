"use client";

import { CalendarDay as CalendarDayType } from "@/lib/utils/date";
import { CalendarEvent } from "@/types/calendar";
import { useState } from "react";
import Image from "next/image";
import EventCreateModal from "@/components/EventCreateModal";
import { useAuth } from "@/lib/authHelpers";

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
  const [showTooltip, setShowTooltip] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();
  
  const dayEvents = events
    ? events.filter((e) => e.date === day.date.toISOString().split("T")[0])
    : [];

  const handleDayClick = (e: React.MouseEvent) => {
    // Only handle day click if not clicking on the "+" button
    if (!(e.target as HTMLElement).closest('.add-event-button')) {
      onDayClick(day.date, dayEvents);
    }
  };

  const handleAddEventClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent day click from firing
    setIsCreateModalOpen(true);
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
    <>
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
        onClick={handleDayClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
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
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200/50 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
            {/* Event Image Background */}
            <div className="relative w-full h-full">
              <Image
                src={eventImage}
                alt={`Event on ${day.dayNumber}`}
                width={200}
                height={200}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-75"
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

              {/* Hover Text Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end p-2 opacity-0 group-hover:opacity-100">
                <div className="text-white text-xs font-medium">
                  <div className="font-semibold truncate">{dayEvents[0].title}</div>
                  <div className="text-white/80 text-xs">My Calendar</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Regular Day - Simple Background */
          <div
            className={`
            w-full h-full rounded-2xl p-1 relative
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

            {/* Add Event Button - Shows on hover for current month */}
            {day.isCurrentMonth && user && (
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100">
                <button
                  onClick={handleAddEventClick}
                  className="add-event-button w-6 h-6 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                  title="Add event"
                >
                  <span className="text-white text-xs font-bold">+</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Glow effect for today's date */}
        {day.isToday && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/30 to-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
        )}

        {/* Event Tooltip */}
        {showTooltip && hasEvents && dayEvents.length > 0 && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs">
              <div className="font-semibold mb-1">
                {dayEvents[0].title}
              </div>
              {dayEvents[0].description && (
                <div className="text-gray-300 text-xs">
                  {dayEvents[0].description.slice(0, 50)}
                  {dayEvents[0].description.length > 50 && "..."}
                </div>
              )}
              <div className="text-purple-300 text-xs mt-1">
                My Calendar
              </div>
              {dayEvents.length > 1 && (
                <div className="text-purple-300 text-xs mt-1">
                  +{dayEvents.length - 1} more events
                </div>
              )}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>

      {/* Event Create Modal */}
      {user && (
        <EventCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          selectedDate={day.date}
          userId={user.id}
        />
      )}
    </>
  );
}
