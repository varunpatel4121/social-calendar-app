"use client";
import { useAuth } from "@/lib/authHelpers";
import SignInButton from "@/components/auth/SignInButton";
import Header from "@/components/Header";
import Calendar from "@/components/calendar/Calendar";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { getCurrentMonth } from "@/lib/utils/date";

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentViewMonth, setCurrentViewMonth] = useState(getCurrentMonth());
  const [selectedCalendar, setSelectedCalendar] = useState("my-calendar");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [eventCount, setEventCount] = useState(0);

  const getPersonalizedLabel = (user: User | null) => {
    if (!user) return "Feed";

    const firstName =
      user.user_metadata?.first_name || user.user_metadata?.name?.split(" ")[0];
    return firstName ? `${firstName}'s Feed` : "Feed";
  };

  const navigateToToday = () => {
    setCurrentViewMonth(getCurrentMonth());
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        currentViewMonth={currentViewMonth}
        onMonthChange={setCurrentViewMonth}
        onYearChange={setCurrentViewMonth}
        onTodayClick={navigateToToday}
        selectedCalendar={selectedCalendar}
        onCalendarChange={setSelectedCalendar}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        personalizedLabel={getPersonalizedLabel(user)}
        eventCount={eventCount}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Calendar 
          userId={user.id} 
          personalizedLabel={getPersonalizedLabel(user)}
          currentViewMonth={currentViewMonth}
          selectedCalendar={selectedCalendar}
          selectedFilter={selectedFilter}
          onMonthEventCountChange={setEventCount}
        />
      </div>
    </div>
  );
}
