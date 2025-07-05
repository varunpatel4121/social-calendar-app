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
  const [, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking session:", error);
          setIsLoading(false);
          return;
        }

        if (session) {
          setHasSession(true);
          // If user is authenticated and on a public route, redirect to dashboard
          if (
            pathname === "/" ||
            pathname === "/login" ||
            pathname === "/signin"
          ) {
            router.replace("/dashboard");
          }
        } else {
          setHasSession(false);
          // If user is not authenticated and on a protected route, redirect to home
          if (
            pathname.startsWith("/dashboard") ||
            pathname.startsWith("/calendar")
          ) {
            router.replace("/");
          }
        }
      } catch (error) {
        console.error("Unexpected error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setHasSession(true);
        if (
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/signin"
        ) {
          router.replace("/dashboard");
        }
      } else if (event === "SIGNED_OUT") {
        setHasSession(false);
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/calendar")
        ) {
          router.replace("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  // Show loading screen while checking session
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

  return <>{children}</>;
}
