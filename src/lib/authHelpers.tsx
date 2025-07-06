"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

interface AuthContextType {
  user: User | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const signOut = async () => {
    console.log("[AuthProvider] signOut called");
    try {
      console.log("[AuthProvider] Calling supabase.auth.signOut()");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[AuthProvider] Sign out error from Supabase:", error);
        throw error;
      }
      console.log("[AuthProvider] Supabase sign out successful, setting user to null");
      setUser(null);
      console.log("[AuthProvider] User state updated to null");
    } catch (error) {
      console.error("[AuthProvider] Sign out error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (initialized.current) {
      console.log("[AuthProvider] Already initialized, skipping");
      return;
    }
    initialized.current = true;
    console.log("[AuthProvider] Initializing auth");

    const initializeAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("[AuthProvider] Error getting user:", error);
        } else {
          console.log("[AuthProvider] Initial user state:", user?.email || "No user");
          setUser(user);
        }
      } catch (error) {
        console.error("[AuthProvider] Error getting user:", error);
      } finally {
        setIsLoading(false);
        console.log("[AuthProvider] Initial loading complete");
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[AuthProvider] Auth state changed:", event, session?.user?.email || "No user");
        
        // Only update user state if it's actually different
        const newUser = session?.user || null;
        setUser(prevUser => {
          if (prevUser?.id !== newUser?.id) {
            console.log("[AuthProvider] User state updated:", newUser?.email || "No user");
            return newUser;
          }
          return prevUser;
        });
        
        // Only set loading to false if we're still loading
        setIsLoading(prev => {
          if (prev) {
            console.log("[AuthProvider] Setting loading to false after auth state change");
            return false;
          }
          return prev;
        });
      },
    );

    return () => {
      console.log("[AuthProvider] Cleaning up auth state listener");
      listener?.subscription.unsubscribe();
    };
  }, []);

  console.log("[AuthProvider] Current state - user:", !!user, "isLoading:", isLoading);

  return (
    <AuthContext.Provider value={{ user, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
