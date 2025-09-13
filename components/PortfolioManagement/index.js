import React, { useState, useEffect } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

const PortfolioManagement = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    name: '',
    description: '',
    riskLevel: 'moderate',
    initialBalance: '',
    currency: 'USD'
  });

  // Initialize with sample portfolios for demo
  useEffect(() => {
    const samplePortfolios = [
      {
        id: 'portfolio_1',
        name: 'Growth Investment Portfolio',
        description: 'High-growth tech and crypto investments',
        riskLevel: 'aggressive',
        balance: 125750.00,
        currency: 'USD',
        assets: [
          { symbol: 'BTC', name: 'Bitcoin', amount: 2.5, value: 68750.00, allocation: 55.0 },
          { symbol: 'ETH', name: 'Ethereum', amount: 15.0, value: 37500.00, allocation: 30.0 },
          { symbol: 'TSLA', name: 'Tesla Inc.', amount: 50, value: 12500.00, allocation: 10.0 },
          { symbol: 'AAPL', name: 'Apple Inc.', amount: 32, value: 6000.00, allocation: 5.0 }
        ],
        performance: {
          dayChange: 2.3,
          weekChange: 8.7,
          monthChange: 15.2,
          yearChange: 45.8
        },
        createdAt: '2024-01-15',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'portfolio_2',
        name: 'Conservative Savings',
        description: 'Stable bonds and dividend stocks',
        riskLevel: 'conservative',
        balance: 85000.00,
        currency: 'USD',
        assets: [
          { symbol: 'SPY', name: 'S&P 500 ETF', amount: 100, value: 45000.00, allocation: 52.9 },
          { symbol: 'VTI', name: 'Total Stock Market ETF', amount: 80, value: 20000.00, allocation: 23.5 },
          { symbol: 'BND', name: 'Total Bond Market ETF', amount: 200, value: 15000.00, allocation: 17.6 },
          { symbol: 'VGIT', name: 'Intermediate-Term Treasury ETF', amount: 50, value: 5000.00, allocation: 5.9 }
        ],
        performance: {
          dayChange: 0.5,
          weekChange: 1.2,
          monthChange: 3.4,
          yearChange: 8.9
        },
        createdAt: '2024-02-20',
        lastUpdated: new Date().toISOString()
      }
    ];
    setPortfolios(samplePortfolios);
    setSelectedPortfolio(samplePortfolios[0]);
  }, []);

  const handleCreatePortfolio = () => {
    if (!newPortfolio.name || !newPortfolio.initialBalance) {
      alert('Please fill in portfolio name and initial balance.');
      return;
    }

    const portfolio = {
      id: `portfolio_${Date.now()}`,
      name: newPortfolio.name,
      description: newPortfolio.description,
      riskLevel: newPortfolio.riskLevel,
      balance: parseFloat(newPortfolio.initialBalance),
      currency: newPortfolio.currency,
      assets: [],
      performance: {
        dayChange: 0,
        weekChange: 0,
        monthChange: 0,
        yearChange: 0
      },
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    };

    setPortfolios([...portfolios, portfolio]);
    setSelectedPortfolio(portfolio);
    setIsCreating(false);
    setNewPortfolio({
      name: '',
      description: '',
      riskLevel: 'moderate',
      initialBalance: '',
      currency: 'USD'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    try {
      if (currency === 'BTC' || currency === 'ETH') {
        return `${amount.toFixed(4)} ${currency}`;
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      // Fallback for unsupported currencies
      return `${amount.toFixed(2)} ${currency}`;
    }
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    const color = value >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={color}>
        {sign}{value.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-[#B3B3B3] text-black mb-2">
              📊 Portfolio Management
            </h2>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
              Create and manage your investment portfolios • {PERRETT_CONFIG.OWNER}
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Portfolio
          </button>
        </div>
      </div>

      {/* Create Portfolio Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-4">
              Create New Portfolio
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                  Portfolio Name
                </label>
                <input
                  type="text"
                  value={newPortfolio.name}
                  onChange={(e) => setNewPortfolio({...newPortfolio, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                  placeholder="e.g., Tech Growth Portfolio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newPortfolio.description}
                  onChange={(e) => setNewPortfolio({...newPortfolio, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                  placeholder="Portfolio description..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  value={newPortfolio.riskLevel}
                  onChange={(e) => setNewPortfolio({...newPortfolio, riskLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                    Initial Balance
                  </label>
                  <input
                    type="number"
                    value={newPortfolio.initialBalance}
                    onChange={(e) => setNewPortfolio({...newPortfolio, initialBalance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={newPortfolio.currency}
                    onChange={(e) => setNewPortfolio({...newPortfolio, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all dark:border-gray-600 dark:text-[#B3B3B3] dark:hover:bg-[#171717]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePortfolio}
                className="flex-1 px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                Create Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            onClick={() => setSelectedPortfolio(portfolio)}
            className={`bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-4 cursor-pointer transition-all border-2 ${
              selectedPortfolio?.id === portfolio.id 
                ? 'border-[#2F80ED]' 
                : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold dark:text-[#B3B3B3] text-black">{portfolio.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                portfolio.riskLevel === 'aggressive' ? 'bg-red-100 text-red-700' :
                portfolio.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {portfolio.riskLevel.toUpperCase()}
              </span>
            </div>
            
            <div className="mb-2">
              <div className="text-2xl font-bold dark:text-[#B3B3B3] text-black">
                {formatCurrency(portfolio.balance, portfolio.currency)}
              </div>
              <div className="text-sm dark:text-[#B3B3B3] text-gray-600">
                Day: {formatPercentage(portfolio.performance.dayChange)}
              </div>
            </div>

            <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
              {portfolio.assets.length} assets • Created {portfolio.createdAt}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Portfolio Details */}
      {selectedPortfolio && (
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-2">
                {selectedPortfolio.name}
              </h3>
              <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
                {selectedPortfolio.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold dark:text-[#B3B3B3] text-black">
                {formatCurrency(selectedPortfolio.balance, selectedPortfolio.currency)}
              </div>
              <div className="text-sm dark:text-[#B3B3B3] text-gray-500">
                Total Portfolio Value
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Day', value: selectedPortfolio.performance.dayChange },
              { label: 'Week', value: selectedPortfolio.performance.weekChange },
              { label: 'Month', value: selectedPortfolio.performance.monthChange },
              { label: 'Year', value: selectedPortfolio.performance.yearChange }
            ].map((metric) => (
              <div key={metric.label} className="bg-gray-50 dark:bg-[#171717] rounded-lg p-3">
                <div className="text-xs dark:text-[#B3B3B3] text-gray-500 mb-1">{metric.label}</div>
                <div className="font-semibold">{formatPercentage(metric.value)}</div>
              </div>
            ))}
          </div>

          {/* Asset Breakdown */}
          <div>
            <h4 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-4">
              Asset Allocation
            </h4>
            
            {selectedPortfolio.assets.length > 0 ? (
              <div className="space-y-3">
                {selectedPortfolio.assets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#171717] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {asset.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium dark:text-[#B3B3B3] text-black">{asset.name}</div>
                        <div className="text-sm dark:text-[#B3B3B3] text-gray-600">
                          {asset.amount} {asset.symbol}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold dark:text-[#B3B3B3] text-black">
                        {formatCurrency(asset.value)}
                      </div>
                      <div className="text-sm dark:text-[#B3B3B3] text-gray-600">
                        {asset.allocation.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-[#B3B3B3]">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                </svg>
                <p>No assets in this portfolio yet</p>
                <p className="text-sm">Add investments to start tracking performance</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManagement;