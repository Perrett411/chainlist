import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

async function getAccount() {
  try {
    // Check if running in browser environment
    if (typeof window === "undefined") {
      return { chainId: null, address: null, isConnected: false, error: "Not in browser" };
    }

    // Check if Ethereum provider exists
    if (window.ethereum) {
      // Check if already connected
      if (window.ethereum.selectedAddress) {
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          
          const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [window.ethereum.selectedAddress, "latest"]
          });
          
          return {
            chainId: parseInt(chainId, 16),
            address: window.ethereum.selectedAddress,
            isConnected: true,
            balance: parseInt(balance, 16) / Math.pow(10, 18), // Convert Wei to ETH
            provider: "ethereum",
            error: null
          };
        } catch (rpcError) {
          console.warn("RPC Error:", rpcError);
          // Still return connection info even if RPC calls fail
          return {
            chainId: null,
            address: window.ethereum.selectedAddress,
            isConnected: true,
            balance: null,
            provider: "ethereum",
            error: "RPC connection issue"
          };
        }
      } else {
        // Wallet exists but not connected
        return { 
          chainId: null, 
          address: null, 
          isConnected: false, 
          provider: "ethereum",
          error: "Wallet not connected"
        };
      }
    } else {
      // No wallet detected
      return { 
        chainId: null, 
        address: null, 
        isConnected: false, 
        provider: null,
        error: "No Ethereum wallet detected"
      };
    }
  } catch (error) {
    console.warn("Account check error:", error);
    return { 
      chainId: null, 
      address: null, 
      isConnected: false, 
      provider: null,
      error: error.message 
    };
  }
}

export default function useAccount() {
  const [isClient, setIsClient] = useState(false);

  // Only run on client side to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up event listeners for account changes
  useEffect(() => {
    if (isClient && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        console.log("Accounts changed:", accounts);
        // Query will automatically refetch due to account change
      };

      const handleChainChanged = (chainId) => {
        console.log("Chain changed:", chainId);
        // Query will automatically refetch due to chain change
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isClient]);

  return useQuery({
    queryKey: ["accounts"],
    queryFn: getAccount,
    retry: false,
    enabled: isClient, // Only run on client side
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Check every 10 seconds for changes
  });
}
