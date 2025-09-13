import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';

const GlobalWalletStatus = ({ position = 'top', showDetails = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    walletState,
    portfolioSummary,
    isAuthenticated,
    hasWalletOrAuth,
    formatAddress,
    formatCurrency,
    refreshPortfolio
  } = useWallet();

  // Show/hide status bar based on connection state
  useEffect(() => {
    setIsVisible(hasWalletOrAuth);
    if (hasWalletOrAuth) {
      setLastUpdate(new Date());
    }
  }, [hasWalletOrAuth]);

  // Monitor wallet state changes and create notifications
  useEffect(() => {
    if (walletState.isConnected && walletState.lastUpdated) {
      const updateTime = new Date(walletState.lastUpdated);
      if (updateTime > lastUpdate) {
        const notification = {
          id: Date.now(),
          type: 'wallet_update',
          title: 'Wallet Updated',
          message: `Balance: ${walletState.balance?.toFixed(4) || '0.0000'} ETH`,
          timestamp: updateTime,
          icon: '💰'
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
        setLastUpdate(updateTime);
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 3000);
      }
    }
  }, [walletState.lastUpdated, walletState.balance, lastUpdate]);

  // Monitor portfolio changes
  useEffect(() => {
    if (portfolioSummary.totalValue > 0) {
      // Check for significant portfolio changes (> 5%)
      const changeThreshold = 5;
      if (Math.abs(portfolioSummary.dayChange) > changeThreshold) {
        const notification = {
          id: Date.now() + 1,
          type: 'portfolio_alert',
          title: `Portfolio ${portfolioSummary.dayChange > 0 ? 'Gain' : 'Loss'}`,
          message: `${portfolioSummary.dayChange > 0 ? '+' : ''}${portfolioSummary.dayChange.toFixed(2)}% today`,
          timestamp: new Date(),
          icon: portfolioSummary.dayChange > 0 ? '📈' : '📉'
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 4)]);
        
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    }
  }, [portfolioSummary.dayChange, portfolioSummary.totalValue]);

  // Real-time data refresh every 30 seconds
  useEffect(() => {
    if (hasWalletOrAuth) {
      const interval = setInterval(() => {
        refreshPortfolio();
        setLastUpdate(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [hasWalletOrAuth, refreshPortfolio]);

  if (!isVisible) return null;

  const getPositionClasses = () => {
    const baseClasses = "fixed left-0 right-0 z-40 bg-white dark:bg-[#0D0D0D] border-gray-200 dark:border-gray-700 shadow-sm";
    
    switch (position) {
      case 'top':
        return `${baseClasses} top-0 border-b`;
      case 'bottom':
        return `${baseClasses} bottom-0 border-t`;
      default:
        return `${baseClasses} top-0 border-b`;
    }
  };

  const getTotalValue = () => {
    const walletValue = walletState.balance ? walletState.balance * 2500 : 0; // Assuming ETH price
    return portfolioSummary.totalValue + walletValue;
  };

  const getConnectionIcon = () => {
    if (walletState.isConnected && isAuthenticated) {
      return '🔗✅'; // Both connected
    } else if (walletState.isConnected) {
      return '🔗'; // Wallet only
    } else if (isAuthenticated) {
      return '✅'; // Auth only
    }
    return '⚪'; // Neither
  };

  const getStatusText = () => {
    if (walletState.isConnected && isAuthenticated) {
      return 'Fully Connected';
    } else if (walletState.isConnected) {
      return 'Wallet Connected';
    } else if (isAuthenticated) {
      return 'Authenticated';
    }
    return 'Connecting...';
  };

  return (
    <>
      {/* Main Status Bar */}
      <div className={getPositionClasses()}>
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left: Connection Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getConnectionIcon()}</span>
                <div className="hidden sm:block">
                  <div className="text-xs font-medium dark:text-[#B3B3B3] text-black">
                    {getStatusText()}
                  </div>
                  {walletState.address && (
                    <div className="text-xs text-gray-500">
                      {formatAddress(walletState.address)}
                    </div>
                  )}
                </div>
              </div>

              {showDetails && (
                <>
                  {/* Wallet Balance */}
                  {walletState.isConnected && (
                    <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      <span className="text-xs text-gray-500">Wallet:</span>
                      <span className="text-xs font-medium dark:text-[#B3B3B3] text-black">
                        {walletState.balance?.toFixed(4) || '0.0000'} ETH
                      </span>
                    </div>
                  )}

                  {/* Portfolio Value */}
                  {portfolioSummary.totalValue > 0 && (
                    <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      <span className="text-xs text-gray-500">Portfolio:</span>
                      <span className="text-xs font-medium dark:text-[#B3B3B3] text-black">
                        {formatCurrency(portfolioSummary.totalValue)}
                      </span>
                      <span className={`text-xs ${portfolioSummary.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioSummary.dayChange >= 0 ? '+' : ''}{portfolioSummary.dayChange?.toFixed(2) || 0}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Center: Total Value (on larger screens) */}
            {showDetails && getTotalValue() > 0 && (
              <div className="hidden xl:flex items-center gap-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Total Assets</div>
                  <div className="font-bold dark:text-[#B3B3B3] text-black">
                    {formatCurrency(getTotalValue())}
                  </div>
                </div>
              </div>
            )}

            {/* Right: Controls and Notifications */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.414V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#0D0D0D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-3">
                        <div className="text-sm font-medium dark:text-[#B3B3B3] text-black mb-2">
                          Recent Activity
                        </div>
                        {notifications.map((notification) => (
                          <div key={notification.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span className="text-sm">{notification.icon}</span>
                            <div className="flex-1">
                              <div className="text-xs font-medium dark:text-[#B3B3B3] text-black">
                                {notification.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {notification.message}
                              </div>
                              <div className="text-xs text-gray-400">
                                {notification.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Refresh Button */}
              <button
                onClick={() => {
                  refreshPortfolio();
                  setLastUpdate(new Date());
                }}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Refresh data"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Last Update Time */}
              <div className="text-xs text-gray-400 hidden sm:block">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className="bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 pointer-events-auto animate-fade-in-right"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{notification.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium dark:text-[#B3B3B3] text-black">
                    {notification.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {notification.message}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

// Smaller mobile-friendly version
export const MobileWalletStatus = () => {
  const { walletState, isAuthenticated, formatAddress } = useWallet();

  if (!walletState.isConnected && !isAuthenticated) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0D0D0D] border-t border-gray-200 dark:border-gray-700 p-2 sm:hidden z-40">
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${walletState.isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-xs dark:text-[#B3B3B3] text-black">
            {walletState.isConnected ? formatAddress(walletState.address) : 'Not connected'}
          </span>
        </div>
        {walletState.balance && (
          <div className="text-xs dark:text-[#B3B3B3] text-black">
            {walletState.balance.toFixed(4)} ETH
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalWalletStatus;