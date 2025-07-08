"use client";

import { useState, useEffect, useRef, useCallback, useLayoutEffect, forwardRef, useImperativeHandle } from "react";
import { CalendarEvent } from "@/types/calendar";
import { 
  getCurrentMonth, 
  getMonthEventCount
} from "@/lib/utils/date";
import { subMonths, addMonths } from "date-fns";
import CalendarMonth from "./CalendarMonth";
import EventModal from "@/components/modals/EventModal";
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

export interface CalendarRef {
  scrollToMonth: (targetMonth: Date) => void;
}

const Calendar = forwardRef<CalendarRef, CalendarProps>(({
  userId,
  events: propEvents,
  onEventClick,
  currentViewMonth: propCurrentViewMonth,
  onMonthEventCountChange,
}, ref) => {
  const currentViewMonth = propCurrentViewMonth || getCurrentMonth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>(propEvents || []);
  const [userCalendar, setUserCalendar] = useState<UserCalendar | null>(null);
  const [visibleMonths, setVisibleMonths] = useState<Date[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Generate 13 months: 6 past + current + 6 future
  const generateMonthRange = useCallback((centerMonth: Date): Date[] => {
    const months: Date[] = [];
    
    // Add 6 months in the past
    for (let i = 6; i >= 1; i--) {
      months.push(subMonths(centerMonth, i));
    }
    
    // Add current month
    months.push(centerMonth);
    
    // Add 6 months in the future
    for (let i = 1; i <= 6; i++) {
      months.push(addMonths(centerMonth, i));
    }
    
    return months;
  }, []);

  // Reusable function to scroll to a specific month
  const scrollToMonth = useCallback((targetMonth: Date) => {
    if (!containerRef.current) return;

    const monthKey = targetMonth.toISOString();
    const monthElement = monthRefs.current.get(monthKey);
    
    if (!monthElement) {
      console.warn(`Month element not found for ${monthKey}`);
      return;
    }

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container || !monthElement) return;

      // Calculate the scroll position to show the month header at the top
      const containerRect = container.getBoundingClientRect();
      const monthRect = monthElement.getBoundingClientRect();
      
      // Calculate the offset to position the month header at the top of the container
      // Add a small padding (16px) to ensure the header is fully visible
      const scrollTop = container.scrollTop + monthRect.top - containerRect.top - 16;
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    });
  }, []);

  // Expose scrollToMonth function to parent component
  useImperativeHandle(ref, () => ({
    scrollToMonth
  }), [scrollToMonth]);

  // Initialize visible months
  useEffect(() => {
    const monthRange = generateMonthRange(currentViewMonth);
    setVisibleMonths(monthRange);
  }, [currentViewMonth, generateMonthRange]);

  // Scroll to current month when currentViewMonth changes (e.g., Today button clicked)
  useLayoutEffect(() => {
    if (!isInitialLoad) {
      scrollToMonth(currentViewMonth);
    }
  }, [currentViewMonth, scrollToMonth, isInitialLoad]);

  // Initial scroll to current month on mount
  useLayoutEffect(() => {
    if (visibleMonths.length > 0 && isInitialLoad) {
      // Use a longer delay for initial load to ensure everything is rendered
      const timer = setTimeout(() => {
        scrollToMonth(currentViewMonth);
        setIsInitialLoad(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [visibleMonths, currentViewMonth, scrollToMonth, isInitialLoad]);

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
          imageUrl: event.image_url ? String(event.image_url) : "",
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
    const count = getMonthEventCount(events, currentViewMonth);
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

  // Function to set month ref
  const setMonthRef = useCallback((monthDate: Date, element: HTMLDivElement | null) => {
    if (element) {
      monthRefs.current.set(monthDate.toISOString(), element);
    } else {
      monthRefs.current.delete(monthDate.toISOString());
    }
  }, []);

  return (
    <div className="w-full">
      {/* Calendar Container */}
      <div 
        ref={containerRef} 
        className="space-y-6 relative max-h-[80vh] overflow-y-auto scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}
      >
        {/* Subtle background gradient for feed feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-blue-50/20 rounded-2xl -z-10" />
        
        {/* Calendar Grid with enhanced spacing */}
        <div className="relative space-y-6">
          {visibleMonths.map((month, index) => {
            const monthEventCount = getMonthEventCount(events, month);
            
            return (
              <div 
                key={month.toISOString()} 
                className="relative animate-fadein"
                ref={(element) => setMonthRef(month, element)}
              >
                {/* Subtle divider between months (except first) */}
                {index > 0 && (
                  <div className="w-full flex items-center mb-2">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                  </div>
                )}
                
                {/* Month Header - Timeline style */}
                <div className="flex items-center mb-6 mt-4">
                  <div className="flex-shrink-0 rounded-full bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 px-6 py-3 shadow text-white text-2xl font-bold tracking-wide">
                    {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  {monthEventCount > 0 && (
                    <span className="ml-6 text-base text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                      {monthEventCount} event{monthEventCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <CalendarMonth
                  date={month}
                  onDayClick={handleDayClick}
                  events={events}
                />
              </div>
            );
          })}
        </div>
        
        {/* Empty state when no events */}
        {visibleMonths.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No events found</div>
            <div className="text-gray-400 text-sm mt-2">Create your first event to get started</div>
          </div>
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        events={selectedEvents}
      />
    </div>
  );
});

Calendar.displayName = 'Calendar';

export default Calendar;

/*
// TEST BLOCK: Uncomment to test month range logic
const mockEvents = [
  { id: '1', title: 'A', date: '2024-04-15', imageUrl: '' },
  { id: '2', title: 'B', date: '2024-06-01', imageUrl: '' },
  { id: '3', title: 'C', date: '2024-08-20', imageUrl: '' },
];
console.log(getAllMonthsInRange(mockEvents));
*/
