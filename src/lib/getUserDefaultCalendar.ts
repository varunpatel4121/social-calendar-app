import { supabase } from './supabaseClient'

export interface UserCalendar {
  id: string
  title: string
  description?: string
  is_default: boolean
  is_public: boolean
  public_id: string
  created_at: string
}

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

  // No default calendar exists, create one
  const { data: newCalendar, error: createError } = await supabase
    .from('calendars')
    .insert({
      title: 'My Calendar',
      description: 'Default calendar for events',
      owner_id: userId,
      is_default: true,
      is_public: false,
      public_id: crypto.randomUUID()
    })
    .select()
    .single()

  if (createError || !newCalendar) {
    console.error('Error creating default calendar:', createError)
    throw new Error('Failed to create default calendar')
  }

  return newCalendar
} 