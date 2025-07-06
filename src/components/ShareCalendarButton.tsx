'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface ShareCalendarButtonProps {
  calendarId: string
  isPublic: boolean
  onShareSuccess?: () => void
}

export default function ShareCalendarButton({
  calendarId,
  isPublic,
  onShareSuccess
}: ShareCalendarButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleShare = async () => {
    setIsLoading(true)
    
    try {
      if (!isPublic) {
        // Make calendar public
        const { error: updateError } = await supabase
          .from('calendars')
          .update({ is_public: true })
          .eq('id', calendarId)

        if (updateError) {
          throw new Error('Failed to make calendar public')
        }
      }

      // Get the public ID (either existing or newly created)
      const { data: calendar, error: fetchError } = await supabase
        .from('calendars')
        .select('public_id')
        .eq('id', calendarId)
        .single()

      if (fetchError || !calendar) {
        throw new Error('Failed to get calendar details')
      }

      // Copy link to clipboard
      const shareUrl = `${window.location.origin}/public-calendar/${calendar.public_id}`
      await navigator.clipboard.writeText(shareUrl)

      // Show success toast
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)

      onShareSuccess?.()
    } catch (error) {
      console.error('Error sharing calendar:', error)
      alert('Failed to share calendar. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={isLoading}
        className={`
          inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isPublic
            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        )}
        {isPublic ? 'Copy Link' : 'Share Calendar'}
      </button>

      {/* Success Toast */}
      {showToast && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Link copied! Anyone can now view your calendar.
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 