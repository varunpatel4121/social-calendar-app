"use client";
import { supabase } from "@/lib/supabaseClient";

export default function SignInButton() {
  const handleSignIn = async () => {
    console.log("[SignInButton] Attempting sign in with Google");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      console.error("[SignInButton] Sign in error:", error);
    } else {
      console.log("[SignInButton] Sign in initiated, waiting for OAuth redirect");
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Sign in with Google
    </button>
  );
}
