"use client";
import { useAuth } from "@/lib/authHelpers";
import SignInButton from "@/components/auth/SignInButton";
import Header from "@/components/Header";
import Calendar from "@/components/calendar/Calendar";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Calendar userId={user.id} />
      </div>
    </div>
  );
}
