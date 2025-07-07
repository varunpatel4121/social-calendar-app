import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin client not available - service role key missing' },
        { status: 503 }
      )
    }
    
    // Get user data from auth.users table
    const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (error || !userData?.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Extract safe user information for public display
    const user = userData.user
    const metadata = user.user_metadata || {}
    
    const publicProfile = {
      name: metadata.name || metadata.first_name || user.email?.split('@')[0] || 'Anonymous',
      email: user.email,
      avatar_url: metadata.avatar_url || null
    }

    return NextResponse.json(publicProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
} 