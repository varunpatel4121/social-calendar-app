'use client'

import { CalendarEvent } from '@/types/calendar'

interface StoryBubbleProps {
  event: CalendarEvent
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  onClick: () => void
}

export default function StoryBubble({ event, dayNumber, isCurrentMonth, isToday, onClick }: StoryBubbleProps) {
  const getInitials = (title: string) => {
    return title
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getGradientColor = (title: string) => {
    const colors = [
      'from-pink-400 to-purple-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-orange-400 to-red-500',
      'from-purple-400 to-pink-500',
      'from-yellow-400 to-orange-500',
      'from-indigo-400 to-purple-500',
      'from-teal-400 to-blue-500'
    ]
    
    // Use the title to consistently pick a color
    const index = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  return (
    <div
      className={`
        relative w-full h-full rounded-2xl cursor-pointer transition-all duration-300
        hover:scale-105 active:scale-95
        ${isCurrentMonth ? '' : 'opacity-30'}
        ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
      onClick={onClick}
    >
      {/* Story Bubble Container */}
      <div className="w-full h-full rounded-2xl p-1">
        <div className="w-full h-full rounded-xl overflow-hidden relative">
          {/* Image or Gradient Background */}
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to gradient if image fails
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const gradientEl = target.nextElementSibling as HTMLElement
                if (gradientEl) gradientEl.style.display = 'flex'
              }}
            />
          ) : null}
          
          {/* Gradient Fallback */}
          <div 
            className={`
              absolute inset-0 bg-gradient-to-br ${getGradientColor(event.title)}
              ${event.imageUrl ? 'hidden' : 'flex'}
              items-center justify-center
            `}
          >
            <span className="text-white font-bold text-lg">
              {getInitials(event.title)}
            </span>
          </div>

          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          
          {/* Date Number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`
              text-lg font-bold text-white drop-shadow-lg
              ${isCurrentMonth ? '' : 'opacity-50'}
            `}>
              {dayNumber}
            </span>
          </div>

          {/* Event Indicator */}
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 bg-white rounded-full border border-gray-300" />
          </div>
        </div>
      </div>
    </div>
  )
} 