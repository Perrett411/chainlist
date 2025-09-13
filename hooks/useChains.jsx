import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// Custom hook for fetching chains data
export function useChains(initialChains = []) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Query for full chains data from API
  const { 
    data: apiResponse, 
    isLoading, 
    error,
    isSuccess 
  } = useQuery({
    queryKey: ['chains'],
    queryFn: async () => {
      const response = await fetch('/api/chains');
      if (!response.ok) {
        throw new Error(`Failed to fetch chains: ${response.status}`);
      }
      return response.json();
    },
    // Don't refetch automatically to reduce load
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2
  });

  // Use SSR data initially, then full API data once loaded
  const chains = isSuccess && apiResponse?.success 
    ? apiResponse.data 
    : initialChains;

  // Loading state - true if fetching and no SSR data
  const isLoadingChains = isLoading && initialChains.length === 0;

  // Whether we're using full data or just SSR subset
  const hasFullData = isSuccess && apiResponse?.success;

  return {
    chains,
    isLoading: isLoadingChains,
    isLoadingMore,
    setIsLoadingMore,
    error,
    hasFullData,
    // Metadata from API
    cached: apiResponse?.cached || false,
    timestamp: apiResponse?.timestamp
  };
}