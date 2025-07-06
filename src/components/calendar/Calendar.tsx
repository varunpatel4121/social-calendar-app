"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarEvent } from "@/types/calendar";
import { getMonthsAroundDate, getCurrentMonth } from "@/lib/utils/date";
import CalendarMonth from "./CalendarMonth";
import EventModal from "@/components/modals/EventModal";
import EventCreateButton from "@/components/EventCreateButton";
import { supabase } from "@/lib/supabaseClient";
import { getUserDefaultCalendar, UserCalendar } from "@/lib/getUserDefaultCalendar";

interface CalendarProps {
  userId: string;
  events?: CalendarEvent[];
  onEventClick?: (date: Date, events: CalendarEvent[]) => void;
  personalizedLabel?: string;
  currentViewMonth?: Date;
  selectedCalendar?: string;
  selectedFilter?: string;
  onMonthEventCountChange?: (count: number) => void;
}

export default function Calendar({
  userId,
  events: propEvents,
  onEventClick,
  currentViewMonth: propCurrentViewMonth,
  onMonthEventCountChange,
}: CalendarProps) {
  const currentViewMonth = propCurrentViewMonth || getCurrentMonth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>(propEvents || []);

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

  // Update event count for current month
  useEffect(() => {
    if (!onMonthEventCountChange) return;
    const monthStr = currentViewMonth.toISOString().slice(0, 7); // 'YYYY-MM'
    const count = events.filter(e => e.date.startsWith(monthStr)).length;
    onMonthEventCountChange(count);
  }, [events, currentViewMonth, onMonthEventCountChange]);

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
      {/* Calendar Container */}
      <div ref={containerRef} className="space-y-8 relative">
        {/* Subtle background gradient for feed feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-blue-50/20 rounded-2xl -z-10" />
        
        {/* Calendar Grid with enhanced spacing */}
        <div className="relative space-y-16">
          {months.map((month, index) => (
            <div key={month.toISOString()} className="relative">
              {/* Subtle divider between months (except first) */}
              {index > 0 && (
                <div className="absolute -top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              )}
              
              <CalendarMonth
                date={month}
                onDayClick={handleDayClick}
                events={events}
              />
            </div>
          ))}
        </div>
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
