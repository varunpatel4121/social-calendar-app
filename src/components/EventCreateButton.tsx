'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/authHelpers'
import EventCreateModal from './EventCreateModal'

interface EventCreateButtonProps {
  selectedDate?: Date
}

export default function EventCreateButton({ selectedDate }: EventCreateButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useAuth()

  // Only show for authenticated users
  if (!user) return null

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-40 flex items-center justify-center"
        title="Create new event"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Create Event Modal */}
      <EventCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        userId={user.id}
      />
    </>
  )
} 