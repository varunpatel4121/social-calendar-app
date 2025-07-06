"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkSession = async () => {
      console.log("🔍 AppWrapper: Checking session for pathname:", pathname);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ AppWrapper: Error checking session:", error);
          setIsLoading(false);
          return;
        }

        console.log("🔍 AppWrapper: Session found:", !!session, "User:", session?.user?.email || "No user");

        if (session) {
          // If user is authenticated and on a public route, redirect to dashboard
          if (
            pathname === "/" ||
            pathname === "/login" ||
            pathname === "/signin"
          ) {
            console.log("🔍 AppWrapper: Redirecting authenticated user to dashboard");
            router.replace("/dashboard");
          }
        } else {
          // If user is not authenticated and on a protected route, redirect to home
          if (
            pathname.startsWith("/dashboard") ||
            pathname.startsWith("/calendar")
          ) {
            console.log("🔍 AppWrapper: Redirecting unauthenticated user to home");
            router.replace("/");
          }
        }
      } catch (error) {
        console.error("❌ AppWrapper: Unexpected error checking session:", error);
      } finally {
        // Add a small delay to prevent rapid state changes
        timeoutId = setTimeout(() => {
          setIsLoading(false);
          console.log("🔍 AppWrapper: Session check complete, loading:", false);
        }, 100);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔍 AppWrapper: Auth state change:", event, "User:", session?.user?.email || "No user");
      
      if (event === "SIGNED_IN" && session) {
        if (
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/signin"
        ) {
          console.log("🔍 AppWrapper: User signed in, redirecting to dashboard");
          router.replace("/dashboard");
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🔍 AppWrapper: User signed out, redirecting to home");
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/calendar")
        ) {
          router.replace("/");
        }
      }
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  // Show loading screen while checking session
  if (isLoading) {
    console.log("🔍 AppWrapper: Showing loading screen");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("🔍 AppWrapper: Rendering children");
  return <>{children}</>;
}
