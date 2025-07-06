import { supabase, supabaseAdmin } from './supabaseClient'
import { PublicEvent } from '@/types/calendar'

export interface PublicCalendar {
  id: string
  title: string
  description?: string
  is_public: boolean
  public_id: string
  slug?: string
  created_at: string
  owner_name: string
  events: PublicEvent[]
}

export async function fetchPublicCalendar(slugOrId: string): Promise<PublicCalendar> {
  if (!slugOrId) {
    throw new Error('Slug or ID is required')
  }

  console.log('🔍 Fetching public calendar with slugOrId:', slugOrId)

  let calendar = null

  // First, try to fetch by slug (only if it looks like a slug, not a UUID)
  const isLikelySlug = /^[a-z0-9-]+$/.test(slugOrId) && !slugOrId.includes('-') || slugOrId.length < 36;
  
  if (isLikelySlug) {
    try {
      const { data: slugCalendar, error: slugError } = await supabase
        .from('calendars')
        .select('*')
        .eq('slug', slugOrId)
        .eq('is_public', true)
        .single()

      if (slugCalendar) {
        calendar = slugCalendar
        console.log('✅ Calendar found by slug:', { id: calendar.id, title: calendar.title, slug: calendar.slug })
      } else if (slugError && slugError.code !== 'PGRST116') {
        if (slugError.code === '406') {
          console.log('📝 Slug column not found, trying public_id...')
        } else {
          console.error('❌ Error fetching by slug:', slugError)
          throw new Error(`Failed to fetch calendar: ${slugError.message}`)
        }
      }
    } catch {
      console.log('📝 Error with slug lookup, trying public_id...')
    }
  }

  // If no calendar found by slug, try by public_id
  if (!calendar) {
    console.log('📝 No calendar found by slug, trying public_id...')
    
    const { data: idCalendar, error: idError } = await supabase
      .from('calendars')
      .select('*')
      .eq('public_id', slugOrId)
      .eq('is_public', true)
      .single()

    if (idCalendar) {
      calendar = idCalendar
      console.log('✅ Calendar found by public_id:', { id: calendar.id, title: calendar.title, public_id: calendar.public_id })
    } else if (idError && idError.code !== 'PGRST116') {
      // Real error occurred
      console.error('❌ Error fetching by public_id:', idError)
      throw new Error(`Failed to fetch calendar: ${idError.message}`)
    }
  }

  if (!calendar) {
    console.log('❌ No calendar found with slug or public_id:', slugOrId)
    throw new Error('Calendar not found or is private')
  }

  console.log('✅ Calendar found:', { 
    id: calendar.id, 
    title: calendar.title, 
    is_public: calendar.is_public,
    slug: calendar.slug,
    public_id: calendar.public_id 
  })

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
    slug: calendar.slug,
    created_at: calendar.created_at,
    owner_name: ownerName,
    events: events || []
  }

  console.log('🎉 Final result:', { 
    id: result.id, 
    title: result.title, 
    eventsCount: result.events.length,
    owner_name: result.owner_name,
    slug: result.slug
  })

  return result
} 