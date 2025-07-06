import { supabase, supabaseAdmin } from './supabaseClient'

export interface PublicCalendar {
  id: string
  title: string
  description?: string
  is_public: boolean
  public_id: string
  created_at: string
  owner_name: string
  events: PublicEvent[]
}

export interface PublicEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  location?: string
  color?: string
  created_at: string
}

export async function fetchPublicCalendar(publicId: string): Promise<PublicCalendar> {
  if (!publicId) {
    throw new Error('Public ID is required')
  }

  console.log('🔍 Fetching public calendar with ID:', publicId)

  // Fetch the calendar without owner relationship for now
  const { data: calendar, error: calendarError } = await supabase
    .from('calendars')
    .select('*')
    .eq('public_id', publicId)
    .eq('is_public', true)
    .single()

  console.log('📅 Calendar query result:', { calendar, calendarError })

  if (calendarError) {
    console.error('❌ Calendar fetch error:', calendarError)
    throw new Error(`Calendar not found or is private: ${calendarError.message}`)
  }

  if (!calendar) {
    console.log('❌ No calendar found with public_id:', publicId)
    throw new Error('Calendar not found or is private')
  }

  console.log('✅ Calendar found:', { id: calendar.id, title: calendar.title, is_public: calendar.is_public })

  // Fetch events for this calendar
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('calendar_id', calendar.id)
    .order('start_time', { ascending: true })

  console.log('📋 Events query result:', { eventsCount: events?.length || 0, eventsError })

  if (eventsError) {
    console.error('❌ Error fetching events:', eventsError)
    throw new Error('Failed to fetch calendar events')
  }

  // Fetch the owner's name directly using admin client
  let ownerName = 'Anonymous'
  
  if (calendar.owner_id && supabaseAdmin) {
    try {
      const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(calendar.owner_id)
      
      if (!error && userData?.user) {
        const user = userData.user
        const metadata = user.user_metadata || {}
        
        // Extract name from user metadata or email
        ownerName = metadata.name || 
                   metadata.first_name || 
                   user.email?.split('@')[0] || 
                   'Anonymous'
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch user profile:', error)
    }
  }

  console.log('👤 Owner name extracted:', ownerName)

  const result = {
    id: calendar.id,
    title: calendar.title || 'Untitled Calendar',
    description: calendar.description,
    is_public: calendar.is_public,
    public_id: calendar.public_id,
    created_at: calendar.created_at,
    owner_name: ownerName,
    events: events || []
  }

  console.log('🎉 Final result:', { 
    id: result.id, 
    title: result.title, 
    eventsCount: result.events.length,
    owner_name: result.owner_name 
  })

  return result
} 