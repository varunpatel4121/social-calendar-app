"use client";
import { supabase } from "@/lib/supabaseClient";

interface SignOutButtonProps {
  className?: string;
}

export default function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <button
      onClick={() => supabase.auth.signOut()}
      className={
        className || "px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
      }
    >
      Sign out
    </button>
  );
}
