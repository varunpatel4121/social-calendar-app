"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { getUserDefaultCalendar } from "@/lib/getUserDefaultCalendar";

interface EventCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  userId: string;
}

interface ToastMessage {
  type: "success" | "error";
  message: string;
}

export default function EventCreateModal({
  isOpen,
  onClose,
  selectedDate,
  userId,
}: EventCreateModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    date: selectedDate
      ? format(selectedDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [imageValidation, setImageValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    error: string | null;
  }>({
    isValidating: false,
    isValid: null,
    error: null,
  });

  // Fetch user's default calendar when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      setIsLoadingCalendar(true);
      getUserDefaultCalendar(userId)
        .then((calendar) => {
          setCalendarId(calendar.id);
          setIsLoadingCalendar(false);
        })
        .catch((error) => {
          console.error("Error fetching default calendar:", error);
          setToast({
            type: "error",
            message: "Failed to load your calendar. Please try again.",
          });
          setIsLoadingCalendar(false);
        });
    }
  }, [isOpen, userId]);

  // Reset form when modal opens/closes or selectedDate changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        date: selectedDate
          ? format(selectedDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
      });
      setToast(null);
      setCalendarId(null);
      setImageValidation({
        isValidating: false,
        isValid: null,
        error: null,
      });
    }
  }, [isOpen, selectedDate]);

  // Validate image URL
  const validateImageUrl = async (url: string) => {
    if (!url.trim()) {
      setImageValidation({
        isValidating: false,
        isValid: null,
        error: null,
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setImageValidation({
        isValidating: false,
        isValid: false,
        error: "Invalid URL format",
      });
      return;
    }

    // All domains are now allowed, so we skip domain validation

    setImageValidation({
      isValidating: true,
      isValid: null,
      error: null,
    });

    try {
      // Create a test image element to validate the URL
      const img = new Image();
      
      // Set up promise-based validation
      const validationPromise = new Promise<boolean>((resolve, reject) => {
        img.onload = () => {
          // Additional check: verify the image actually loaded with dimensions
          if (img.width > 0 && img.height > 0) {
            resolve(true);
          } else {
            reject(new Error('Image loaded but has no dimensions'));
          }
        };
        img.onerror = () => reject(new Error('Image failed to load'));
        
        // Set a timeout to prevent hanging
        setTimeout(() => reject(new Error('Image validation timed out')), 10000);
      });

      // Start loading the image
      img.src = url;
      
      // Wait for validation result
      await validationPromise;

      console.log('Image validation successful:', url);
      setImageValidation({
        isValidating: false,
        isValid: true,
        error: null,
      });
    } catch (error) {
      console.error('Image validation error:', error);
      setImageValidation({
        isValidating: false,
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to load image',
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate image URL when it changes
    if (name === 'imageUrl') {
      // Debounce validation to avoid too many requests
      const timeoutId = setTimeout(() => {
        validateImageUrl(value);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if calendar ID has been loaded
    if (!calendarId) {
      setToast({
        type: "error",
        message: "No calendar found for this user.",
      });
      return;
    }

    // Validate image URL if provided
    if (formData.imageUrl.trim()) {
      if (imageValidation.isValidating) {
        setToast({
          type: "error",
          message: "Please wait for image validation to complete.",
        });
        return;
      }

      if (imageValidation.isValid === false) {
        setToast({
          type: "error",
          message: `Image validation failed: ${imageValidation.error}`,
        });
        return;
      }
    }
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("events")
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            image_url: formData.imageUrl.trim() || null,
            start_time: new Date(formData.date + "T00:00:00Z").toISOString(),
            end_time: new Date(formData.date + "T23:59:59Z").toISOString(),
            created_by: userId,
            calendar_id: calendarId,
          },
        ])
        .select();

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      setToast({ type: "success", message: "Event created successfully! 🎉" });

      // Reset form and close modal after a short delay
      setTimeout(() => {
        onClose();
        // Trigger a page refresh to show the new event
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error creating event:", error);
      setToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to create event",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Create New Event</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
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

        {/* Toast Message */}
        {toast && (
          <div
            className={`px-6 py-3 border-l-4 ${
              toast.type === "success"
                ? "bg-green-50 border-green-400 text-green-800"
                : "bg-red-50 border-red-400 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                  toast.type === "success" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {toast.type === "success" ? (
                  <svg
                    className="w-2.5 h-2.5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-2.5 h-2.5 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700"
              >
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 text-gray-900 placeholder-gray-500"
                placeholder="Enter event title..."
              />
            </div>

            {/* Event Date */}
            <div className="space-y-2">
              <label
                htmlFor="date"
                className="block text-sm font-semibold text-gray-700"
              >
                Event Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 text-gray-900"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <label
                htmlFor="imageUrl"
                className="block text-sm font-semibold text-gray-700"
              >
                Image URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 pr-10 text-gray-900 placeholder-gray-500 ${
                    imageValidation.isValid === true
                      ? 'border-green-300 focus:ring-green-500'
                      : imageValidation.isValid === false
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {/* Validation Status Icon */}
                {formData.imageUrl && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {imageValidation.isValidating ? (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : imageValidation.isValid === true ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : imageValidation.isValid === false ? (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                  </div>
                )}
              </div>
              
              {/* Validation Messages */}
              {formData.imageUrl && (
                <div className="text-xs">
                  {imageValidation.isValidating && (
                    <p className="text-blue-600">Validating image...</p>
                  )}
                  {imageValidation.isValid === true && (
                    <p className="text-green-600">✓ Image is valid and will work!</p>
                  )}
                  {imageValidation.isValid === false && (
                    <p className="text-red-600">✗ {imageValidation.error}</p>
                  )}

                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Optional: Add a beautiful image for your event
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 resize-none text-gray-900 placeholder-gray-500"
                placeholder="Tell us about your event..."
              />
              <p className="text-xs text-gray-500">
                Optional: Add details about your event
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting || 
                  isLoadingCalendar || 
                  !formData.title.trim() || 
                  !calendarId ||
                  (formData.imageUrl.trim() !== "" && imageValidation.isValidating) ||
                  (formData.imageUrl.trim() !== "" && imageValidation.isValid === false)
                }
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : isLoadingCalendar ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Create Event"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
