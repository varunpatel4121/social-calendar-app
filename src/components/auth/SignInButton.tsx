'use client'
import { supabase } from '@/lib/supabaseClient'

export default function SignInButton() {
  return (
    <button
      onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Sign in with Google
    </button>
  )
} 