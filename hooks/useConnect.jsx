import { useMutation, QueryClient } from "@tanstack/react-query";

export async function connectWallet() {
  try {
    // Check if running in browser environment
    if (typeof window === "undefined") {
      throw new Error("Not in browser environment");
    }

    // Check for Ethereum provider (MetaMask, etc.)
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts && accounts.length > 0) {
          // Get additional wallet info
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });

          return {
            address: accounts[0],
            chainId: chainId,
            provider: "ethereum",
            success: true,
          };
        } else {
          throw new Error("No accounts returned from wallet");
        }
      } catch (walletError) {
        // Handle specific wallet errors
        if (walletError.code === 4001) {
          throw new Error("User rejected the connection request");
        } else if (walletError.code === -32002) {
          throw new Error("Connection request is already pending");
        } else {
          throw new Error(`Wallet connection failed: ${walletError.message}`);
        }
      }
    } else {
      // Provide helpful guidance for users without wallets
      const userAgent = navigator.userAgent.toLowerCase();
      let installMessage = "No Ethereum wallet detected. ";
      
      if (userAgent.includes("mobile")) {
        installMessage += "Please install MetaMask mobile app or use a mobile wallet like Trust Wallet.";
      } else {
        installMessage += "Please install MetaMask browser extension or another Ethereum wallet.";
      }
      
      throw new Error(installMessage);
    }
  } catch (error) {
    console.warn("Wallet connection error:", error.message);
    return { 
      address: null, 
      success: false, 
      error: error.message,
      provider: null 
    };
  }
}

export default function useConnect() {
  const queryClient = new QueryClient();

  return useMutation(() => connectWallet(), {
    onSuccess: (data) => {
      if (data.success) {
        console.log("Wallet connected successfully:", data.address);
        // Invalidate queries to refresh account data
        queryClient.invalidateQueries(["accounts"]);
      } else {
        console.warn("Wallet connection failed:", data.error);
        // Show user-friendly error message
        if (data.error.includes("No Ethereum wallet")) {
          alert("Install MetaMask or another Ethereum wallet to connect.\n\nVisit: https://metamask.io/");
        } else {
          alert(data.error);
        }
      }
    },
    onError: (error) => {
      console.error("Connection mutation error:", error);
      alert("Failed to connect wallet. Please try again.");
    },
    onSettled: () => {
      // Always invalidate to ensure fresh data
      queryClient.invalidateQueries();
    },
  });
}
