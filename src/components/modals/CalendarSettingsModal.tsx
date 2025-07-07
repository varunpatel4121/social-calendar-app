"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { generateSlugFromName, generateUniqueSlug, isValidSlug, isSlugAvailable } from "@/lib/utils/slug";
import { Calendar } from "@/types/calendar";

interface CalendarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar: Calendar | null;
  userId: string;
  onUpdate?: () => void;
}

interface Toast {
  type: "success" | "error";
  message: string;
}

export default function CalendarSettingsModal({
  isOpen,
  onClose,
  calendar,
  userId,
  onUpdate,
}: CalendarSettingsModalProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [slugError, setSlugError] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<'available' | 'taken' | 'checking' | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize form with calendar data
  useEffect(() => {
    if (calendar) {
      setIsPublic(calendar.is_public);
      setSlug(calendar.slug || "");
      setSlugAvailability(null);
    }
  }, [calendar]);

  // Debounced slug availability check
  const checkSlugAvailability = useCallback(async (newSlug: string) => {
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set a new timer
    const timer = setTimeout(async () => {
      // Only check if slug is valid and at least 3 characters
      if (!newSlug || newSlug.trim() === "" || !isValidSlug(newSlug) || newSlug.length < 3) {
        setSlugAvailability(null);
        setIsCheckingSlug(false);
        return;
      }

      // Don't check if it's the same as current calendar slug
      if (newSlug === calendar?.slug) {
        setSlugAvailability('available');
        setIsCheckingSlug(false);
        return;
      }

      setIsCheckingSlug(true);
      setSlugAvailability('checking');

      try {
        const available = await isSlugAvailable(newSlug);
        setSlugAvailability(available ? 'available' : 'taken');
        if (!available) {
          setSlugError("This URL name is already taken");
        } else {
          setSlugError("");
        }
      } catch (error) {
        console.error('Error checking slug availability:', error);
        // Treat any error (including 406) as available but log it
        setSlugAvailability('available');
        setSlugError("");
        console.warn('Slug availability check failed, treating as available:', error);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500); // 500ms debounce

    setDebounceTimer(timer);
  }, [debounceTimer, calendar?.slug]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Reset toast when modal closes
  useEffect(() => {
    if (!isOpen) {
      setToast(null);
    }
  }, [isOpen]);

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);
    setSlugError("");
    setSlugAvailability(null);

    // Only trigger availability check if slug is valid
    if (newSlug && newSlug.trim() !== "" && isValidSlug(newSlug) && newSlug.length >= 3) {
      checkSlugAvailability(newSlug);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 handleSubmit called');
    
    if (!calendar) {
      console.log('❌ No calendar found');
      setToast({ type: "error", message: "No calendar selected" });
      return;
    }

    if (slugError) {
      console.log('❌ URL name error exists:', slugError);
      setToast({ type: "error", message: "Please fix URL name errors before saving" });
      return;
    }

    console.log('📝 Current form state:', {
      isPublic,
      slug,
      calendarSlug: calendar.slug,
      slugError,
      slugAvailability
    });

    setIsSubmitting(true);

    try {
      const updateData: Record<string, unknown> = {
        is_public: isPublic,
      };

      console.log('🔧 Initial update data:', updateData);

      // If making public and no slug exists, generate one
      if (isPublic && (!slug || slug.trim() === "")) {
        console.log('🔄 Making public with no slug, generating one...');
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const userName = user?.user_metadata?.name || 
                          user?.user_metadata?.first_name || 
                          user?.email?.split('@')[0] || 
                          'user';
          
          const baseSlug = generateSlugFromName(userName, calendar.title);
          const uniqueSlug = await generateUniqueSlug(baseSlug);
          updateData.slug = uniqueSlug;
          setSlug(uniqueSlug);
          console.log('✅ Generated and added slug to update data:', uniqueSlug);
        } catch (error) {
          console.error('❌ Error generating slug:', error);
          setToast({ type: "error", message: "Failed to generate slug" });
          setIsSubmitting(false);
          return;
        }
      } else if (slug && slug !== calendar.slug && isValidSlug(slug)) {
        console.log('🔄 Updating existing slug from', calendar.slug, 'to', slug);
        // Only update slug if it's different and valid
        const available = await isSlugAvailable(slug);
        console.log('🔍 Slug availability check result:', available);
        if (!available) {
          console.log('❌ URL name not available');
          setToast({ type: "error", message: "This URL name is already taken" });
          setIsSubmitting(false);
          return;
        }
        updateData.slug = slug;
        console.log('✅ Added slug to update data:', slug);
      }

      console.log('📤 Final update data:', updateData);
      console.log('🔍 Updating calendar with ID:', calendar.id);
      console.log('👤 User ID:', userId);

      const { data, error } = await supabase
        .from("calendars")
        .update(updateData)
        .eq("id", calendar.id)
        .eq("owner_id", userId)
        .select(); // Add select to get the response data

      console.log('📥 Supabase response - data:', data);
      console.log('📥 Supabase response - error:', error);

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Calendar updated successfully:', data);
      setToast({ type: "success", message: "Calendar settings updated successfully!" });
      onUpdate?.();
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("❌ Error updating calendar:", error);
      setToast({
        type: "error",
        message: "Failed to update calendar settings",
      });
    } finally {
      setIsSubmitting(false);
      console.log('🏁 handleSubmit completed');
    }
  };

  const getShareableLink = () => {
    if (!calendar || !isPublic) return "";
    const baseUrl = window.location.origin;
    const slugOrId = slug || calendar.public_id;
    return `${baseUrl}/calendar/public/${slugOrId}`;
  };

  const copyToClipboard = async () => {
    const link = getShareableLink();
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setToast({ type: "success", message: "Link copied to clipboard!" });
    } catch {
      setToast({ type: "error", message: "Failed to copy link" });
    }
  };

  if (!isOpen || !calendar) return null;

  const shareableLink = getShareableLink();

  // Get availability indicator
  const getAvailabilityIndicator = () => {
    if (isCheckingSlug) {
      return (
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2"></div>
          Checking if URL name is available...
        </div>
      );
    }
    
    if (slugAvailability === 'available') {
      return (
        <div className="flex items-center text-xs text-green-600 mt-1">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          URL name is available
        </div>
      );
    }
    
    if (slugAvailability === 'taken') {
      return (
        <div className="flex items-center text-xs text-red-600 mt-1">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          This URL name is already taken
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Calendar Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{calendar.title}</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Public Sharing Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Make Calendar Public</h3>
                <p className="text-xs text-gray-500">Allow others to view your calendar</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Custom URL Settings */}
          {isPublic && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom URL Name
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="my-calendar"
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    slugError ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
                {slugError && (
                  <p className="text-xs text-red-600 mt-1">{slugError}</p>
                )}
                {getAvailabilityIndicator()}
                <p className="text-xs text-gray-500 mt-1">
                  Your calendar will be available at: {window.location.origin}/calendar/public/{slug || 'your-url-name'}
                </p>
              </div>
            </div>
          )}

          {/* Shareable Link */}
          {isPublic && shareableLink && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Shareable Link
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className={`p-3 rounded-lg text-sm ${
              toast.type === "success" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {toast.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!slugError || (isPublic && slugAvailability === 'taken')}
              className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 