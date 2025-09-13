import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../../contexts/WalletContext';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

const AccountDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const dropdownRef = useRef(null);
  const router = useRouter();

  const {
    walletState,
    portfolioSummary,
    user,
    isAuthenticated,
    authLoading,
    connect,
    disconnect,
    refreshPortfolio,
    formatAddress,
    formatCurrency,
    getStatusMessage,
    isLoading,
    hasWalletOrAuth,
    displayName,
    totalBalance,
    portfolioValue
  } = useWallet();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    setIsOpen(false);
    window.location.href = '/api/login';
  };

  const handleGoogleLogin = () => {
    setIsOpen(false);
    window.location.href = '/api/auth/google';
  };

  const handleLogout = () => {
    setIsOpen(false);
    window.location.href = '/api/logout';
  };

  const handleConnectWallet = async () => {
    setIsOpen(false);
    await connect();
  };

  const handleDisconnectWallet = async () => {
    await disconnect();
  };

  const navigateToPortfolio = () => {
    setIsOpen(false);
    // This would navigate to a portfolio page or open portfolio modal
    setShowPortfolioModal(true);
  };

  const getConnectionStatusIcon = () => {
    if (walletState.isConnecting || authLoading) {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>;
    }
    if (walletState.isConnected || isAuthenticated) {
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    }
    return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
  };

  const getMainButtonContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span className="hidden sm:inline">Loading...</span>
        </div>
      );
    }

    if (hasWalletOrAuth) {
      return (
        <div className="flex items-center gap-2">
          {getConnectionStatusIcon()}
          <span className="hidden sm:inline">{displayName}</span>
          <span className="sm:hidden">{formatAddress(walletState.address) || '👤'}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {getConnectionStatusIcon()}
        <span className="hidden sm:inline">Connect</span>
        <span className="sm:hidden">🔗</span>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Main Account Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2F80ED] hover:bg-blue-600 text-white rounded-lg transition-all duration-200 min-w-[120px] justify-center"
        >
          {getMainButtonContent()}
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#0D0D0D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2F80ED] rounded-full flex items-center justify-center text-white font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium dark:text-[#B3B3B3] text-black">{displayName}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    {getConnectionStatusIcon()}
                    {getStatusMessage()}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    activeTab === 'overview' 
                      ? 'bg-[#2F80ED] text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    activeTab === 'wallet' 
                      ? 'bg-[#2F80ED] text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Wallet
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    activeTab === 'portfolio' 
                      ? 'bg-[#2F80ED] text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Portfolio
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  {hasWalletOrAuth ? (
                    <>
                      {/* Account Summary */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Total Value</div>
                        <div className="text-lg font-bold dark:text-[#B3B3B3] text-black">
                          {formatCurrency(portfolioValue + totalBalance)}
                        </div>
                        <div className="text-xs text-green-600">
                          +{portfolioSummary.dayChange?.toFixed(2) || 0}% today
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <div className="text-xs text-gray-500">Wallet Balance</div>
                          <div className="font-medium dark:text-[#B3B3B3] text-black">
                            {formatCurrency(totalBalance)}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <div className="text-xs text-gray-500">Portfolios</div>
                          <div className="font-medium dark:text-[#B3B3B3] text-black">
                            {portfolioSummary.portfolioCount || 0}
                          </div>
                        </div>
                      </div>

                      {/* User Info */}
                      {user && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500 mb-2">Account Details</div>
                          <div className="space-y-1">
                            <div className="text-xs dark:text-[#B3B3B3] text-black">{user.email}</div>
                            {user.role && (
                              <div className="text-xs text-[#2F80ED]">{user.role}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center py-2">
                        <div className="text-gray-500 mb-3">Connect to get started</div>
                        <div className="text-xs text-gray-400 mb-4">
                          {PERRETT_CONFIG.OWNER} Investment Platform
                        </div>
                      </div>
                      
                      {/* Authentication Options */}
                      <div className="space-y-2">
                        <button
                          onClick={handleLogin}
                          className="w-full px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                          </svg>
                          Continue with Replit
                        </button>
                        
                        <button
                          onClick={handleGoogleLogin}
                          className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </button>
                        
                        <div className="text-center">
                          <div className="text-xs text-gray-400">or</div>
                        </div>
                        
                        <button
                          onClick={handleConnectWallet}
                          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Connect Crypto Wallet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="space-y-3">
                  {walletState.isConnected ? (
                    <>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Connected Wallet</div>
                        <div className="font-mono text-sm dark:text-[#B3B3B3] text-black">
                          {formatAddress(walletState.address)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Chain ID: {walletState.chainId || 'Unknown'}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Balance</div>
                        <div className="text-lg font-bold dark:text-[#B3B3B3] text-black">
                          {walletState.balance?.toFixed(4) || '0.0000'} ETH
                        </div>
                      </div>

                      <button
                        onClick={handleDisconnectWallet}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                      >
                        Disconnect Wallet
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center py-4">
                        <div className="text-gray-500 mb-3">No wallet connected</div>
                        <div className="text-xs text-gray-400 mb-4">
                          Connect a wallet to access blockchain features
                        </div>
                      </div>
                      <button
                        onClick={handleConnectWallet}
                        className="w-full px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="space-y-3">
                  {portfolioSummary.portfolios?.length > 0 ? (
                    <>
                      {portfolioSummary.portfolios.map((portfolio) => (
                        <div key={portfolio.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium text-sm dark:text-[#B3B3B3] text-black">
                              {portfolio.name}
                            </div>
                            <div className="text-xs text-green-600">
                              +{portfolio.change?.toFixed(2) || 0}%
                            </div>
                          </div>
                          <div className="text-lg font-bold dark:text-[#B3B3B3] text-black">
                            {formatCurrency(portfolio.value)}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={navigateToPortfolio}
                        className="w-full px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                      >
                        Manage Portfolios
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center py-4">
                        <div className="text-gray-500 mb-3">No portfolios yet</div>
                        <div className="text-xs text-gray-400 mb-4">
                          Create your first investment portfolio
                        </div>
                      </div>
                      <button
                        onClick={navigateToPortfolio}
                        className="w-full px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                      >
                        Create Portfolio
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      refreshPortfolio();
                    }}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
                  >
                    Refresh Data
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                >
                  Login with Replit
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Modal (placeholder) */}
      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold dark:text-[#B3B3B3] text-black mb-4">
              Portfolio Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Portfolio management interface would be integrated here.
            </p>
            <button
              onClick={() => setShowPortfolioModal(false)}
              className="w-full px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountDropdown;