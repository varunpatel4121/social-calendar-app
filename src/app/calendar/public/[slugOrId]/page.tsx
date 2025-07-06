import { notFound } from 'next/navigation'
import { fetchPublicCalendar } from '@/lib/fetchPublicCalendar'
import PublicCalendar from '@/components/PublicCalendar'
import { CalendarEvent } from '@/types/calendar'

interface PublicCalendarPageProps {
  params: Promise<{ slugOrId: string }>
}

export default async function PublicCalendarPage({ params }: PublicCalendarPageProps) {
  const { slugOrId } = await params
  let calendar

  try {
    calendar = await fetchPublicCalendar(slugOrId)
  } catch (error) {
    console.error('Error fetching public calendar:', error)
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
    <PublicCalendar
      events={calendarEvents}
      calendarTitle={calendar.title || "My Public Calendar"}
      ownerName={calendar.owner_name || "Anonymous"}
      publicId={calendar.public_id}
    />
  )
} 