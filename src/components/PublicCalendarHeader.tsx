"use client";

import { useState } from "react";
import Image from "next/image";
import { format, addMonths, subMonths } from "date-fns";
import { getCurrentMonth, isPastMonth } from "@/lib/utils/date";

interface PublicCalendarHeaderProps {
  calendarTitle: string;
  ownerName: string;
  eventCount: number;
  currentViewMonth: Date;
  onMonthChange: (date: Date) => void;
  onYearChange: (date: Date) => void;
  onTodayClick: () => void;
}

export default function PublicCalendarHeader({
  calendarTitle,
  ownerName,
  eventCount,
  currentViewMonth,
  onMonthChange,
  onYearChange,
  onTodayClick,
}: PublicCalendarHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getEventCountText = () => {
    return eventCount === 1 ? "1 event" : `${eventCount} events`;
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

  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg sticky top-0 z-50 relative">
      {/* Debrief Brand Centerpiece - Floating over both header bars */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-dancing-script font-semibold tracking-wider drop-shadow-[0_0_30px_rgba(255,165,0,0.6)] bg-gradient-to-r from-orange-300 via-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent transform -translate-y-2">
          Debrief
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Single Row - Compact Layout */}
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Calendar Info */}
          <div className="flex items-center space-x-8">
            {/* Debrief Logo - Twice as large */}
            <div className="flex-shrink-0">
              <Image
                src="/logo.svg"
                alt="Debrief Logo"
                width={240}
                height={64}
                className="h-16 w-auto"
                priority
              />
            </div>

            {/* Calendar Info - Only show on larger screens */}
            <div className="hidden md:flex flex-col">
              <h3 className="text-lg font-bold text-white leading-tight">{calendarTitle}</h3>
              <p className="text-sm text-purple-100 leading-tight">by {ownerName}</p>
            </div>
          </div>

          {/* Right Section - Navigation Controls */}
          <div className="flex items-center space-x-3">
            {/* Public Badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Public Calendar
            </span>

            {/* Current Month/Year Display */}
            <div className="hidden sm:flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">
                {format(currentViewMonth, "MMMM yyyy")}
              </h2>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            {/* Calendar Info for Mobile */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">{calendarTitle}</h3>
              <p className="text-sm text-purple-100">by {ownerName}</p>
            </div>

            {/* Navigation Controls for Mobile */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">
                {format(currentViewMonth, "MMMM yyyy")}
              </h2>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => navigateToYear("prev")}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous year"
                  disabled={isPastMonth(subMonths(currentViewMonth, 12))}
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateToMonth("prev")}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous month"
                  disabled={isPastMonth(subMonths(currentViewMonth, 1))}
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateToMonth("next")}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Next month"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={onTodayClick}
                  className="px-3 py-1.5 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Event Count for Mobile */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-purple-100">{getEventCountText()} this month</span>
            </div>
          </div>
        )}

        {/* Desktop Navigation Controls - Below header */}
        <div className="hidden md:flex items-center justify-between py-3">
          {/* Left - Event Count and Status */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-purple-100">{getEventCountText()} this month</span>
            <span className="text-purple-200">•</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              Public
            </span>
          </div>

          {/* Right - Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateToYear("prev")}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous year"
              disabled={isPastMonth(subMonths(currentViewMonth, 12))}
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigateToMonth("prev")}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous month"
              disabled={isPastMonth(subMonths(currentViewMonth, 1))}
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onTodayClick}
              className="px-3 py-1.5 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
            >
              Today
            </button>
            <button
              onClick={() => navigateToMonth("next")}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Next month"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => navigateToYear("next")}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Next year"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 