"use client";
import { useAuth } from "@/lib/authHelpers";
import SignInButton from "@/components/auth/SignInButton";

export default function IndexPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to Debrief</h1>
        <p className="text-lg text-gray-600 mb-8">Your social calendar for past moments and future memories</p>
        <SignInButton />
      </div>
    </div>
  );
}
