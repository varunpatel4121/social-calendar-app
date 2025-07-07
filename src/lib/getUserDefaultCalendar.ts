import { supabase } from './supabaseClient'
import { generateSlugFromName } from './utils/slug'
import { Calendar } from '@/types/calendar'

export type UserCalendar = Calendar;

export async function getUserDefaultCalendar(userId: string): Promise<UserCalendar> {
  if (!userId) {
    throw new Error('User ID is required')
  }

  // First, try to find ALL existing default calendars for this user
  const { data: existingCalendars, error: fetchError } = await supabase
    .from('calendars')
    .select('*')
    .eq('owner_id', userId)
    .eq('is_default', true)
    .order('created_at', { ascending: true })

  // If there is a real error, throw
  if (fetchError) {
    console.error('Error fetching default calendars:', fetchError)
    throw new Error('Failed to fetch default calendars')
  }

  // If we have existing default calendars, return the oldest one
  if (existingCalendars && existingCalendars.length > 0) {
    if (existingCalendars.length > 1) {
      console.warn(`Found ${existingCalendars.length} default calendars for user ${userId}, returning oldest`)
    }
    return existingCalendars[0] // Already sorted by created_at ascending
  }

  // Get user info to generate slug
  let userName = 'user'
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) {
      const metadata = user.user_metadata || {}
      userName = metadata.name || metadata.first_name || user.email?.split('@')[0] || 'user'
    }
  } catch (error) {
    console.warn('Could not get user info for slug generation:', error)
  }

  // Use a CONSISTENT slug for default calendars (no uniqueness check needed)
    const baseSlug = generateSlugFromName(userName, 'My Calendar')
  const defaultSlug = baseSlug || 'my-calendar'

  // Create the default calendar with a simple slug
  const { data: newCalendar, error: createError } = await supabase
    .from('calendars')
    .insert({
      title: 'My Calendar',
      description: 'Default calendar for events',
      owner_id: userId,
      is_default: true,
      is_public: false,
      public_id: crypto.randomUUID(),
      slug: defaultSlug
    })
    .select()
    .single()

  if (createError) {
    // If creation fails due to slug uniqueness constraint, try to fetch existing calendar
    if (createError.code === '23505' && createError.message.includes('slug')) {
      console.log('Calendar creation failed due to slug constraint, fetching existing calendar...')
      
      const { data: retryCalendar, error: retryError } = await supabase
        .from('calendars')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_default', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (retryCalendar) {
        return retryCalendar
      }
    }
    
    console.error('Error creating default calendar:', createError)
    throw new Error('Failed to create default calendar')
  }

  if (!newCalendar) {
    throw new Error('Failed to create default calendar')
  }

  return newCalendar
} 