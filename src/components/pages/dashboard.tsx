'use client'
import { useAuth } from '@/lib/authHelpers'
import SignInButton from '@/components/auth/SignInButton'
import SignOutButton from '@/components/auth/SignOutButton'
import Calendar from '@/components/calendar/Calendar'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignInButton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <h1 className="text-lg font-bold">📆 Welcome, {user.email}</h1>
        <SignOutButton />
      </div>
      <Calendar userId={user.id} />
    </div>
  )
} 