import { supabase } from './supabaseClient'
import { generateSlugFromName } from './utils/slug'
import { Calendar } from '@/types/calendar'

export type UserCalendar = Calendar;

// Global cache to prevent multiple simultaneous calls for the same user
const calendarCreationCache = new Map<string, Promise<UserCalendar>>();

export async function getUserDefaultCalendar(userId: string): Promise<UserCalendar> {
  if (!userId) {
    throw new Error('User ID is required')
  }

  // Check if we're already creating a calendar for this user
  if (calendarCreationCache.has(userId)) {
    console.log(`Calendar creation already in progress for user ${userId}, waiting...`)
    return await calendarCreationCache.get(userId)!
  }

  // Create a promise for this calendar creation
  const calendarPromise = createDefaultCalendar(userId)
  calendarCreationCache.set(userId, calendarPromise)

  try {
    const result = await calendarPromise
    return result
  } finally {
    // Clean up the cache after completion
    calendarCreationCache.delete(userId)
  }
}

async function createDefaultCalendar(userId: string): Promise<UserCalendar> {
  console.log(`Creating default calendar for user ${userId}`)

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
      // TODO: Clean up duplicate calendars in the future
    }
    console.log(`Returning existing default calendar for user ${userId}`)
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

  console.log(`Creating new default calendar without slug`)

  // Create the default calendar without a slug (will be generated when made public)
  const { data: newCalendar, error: createError } = await supabase
    .from('calendars')
    .insert({
      title: 'My Calendar',
      description: 'Default calendar for events',
      owner_id: userId,
      is_default: true,
      is_public: false,
      public_id: crypto.randomUUID(),
      slug: null // No slug until user decides to share
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating default calendar:', createError)
    
    // If creation fails, try to fetch any calendar that might have been created by another process
    const { data: retryCalendar, error: retryError } = await supabase
      .from('calendars')
      .select('*')
      .eq('owner_id', userId)
      .eq('is_default', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (retryCalendar) {
      console.log(`Found calendar created by another process for user ${userId}`)
      return retryCalendar
    }
    
    throw new Error('Failed to create default calendar')
  }

  if (!newCalendar) {
    throw new Error('Failed to create default calendar')
  }

  console.log(`Successfully created default calendar for user ${userId}`)
  return newCalendar
} 