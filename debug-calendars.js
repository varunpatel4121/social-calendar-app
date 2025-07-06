const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugCalendars() {
  console.log('🔍 Debugging Supabase calendars...')
  console.log('URL:', supabaseUrl)
  console.log('Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...')

  try {
    // Test 1: List all calendars (should work with RLS)
    console.log('\n📋 Test 1: Listing all calendars...')
    const { data: allCalendars, error: allError } = await supabase
      .from('calendars')
      .select('id, title, is_public, public_id, owner_id')

    if (allError) {
      console.error('❌ Error fetching all calendars:', allError)
    } else {
      console.log('✅ All calendars:', allCalendars)
    }

    // Test 2: List only public calendars
    console.log('\n📋 Test 2: Listing public calendars...')
    const { data: publicCalendars, error: publicError } = await supabase
      .from('calendars')
      .select('id, title, is_public, public_id, owner_id')
      .eq('is_public', true)

    if (publicError) {
      console.error('❌ Error fetching public calendars:', publicError)
    } else {
      console.log('✅ Public calendars:', publicCalendars)
    }

    // Test 3: Try to fetch the specific calendar
    const testPublicId = '6deb4f7b-e491-4cb7-94c8-8586238b19f5'
    console.log(`\n📋 Test 3: Fetching specific calendar with public_id: ${testPublicId}`)
    
    const { data: specificCalendar, error: specificError } = await supabase
      .from('calendars')
      .select('*')
      .eq('public_id', testPublicId)
      .eq('is_public', true)
      .single()

    if (specificError) {
      console.error('❌ Error fetching specific calendar:', specificError)
    } else {
      console.log('✅ Specific calendar found:', specificCalendar)
    }

    // Test 4: Check if the calendar exists without the is_public filter
    console.log(`\n📋 Test 4: Checking if calendar exists (without is_public filter)...`)
    
    const { data: anyCalendar, error: anyError } = await supabase
      .from('calendars')
      .select('*')
      .eq('public_id', testPublicId)
      .single()

    if (anyError) {
      console.error('❌ Error fetching any calendar with this public_id:', anyError)
    } else {
      console.log('✅ Calendar exists but might not be public:', anyCalendar)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugCalendars() 