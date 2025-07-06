"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarEvent } from "@/types/calendar";
import { getMonthsAroundDate, getCurrentMonth } from "@/lib/utils/date";
import CalendarMonth from "./CalendarMonth";
import CalendarControls from "./CalendarControls";
import EventModal from "@/components/modals/EventModal";
import EventCreateButton from "@/components/EventCreateButton";
import { supabase } from "@/lib/supabaseClient";
import { getUserDefaultCalendar, UserCalendar } from "@/lib/getUserDefaultCalendar";

interface CalendarProps {
  userId: string;
  events?: CalendarEvent[];
  onEventClick?: (date: Date, events: CalendarEvent[]) => void;
}

export default function Calendar({
  userId,
  events: propEvents,
  onEventClick,
}: CalendarProps) {
  const [currentViewMonth, setCurrentViewMonth] = useState(getCurrentMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>(propEvents || []);
  const [selectedCalendar, setSelectedCalendar] = useState("my-calendar");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [userCalendar, setUserCalendar] = useState<UserCalendar | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll: for now, just show current + 11 future months, but logic is ready for extension
  const months = getMonthsAroundDate(currentViewMonth, 11);

  const handleDayClick = (date: Date, events: CalendarEvent[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
    if (events.length > 0) {
      console.log("Events for", date.toDateString(), ":", events);
    }
    onEventClick?.(date, events);
  };

  const navigateToToday = () => {
    setCurrentViewMonth(getCurrentMonth());
  };

  const handleShareSuccess = () => {
    // Refresh calendar data to show updated public status
    if (userId) {
      getUserDefaultCalendar(userId).then(setUserCalendar).catch(console.error);
    }
  };

  // Fetch user's default calendar
  useEffect(() => {
    const fetchUserCalendar = async () => {
      try {
        const calendar = await getUserDefaultCalendar(userId);
        setUserCalendar(calendar);
      } catch (error) {
        console.error("Error fetching user calendar:", error);
      }
    };

    if (userId) {
      fetchUserCalendar();
    }
  }, [userId]);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      if (!userCalendar) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("calendar_id", userCalendar.id);

      if (error) {
        console.error("Error fetching events:", error);
        return;
      }

      // Transform Supabase data to CalendarEvent format
      const transformedEvents: CalendarEvent[] =
        data?.map((event: Record<string, unknown>) => ({
          id: String(event.id),
          title: String(event.title),
          description: String(event.description || ""),
          imageUrl: event.location ? String(event.location) : "", // Using location field for image URL
          date: new Date(String(event.start_time)).toISOString().split("T")[0], // Convert timestamp to date string
          color: event.color ? String(event.color) : undefined,
        })) || [];

      setEvents(transformedEvents);
    };

    if (userCalendar) {
      fetchEvents();
    }
  }, [userCalendar]);

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
      <CalendarControls
        currentViewMonth={currentViewMonth}
        onMonthChange={setCurrentViewMonth}
        onYearChange={setCurrentViewMonth}
        onTodayClick={navigateToToday}
        eventCount={events.length}
        selectedCalendar={selectedCalendar}
        onCalendarChange={setSelectedCalendar}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        calendarId={userCalendar?.id}
        isPublic={userCalendar?.is_public}
        onShareSuccess={handleShareSuccess}
      />

      {/* Calendar Container */}
      <div ref={containerRef} className="space-y-8">
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

      {/* Floating Create Event Button */}
      <EventCreateButton selectedDate={selectedDate || undefined} />
    </div>
  );
}
