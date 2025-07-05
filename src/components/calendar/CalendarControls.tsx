"use client";

import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { getCurrentMonth, isPastMonth } from "@/lib/utils/date";

interface CalendarControlsProps {
  currentViewMonth: Date;
  onMonthChange: (date: Date) => void;
  onYearChange: (date: Date) => void;
  onTodayClick: () => void;
  eventCount: number;
  selectedCalendar: string;
  onCalendarChange: (calendar: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function CalendarControls({
  currentViewMonth,
  onMonthChange,
  onYearChange,
  onTodayClick,
  eventCount,
  selectedCalendar,
  onCalendarChange,
  selectedFilter,
  onFilterChange,
}: CalendarControlsProps) {
  const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(
    format(currentViewMonth, "yyyy-MM"),
  );

  const calendars = [
    { id: "my-calendar", name: "My Calendar", color: "bg-purple-500" },
    { id: "work", name: "Work", color: "bg-blue-500" },
    { id: "personal", name: "Personal", color: "bg-green-500" },
  ];

  const filters = [
    { id: "all", name: "All Events" },
    { id: "mine", name: "Mine" },
    { id: "shared", name: "Shared With Me" },
  ];

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDatePickerValue(value);
    if (value) {
      const [year, month] = value.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, 1);
      const currentMonth = getCurrentMonth();
      if (isPastMonth(selectedDate)) {
        onMonthChange(currentMonth);
        setDatePickerValue(format(currentMonth, "yyyy-MM"));
      } else {
        onMonthChange(selectedDate);
      }
    }
  };

  const navigateToMonth = (direction: "prev" | "next") => {
    const newDate =
      direction === "next"
        ? addMonths(currentViewMonth, 1)
        : subMonths(currentViewMonth, 1);
    const currentMonth = getCurrentMonth();
    if (direction === "prev" && isPastMonth(newDate)) {
      onMonthChange(currentMonth);
    } else {
      onMonthChange(newDate);
    }
  };

  const navigateToYear = (direction: "prev" | "next") => {
    const newDate =
      direction === "next"
        ? addMonths(currentViewMonth, 12)
        : subMonths(currentViewMonth, 12);
    const currentMonth = getCurrentMonth();
    if (direction === "prev" && isPastMonth(newDate)) {
      onYearChange(currentMonth);
    } else {
      onYearChange(newDate);
    }
  };

  const currentCalendar =
    calendars.find((cal) => cal.id === selectedCalendar) || calendars[0];

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-lg p-6 mb-6">
      {/* Top Row - Month/Year and Calendar Dropdown */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">
            {format(currentViewMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-purple-200">•</span>
            <span className="text-purple-100 text-sm">{eventCount} events</span>
          </div>
        </div>

        {/* Calendar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)}
            className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white hover:bg-white/30 transition-colors"
          >
            <div className={`w-3 h-3 rounded-full ${currentCalendar.color}`} />
            <span className="text-sm font-medium">{currentCalendar.name}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isCalendarDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isCalendarDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
              {calendars.map((calendar) => (
                <button
                  key={calendar.id}
                  onClick={() => {
                    onCalendarChange(calendar.id);
                    setIsCalendarDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${calendar.color}`} />
                  <span>{calendar.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center space-x-2 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === filter.id
                ? "bg-white text-purple-600 shadow-sm"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* Bottom Row - Navigation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Year Navigation */}
          <button
            onClick={() => navigateToYear("prev")}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous year"
            disabled={isPastMonth(subMonths(currentViewMonth, 12))}
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Month Navigation */}
          <button
            onClick={() => navigateToMonth("prev")}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous month"
            disabled={isPastMonth(subMonths(currentViewMonth, 1))}
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() => navigateToMonth("next")}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Next month"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Today Button */}
          <button
            onClick={onTodayClick}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Today
          </button>
        </div>

        {/* Date Picker */}
        <div className="flex items-center space-x-2">
          <input
            type="month"
            value={datePickerValue}
            onChange={handleDatePickerChange}
            min={format(getCurrentMonth(), "yyyy-MM")}
            max="2030-12"
            className="px-3 py-2 bg-white/90 backdrop-blur-sm border-0 rounded-lg focus:ring-2 focus:ring-white/50 focus:bg-white text-sm"
            placeholder="Select month"
            title="Select a month (current month or later)"
          />
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isCalendarDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsCalendarDropdownOpen(false)}
        />
      )}
    </div>
  );
}
