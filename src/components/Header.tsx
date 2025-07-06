"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { format, addMonths, subMonths } from "date-fns";
import { getCurrentMonth, isPastMonth } from "@/lib/utils/date";
import SignOutButton from "./auth/SignOutButton";

interface HeaderProps {
  user: User | null;
  currentViewMonth?: Date;
  onMonthChange?: (date: Date) => void;
  onYearChange?: (date: Date) => void;
  onTodayClick?: () => void;
  eventCount?: number;
  selectedCalendar?: string;
  onCalendarChange?: (calendar: string) => void;
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
  isPublic?: boolean;
  personalizedLabel?: string;
}

export default function Header({ 
  user,
  currentViewMonth,
  onMonthChange,
  onYearChange,
  onTodayClick,
  eventCount = 0,
  selectedCalendar = "my-calendar",
  onCalendarChange,
  selectedFilter = "all",
  onFilterChange,
  isPublic = false,
  personalizedLabel
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getUserDisplayName = () => {
    if (!user) return "User";

    // Try to get first and last name from user metadata
    const firstName =
      user.user_metadata?.first_name || user.user_metadata?.name?.split(" ")[0];
    const lastName =
      user.user_metadata?.last_name ||
      user.user_metadata?.name?.split(" ").slice(1).join(" ");

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (user.email) {
      return user.email.split("@")[0];
    }

    return "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getEventCountText = () => {
    return eventCount === 1 ? "1 event" : `${eventCount} events`;
  };

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

  const navigateToMonth = (direction: "prev" | "next") => {
    if (!currentViewMonth || !onMonthChange) return;
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
    if (!currentViewMonth || !onYearChange) return;
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
          {/* Left Section - Logo and Personalized Content */}
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

            {/* Personalized Content - Only show on larger screens */}
            <div className="hidden md:flex flex-col">
              {personalizedLabel && (
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{personalizedLabel}</h3>
                  <p className="text-sm text-purple-100 leading-tight">Past Moments, Future Memories</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Navigation Controls */}
          <div className="flex items-center space-x-3">
            {/* Current Month/Year Display */}
            {currentViewMonth && (
              <div className="hidden sm:flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">
                  {format(currentViewMonth, "MMMM yyyy")}
                </h2>
              </div>
            )}

            {/* Calendar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 text-white hover:bg-white/30 transition-colors"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${currentCalendar.color}`} />
                <span className="text-xs font-medium">{currentCalendar.name}</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${isCalendarDropdownOpen ? "rotate-180" : ""}`}
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
                        onCalendarChange?.(calendar.id);
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

            {/* User Avatar and Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-white hover:text-purple-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 rounded-full"
              >
                <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <span className="text-xs font-semibold text-white">
                    {getUserInitials()}
                  </span>
                </div>
                <span className="hidden lg:block text-xs font-medium">
                  {getUserDisplayName()}
                </span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
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

              {/* Dropdown Menu */}
              {(isDropdownOpen || isCalendarDropdownOpen) && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsCalendarDropdownOpen(false);
                  }}
                />
              )}

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <SignOutButton className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200" />
                  </div>
                </div>
              )}
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
            {/* Personalized Content for Mobile */}
            {personalizedLabel && (
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{personalizedLabel}</h3>
                <p className="text-sm text-purple-100">Past Moments, Future Memories</p>
              </div>
            )}

            {/* Navigation Controls for Mobile */}
            {currentViewMonth && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">
                  {format(currentViewMonth, "MMMM yyyy")}
                </h2>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => navigateToYear("prev")}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous year"
                    disabled={currentViewMonth && isPastMonth(subMonths(currentViewMonth, 12))}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateToMonth("prev")}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous month"
                    disabled={currentViewMonth && isPastMonth(subMonths(currentViewMonth, 1))}
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
            )}

            {/* Filter Pills for Mobile */}
            <div className="flex items-center space-x-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => onFilterChange?.(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    selectedFilter === filter.id
                      ? "bg-white text-purple-600 border-white shadow-sm"
                      : "bg-transparent text-white border-white/30 hover:bg-white/20 hover:scale-105"
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Navigation Controls - Below header */}
        <div className="hidden md:flex items-center justify-between py-3">
          {/* Left - Event Count and Status */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-purple-100">{getEventCountText()} this month</span>
            {isPublic && (
              <>
                <span className="text-purple-200">•</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                  Public
                </span>
              </>
            )}
          </div>

          {/* Right - Navigation Controls */}
          <div className="flex items-center space-x-2">
            {currentViewMonth && (
              <>
                {/* Navigation Controls */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => navigateToYear("prev")}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous year"
                    disabled={currentViewMonth && isPastMonth(subMonths(currentViewMonth, 12))}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateToMonth("prev")}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous month"
                    disabled={currentViewMonth && isPastMonth(subMonths(currentViewMonth, 1))}
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

                {/* Filter Pills */}
                <div className="flex items-center space-x-1 ml-4">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => onFilterChange?.(filter.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                        selectedFilter === filter.id
                          ? "bg-white text-purple-600 border-white shadow-sm"
                          : "bg-transparent text-white border-white/30 hover:bg-white/20 hover:scale-105"
                      }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
