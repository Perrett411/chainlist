// Client-side authentication hook using server-side verification
// Referenced from javascript_log_in_with_replit blueprint

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [isClient, setIsClient] = useState(false);
  
  // Only run on client side to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/user", {
        credentials: 'include', // Include cookies
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: false,
    enabled: isClient, // Only fetch when on client side
  });

  return {
    user,
    isLoading: !isClient || isLoading,
    isAuthenticated: !!user && !error,
    error,
  };
}

// Utility function for checking unauthorized errors
export function isUnauthorizedError(error) {
  return error?.message?.includes('401') || error?.message?.includes('Unauthorized');
}