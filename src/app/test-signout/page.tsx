"use client";
import { useAuth } from "@/lib/authHelpers";
import SignOutButton from "@/components/auth/SignOutButton";

export default function TestSignOutPage() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading auth...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign Out Test</h1>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Current user:</p>
          <p className="font-medium">{user?.email || "No user logged in"}</p>
        </div>

        <div className="space-y-4">
          <SignOutButton className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" />
          
          <button
            onClick={() => {
              console.log("🔍 Test: Manual sign out test");
              signOut().then(() => {
                console.log("🔍 Test: Manual sign out successful");
              }).catch((error) => {
                console.error("❌ Test: Manual sign out failed:", error);
              });
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Manual Sign Out
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">
            Check the browser console for debugging logs.
          </p>
        </div>
      </div>
    </div>
  );
} 