import { supabase } from '../supabaseClient';

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending numbers if needed
 */
export async function generateUniqueSlug(baseSlug: string): Promise<string> {
  console.log('🔧 generateUniqueSlug called with:', baseSlug);
  
  if (!baseSlug || baseSlug.trim() === '') {
    baseSlug = 'calendar';
    console.log('📝 Using default slug:', baseSlug);
  }
  
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    console.log('🔄 Checking slug availability:', slug);
    try {
      // Check if slug exists using Supabase SDK
      console.log('📤 Making Supabase query for slug availability:', slug);
      const { data, error } = await supabase
        .from('calendars')
        .select('id')
        .eq('slug', slug)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid crashes

      console.log('📥 Supabase response - data:', data);
      console.log('📥 Supabase response - error:', error);

      if (error) {
        if (error.code === '406') {
          // Column doesn't exist yet - treat as available
          console.warn('⚠️ 406 Error - Slug column not found in database, treating as available:', slug);
          return slug;
        } else {
          console.error('❌ Error checking slug availability:', error);
          throw new Error('Failed to check slug availability');
        }
      }

      // If data is null, no calendar found with this slug (available)
      if (data === null) {
        console.log('✅ Slug is available:', slug);
        return slug;
      }

      // Slug exists, try with counter
      console.log('❌ Slug taken, trying with counter:', counter);
      slug = `${baseSlug}-${counter}`;
      counter++;
    } catch (error) {
      console.error('Unexpected error in generateUniqueSlug:', error);
      // Fallback: return the base slug with timestamp
      const fallbackSlug = `${baseSlug}-${Date.now()}`;
      console.log('🔄 Using fallback slug:', fallbackSlug);
      return fallbackSlug;
    }
  }
}

/**
 * Generate a slug from user name or calendar title
 */
export function generateSlugFromName(name: string, title?: string): string {
  // Try to use name first, fall back to title
  const baseText = name || title || 'calendar';
  return generateSlug(baseText);
}

/**
 * Validate if a slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.trim() === '') {
    return false;
  }
  // Must be 3-50 characters, alphanumeric and hyphens only
  const slugRegex = /^[a-z0-9-]{3,50}$/;
  return slugRegex.test(slug);
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  console.log('🔍 isSlugAvailable called with:', slug);
  
  if (!slug || slug.trim() === '') {
    console.log('❌ Empty slug, returning false');
    return false; // Empty slugs are not valid
  }

  try {
    console.log('📤 Making Supabase query for slug:', slug);
    const { data, error } = await supabase
      .from('calendars')
      .select('id')
      .eq('slug', slug)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid crashes

    console.log('📥 Supabase response - data:', data);
    console.log('📥 Supabase response - error:', error);

    if (error) {
      if (error.code === '406') {
        // Column doesn't exist yet - treat as available
        console.warn('⚠️ 406 Error - Slug column not found in database, treating as available:', slug);
        return true;
      } else {
        console.error('❌ Error checking slug availability:', error);
        return false;
      }
    }

    // If data is null, no calendar found with this slug (available)
    // If data exists, slug is taken
    const isAvailable = data === null;
    console.log('✅ Slug availability result:', isAvailable, 'for slug:', slug);
    return isAvailable;
  } catch (error) {
    console.error('❌ Unexpected error in isSlugAvailable:', error);
    return false;
  }
} 