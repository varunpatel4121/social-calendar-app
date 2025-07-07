"use client";
import { useAuth } from "@/lib/authHelpers";
import SignInButton from "@/components/auth/SignInButton";
import Header from "@/components/Header";
import Calendar, { CalendarRef } from "@/components/calendar/Calendar";
import CalendarSettingsModal from "@/components/modals/CalendarSettingsModal";
import EventCreateButton from "@/components/EventCreateButton";
import { User } from "@supabase/supabase-js";
import { useState, useEffect, useRef } from "react";
import { getCurrentMonth } from "@/lib/utils/date";
import { getUserDefaultCalendar } from "@/lib/getUserDefaultCalendar";
import { Calendar as CalendarType } from "@/types/calendar";

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentViewMonth, setCurrentViewMonth] = useState(getCurrentMonth());
  const [selectedCalendar, setSelectedCalendar] = useState("my-calendar");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [eventCount, setEventCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userCalendar, setUserCalendar] = useState<CalendarType | null>(null);
  
  const calendarRef = useRef<CalendarRef>(null);

  // Fetch user's default calendar
  useEffect(() => {
    const fetchUserCalendar = async () => {
      if (!user) return;
      
      try {
        const calendar = await getUserDefaultCalendar(user.id);
        setUserCalendar(calendar);
      } catch (error) {
        console.error('Error fetching user calendar:', error);
      }
    };

    fetchUserCalendar();
  }, [user]);

  const getPersonalizedLabel = (user: User | null) => {
    if (!user) return "Feed";

    const firstName =
      user.user_metadata?.first_name || user.user_metadata?.name?.split(" ")[0];
    return firstName ? `${firstName}'s Feed` : "Feed";
  };

  const navigateToToday = () => {
    const today = getCurrentMonth();
    setCurrentViewMonth(today);
    
    // Use requestAnimationFrame to ensure state update has propagated
    requestAnimationFrame(() => {
      if (calendarRef.current) {
        calendarRef.current.scrollToMonth(today);
      }
    });
  };

  const handleCalendarUpdate = () => {
    // Refresh calendar data
    if (user) {
      getUserDefaultCalendar(user.id).then(setUserCalendar);
    }
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
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Calendar 
          ref={calendarRef}
          userId={user.id} 
          personalizedLabel={getPersonalizedLabel(user)}
          currentViewMonth={currentViewMonth}
          selectedCalendar={selectedCalendar}
          selectedFilter={selectedFilter}
          onMonthEventCountChange={setEventCount}
        />
      </div>

      {/* Floating Create Event Button */}
      <EventCreateButton />

      {/* Calendar Settings Modal */}
      <CalendarSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        calendar={userCalendar}
        userId={user.id}
        onUpdate={handleCalendarUpdate}
      />
    </div>
  );
}
