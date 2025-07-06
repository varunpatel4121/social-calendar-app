import { fetchPublicCalendar, PublicCalendar as PublicCalendarData } from '@/lib/fetchPublicCalendar'
import { notFound } from 'next/navigation'
import PublicCalendar from '@/components/PublicCalendar'
import { CalendarEvent } from '@/types/calendar'

interface PublicCalendarPageProps {
  params: Promise<{
    publicId: string
  }>
}

export default async function PublicCalendarPage({ params }: PublicCalendarPageProps) {
  const { publicId } = await params
  let calendar: PublicCalendarData

  try {
    calendar = await fetchPublicCalendar(publicId)
  } catch {
    notFound()
  }

  if (!calendar) {
    notFound()
  }

  // Transform events to CalendarEvent format
  const calendarEvents: CalendarEvent[] = calendar.events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description || '',
    imageUrl: event.location || '', // Using location field for image URL
    date: new Date(event.start_time).toISOString().split('T')[0], // Convert timestamp to date string
    color: event.color || undefined,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <h1 className="text-2xl font-bold">SocialCal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Public Calendar
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PublicCalendar
          events={calendarEvents}
          calendarTitle={calendar.title || "My Public Calendar"}
          ownerName={calendar.owner_name || "Anonymous"}
          publicId={publicId}
        />

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Powered by <span className="font-semibold text-purple-600">SocialCal</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Create your own social calendar at socialcal.app
          </p>
        </div>
      </div>
    </div>
  )
} 