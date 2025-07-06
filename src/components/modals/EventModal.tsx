"use client";

import { format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import Image from "next/image";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: CalendarEvent[];
}

export default function EventModal({
  isOpen,
  onClose,
  date,
  events,
}: EventModalProps) {
  if (!isOpen || !date) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {format(date, "MMMM d, yyyy")}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {events.length > 0 ? (
            <div className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="bg-gray-50 rounded-2xl p-4">
                  {/* Event Image */}
                  <div className="relative mb-4">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      width={400}
                      height={192}
                      className="w-full h-48 rounded-xl object-cover"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZDNjAgNTYgNjAgNzUgNjAgNzVDNjAgNzUgNDAgNzUgNDAgNTZDNDAgNDcuNzE1NyA0Ni43MTU3IDQxIDU1IDQxSjc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
                      }}
                    />
                    {/* Event Color Indicator */}
                    {event.color && (
                      <div
                        className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: event.color }}
                      />
                    )}
                  </div>

                  {/* Event Details */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-gray-600 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Events
              </h4>
              <p className="text-gray-600">
                No events scheduled for this date.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
