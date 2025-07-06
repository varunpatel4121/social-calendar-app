"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authHelpers";

interface SignOutButtonProps {
  className?: string;
}

export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    console.log("🔍 SignOutButton: handleSignOut called");
    try {
      console.log("🔍 SignOutButton: Calling signOut from auth context");
      await signOut();
      console.log("🔍 SignOutButton: signOut completed successfully");
      
      // Redirect to home page after successful sign out
      console.log("🔍 SignOutButton: Redirecting to home page");
      router.push("/");
      router.refresh(); // Refresh the page to clear any cached state
      console.log("🔍 SignOutButton: Navigation completed");
    } catch (error) {
      console.error("❌ SignOutButton: Sign out error:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className={
        className || "px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
      }
    >
      Sign out
    </button>
  );
}
