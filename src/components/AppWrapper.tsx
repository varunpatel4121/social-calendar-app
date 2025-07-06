"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/authHelpers";

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) {
      console.log("[AppWrapper] Still loading, waiting...");
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected) {
      console.log("[AppWrapper] Already redirected, skipping");
      return;
    }

    console.log("[AppWrapper] Auth state - user:", !!user, "pathname:", pathname);

    if (user) {
      // User is authenticated
      if (pathname === "/" || pathname === "/login" || pathname === "/signin") {
        console.log("[AppWrapper] Redirecting authenticated user to dashboard");
        setHasRedirected(true);
        router.replace("/dashboard");
      }
    } else {
      // User is not authenticated
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/calendar")) {
        console.log("[AppWrapper] Redirecting unauthenticated user to home");
        setHasRedirected(true);
        router.replace("/");
      }
    }
  }, [user, isLoading, pathname, router, hasRedirected]);

  // Reset redirect flag when pathname changes
  useEffect(() => {
    setHasRedirected(false);
  }, [pathname]);

  // Show loading screen while auth is initializing
  if (isLoading) {
    console.log("[AppWrapper] Showing loading screen");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("[AppWrapper] Rendering children");
  return <>{children}</>;
}
