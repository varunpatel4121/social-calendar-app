import { supabase } from './supabaseClient'
import { generateSlugFromName, generateUniqueSlug } from './utils/slug'
import { Calendar } from '@/types/calendar'

export type UserCalendar = Calendar;

export async function getUserDefaultCalendar(userId: string): Promise<UserCalendar> {
  if (!userId) {
    throw new Error('User ID is required')
  }

  // Try to find an existing default calendar
  const { data: existingCalendar, error: fetchError } = await supabase
    .from('calendars')
    .select('*')
    .eq('owner_id', userId)
    .eq('is_default', true)
    .maybeSingle()

  // If there is a real error (not just 'not found'), throw
  if (fetchError && fetchError.code !== 'PGRST116' && fetchError.code !== 'PGRST123') {
    // PGRST116 and PGRST123 are 'no rows found' errors
    console.error('Error fetching default calendar:', fetchError)
    throw new Error('Failed to fetch default calendar')
  }

  if (existingCalendar) {
    return existingCalendar
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

  // Generate unique slug (will handle 406 errors gracefully)
  let uniqueSlug = 'my-calendar'
  try {
    const baseSlug = generateSlugFromName(userName, 'My Calendar')
    uniqueSlug = await generateUniqueSlug(baseSlug)
  } catch (error) {
    console.warn('Could not generate unique slug, using fallback:', error)
    uniqueSlug = `my-calendar-${Date.now()}`
  }

  // No default calendar exists, create one
  const { data: newCalendar, error: createError } = await supabase
    .from('calendars')
    .insert({
      title: 'My Calendar',
      description: 'Default calendar for events',
      owner_id: userId,
      is_default: true,
      is_public: false,
      public_id: crypto.randomUUID(),
      slug: uniqueSlug
    })
    .select()
    .single()

  if (createError || !newCalendar) {
    console.error('Error creating default calendar:', createError)
    throw new Error('Failed to create default calendar')
  }

  return newCalendar
} 