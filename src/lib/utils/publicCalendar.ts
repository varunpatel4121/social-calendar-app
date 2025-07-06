import { supabase } from '../supabaseClient';
import { Calendar, CalendarEvent } from '../../types/calendar';

// Database event type (matches actual database schema)
interface DatabaseEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Transform database event to CalendarEvent
 */
function transformEvent(dbEvent: DatabaseEvent): CalendarEvent {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    date: dbEvent.start_time, // Use start_time as the date
    imageUrl: dbEvent.image_url || '',
    description: dbEvent.description,
    color: undefined // No color in database schema yet
  };
}

/**
 * Fetch a public calendar by slug or public_id
 * Modular, robust, and type-safe. Returns null if not found or on error.
 */
export async function getPublicCalendar(slugOrId: string): Promise<Calendar | null> {
  try {
    // First try to find by slug
    const { data: calendar, error } = await supabase
      .from('calendars')
      .select(`
        id,
        title,
        description,
        owner_id,
        is_default,
        is_public,
        public_id,
        slug,
        created_at,
        updated_at
      `)
      .eq('slug', slugOrId)
      .eq('is_public', true)
      .not('slug', 'is', null) // Ensure slug is not null
      .single();

    let calendarData = calendar;
    const calendarError = error;

    if (calendarError) {
      if (calendarError.code === 'PGRST116') {
        // Not found by slug, try by public_id
        console.log('Calendar not found by slug, trying public_id:', slugOrId);
        
        const { data: calendarById, error: idError } = await supabase
          .from('calendars')
          .select(`
            id,
            title,
            description,
            owner_id,
            is_default,
            is_public,
            public_id,
            slug,
            created_at,
            updated_at
          `)
          .eq('public_id', slugOrId)
          .eq('is_public', true)
          .single();

        if (idError) {
          if (idError.code === 'PGRST116') {
            console.log('Calendar not found by public_id either:', slugOrId);
            return null;
          }
          throw idError;
        }

        calendarData = calendarById;
      } else {
        throw calendarError;
      }
    }

    if (!calendarData) {
      return null;
    }

    // Fetch events for this calendar
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        location,
        image_url,
        created_at,
        updated_at
      `)
      .eq('calendar_id', calendarData.id)
      .order('start_time', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      // Return calendar without events rather than failing completely
      return {
        ...calendarData,
        events: []
      } as Calendar;
    }

    // Transform database events to CalendarEvent format
    const transformedEvents: CalendarEvent[] = (events || []).map(transformEvent);

    return {
      ...calendarData,
      events: transformedEvents
    } as Calendar;
  } catch (error) {
    console.error('Error fetching public calendar:', error);
    return null;
  }
}

/**
 * Get shareable link for a calendar
 * Modular, robust, and uses environment variable fallback.
 */
export function getShareableLink(calendar: Calendar): string {
  if (!calendar.is_public) {
    return '';
  }

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Prefer slug if available, fall back to public_id
  const identifier = calendar.slug || calendar.public_id;
  return `${baseUrl}/calendar/public/${identifier}`;
} 