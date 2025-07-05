'use client'
import { supabase } from '@/lib/supabaseClient'

export default function SignOutButton() {
  return (
    <button
      onClick={() => supabase.auth.signOut()}
      className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
    >
      Sign out
    </button>
  )
} 