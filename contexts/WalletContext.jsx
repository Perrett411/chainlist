import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import useAccount from '../hooks/useAccount';
import useConnect from '../hooks/useConnect';

const WalletContext = createContext();

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export function WalletProvider({ children }) {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
    provider: null,
    isConnecting: false,
    error: null,
    lastUpdated: null
  });

  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    dayChange: 0,
    weekChange: 0,
    portfolioCount: 0,
    isLoading: false
  });

  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: accountData, isLoading: accountLoading, error: accountError } = useAccount();
  const { mutate: connectWallet, isLoading: connecting } = useConnect();

  // Update wallet state when account data changes
  useEffect(() => {
    if (accountData) {
      setWalletState(prev => ({
        ...prev,
        isConnected: accountData.isConnected || false,
        address: accountData.address || null,
        chainId: accountData.chainId || null,
        balance: accountData.balance || null,
        provider: accountData.provider || null,
        error: accountData.error || null,
        lastUpdated: new Date().toISOString()
      }));
    }
  }, [accountData]);

  // Update connecting state
  useEffect(() => {
    setWalletState(prev => ({
      ...prev,
      isConnecting: connecting
    }));
  }, [connecting]);

  // Fetch portfolio summary when wallet connects or user authenticates
  const fetchPortfolioSummary = useCallback(async () => {
    if (!walletState.isConnected && !isAuthenticated) return;

    setPortfolioSummary(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call for portfolio data
      // In a real app, this would fetch from your backend
      const portfolioData = await new Promise(resolve => {
        setTimeout(() => {
          // Sample portfolio data
          resolve({
            totalValue: 125750.00,
            dayChange: 2.3,
            weekChange: 8.7,
            portfolioCount: 2,
            portfolios: [
              {
                id: 'growth',
                name: 'Growth Portfolio',
                value: 75000,
                change: 3.2
              },
              {
                id: 'conservative', 
                name: 'Conservative Savings',
                value: 50750,
                change: 1.1
              }
            ]
          });
        }, 1000);
      });

      setPortfolioSummary({
        totalValue: portfolioData.totalValue,
        dayChange: portfolioData.dayChange,
        weekChange: portfolioData.weekChange,
        portfolioCount: portfolioData.portfolioCount,
        portfolios: portfolioData.portfolios,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch portfolio summary:', error);
      setPortfolioSummary(prev => ({ ...prev, isLoading: false }));
    }
  }, [walletState.isConnected, isAuthenticated]);

  // Fetch portfolio data when wallet connects or authentication changes
  useEffect(() => {
    fetchPortfolioSummary();
  }, [fetchPortfolioSummary]);

  // Enhanced connect function
  const enhancedConnect = useCallback(async () => {
    try {
      setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
      await connectWallet();
      // Refresh portfolio data after successful connection
      setTimeout(fetchPortfolioSummary, 1000);
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message
      }));
    }
  }, [connectWallet, fetchPortfolioSummary]);

  // Disconnect function
  const disconnect = useCallback(async () => {
    try {
      setWalletState({
        isConnected: false,
        address: null,
        chainId: null,
        balance: null,
        provider: null,
        isConnecting: false,
        error: null,
        lastUpdated: new Date().toISOString()
      });

      setPortfolioSummary({
        totalValue: 0,
        dayChange: 0,
        weekChange: 0,
        portfolioCount: 0,
        portfolios: [],
        isLoading: false
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['accounts']);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [queryClient]);

  // Format address for display
  const formatAddress = useCallback((address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount, currency = 'USD') => {
    try {
      if (!amount && amount !== 0) return '$0.00';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      return `${amount.toFixed(2)} ${currency}`;
    }
  }, []);

  // Get wallet connection status message
  const getStatusMessage = useCallback(() => {
    if (walletState.isConnecting) return 'Connecting...';
    if (walletState.error) return walletState.error;
    if (walletState.isConnected) return 'Connected';
    return 'Not connected';
  }, [walletState]);

  const contextValue = {
    // Wallet state
    walletState,
    
    // Portfolio data
    portfolioSummary,
    
    // Authentication
    user,
    isAuthenticated,
    authLoading,
    
    // Actions
    connect: enhancedConnect,
    disconnect,
    refreshPortfolio: fetchPortfolioSummary,
    
    // Utilities
    formatAddress,
    formatCurrency,
    getStatusMessage,
    
    // Loading states
    isLoading: authLoading || accountLoading || walletState.isConnecting,
    
    // Computed values
    hasWalletOrAuth: walletState.isConnected || isAuthenticated,
    displayName: user?.name || formatAddress(walletState.address) || 'Guest',
    totalBalance: walletState.balance || 0,
    portfolioValue: portfolioSummary.totalValue || 0
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export default WalletProvider;