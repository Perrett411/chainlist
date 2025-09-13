import React, { useState, useEffect, useCallback } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';
import { useWallet } from '../../contexts/WalletContext';

const DeltaTracker = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [marketData, setMarketData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [deltaMetrics, setDeltaMetrics] = useState({});
  const [exchangeConnections, setExchangeConnections] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    user,
    isAuthenticated,
    hasWalletOrAuth,
    formatCurrency,
    formatAddress
  } = useWallet();

  // Supported exchanges for connections
  const supportedExchanges = [
    { id: 'binance', name: 'Binance', icon: '🟡', type: 'crypto' },
    { id: 'coinbase', name: 'Coinbase Pro', icon: '🔵', type: 'crypto' },
    { id: 'kraken', name: 'Kraken', icon: '🟣', type: 'crypto' },
    { id: 'gemini', name: 'Gemini', icon: '♊', type: 'crypto' },
    { id: 'kucoin', name: 'KuCoin', icon: '🟢', type: 'crypto' },
    { id: 'nasdaq', name: 'NASDAQ', icon: '📈', type: 'stocks' },
    { id: 'nyse', name: 'NYSE', icon: '🏛️', type: 'stocks' },
    { id: 'forex', name: 'Forex.com', icon: '💱', type: 'forex' },
  ];

  // Asset types with real-time support
  const assetTypes = [
    { id: 'crypto', name: 'Cryptocurrency', icon: '₿', count: '10,000+' },
    { id: 'stocks', name: 'Stocks', icon: '📊', count: '8,000+' },
    { id: 'etf', name: 'ETFs', icon: '📈', count: '3,000+' },
    { id: 'forex', name: 'Forex', icon: '💱', count: '50+' },
  ];

  // Initialize with demo portfolios and real market data
  useEffect(() => {
    initializePortfolios();
    fetchMarketData();
    setupRealTimeUpdates();
    
    const interval = setInterval(() => {
      fetchMarketData();
      calculateDeltas();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const initializePortfolios = () => {
    const demoPortfolios = [
      {
        id: 'delta_portfolio_1',
        name: 'Multi-Asset Growth',
        description: 'Diversified portfolio across crypto, stocks, and ETFs',
        totalValue: 125750.00,
        currency: 'USD',
        riskLevel: 'aggressive',
        assets: [
          {
            id: 'btc_1',
            symbol: 'BTC',
            name: 'Bitcoin',
            assetType: 'crypto',
            exchange: 'binance',
            quantity: '2.5',
            averageCost: '25000.00',
            currentPrice: '27500.00',
            value: 68750.00,
            allocation: 54.7,
            dayChange: 2.3,
            weekChange: 8.7,
            monthChange: 15.2
          },
          {
            id: 'eth_1',
            symbol: 'ETH',
            name: 'Ethereum',
            assetType: 'crypto',
            exchange: 'coinbase',
            quantity: '15.0',
            averageCost: '2000.00',
            currentPrice: '2500.00',
            value: 37500.00,
            allocation: 29.8,
            dayChange: 1.8,
            weekChange: 5.2,
            monthChange: 12.1
          },
          {
            id: 'tsla_1',
            symbol: 'TSLA',
            name: 'Tesla Inc.',
            assetType: 'stocks',
            exchange: 'nasdaq',
            quantity: '50',
            averageCost: '200.00',
            currentPrice: '250.00',
            value: 12500.00,
            allocation: 9.9,
            dayChange: -1.2,
            weekChange: 3.8,
            monthChange: 8.5
          },
          {
            id: 'spy_1',
            symbol: 'SPY',
            name: 'SPDR S&P 500 ETF',
            assetType: 'etf',
            exchange: 'nyse',
            quantity: '20',
            averageCost: '350.00',
            currentPrice: '375.00',
            value: 7500.00,
            allocation: 6.0,
            dayChange: 0.5,
            weekChange: 1.2,
            monthChange: 4.2
          }
        ],
        performance: {
          totalReturn: 15750.00,
          totalReturnPercent: 14.32,
          dayChange: 1850.00,
          dayChangePercent: 1.49,
          weekChange: 8200.00,
          weekChangePercent: 6.98,
          monthChange: 15750.00,
          monthChangePercent: 14.32,
          yearChange: 35250.00,
          yearChangePercent: 38.95,
        },
        lastUpdated: new Date().toISOString()
      }
    ];

    setPortfolios(demoPortfolios);
    setSelectedPortfolio(demoPortfolios[0]);
  };

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      // Fetch crypto data from CoinGecko
      const cryptoSymbols = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot'];
      const cryptoResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbols.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
      );
      
      let marketDataUpdate = {};
      
      if (cryptoResponse.ok) {
        const cryptoData = await cryptoResponse.json();
        Object.entries(cryptoData).forEach(([coin, data]) => {
          const symbol = coin.toUpperCase().replace('BITCOIN', 'BTC').replace('ETHEREUM', 'ETH');
          marketDataUpdate[symbol] = {
            symbol: symbol,
            price: data.usd,
            marketCap: data.usd_market_cap,
            volume24h: data.usd_24h_vol,
            change24h: data.usd_24h_change,
            lastUpdated: data.last_updated_at,
            type: 'crypto'
          };
        });
      }

      // Simulate stock data (in production, use real APIs like Alpha Vantage, IEX, etc.)
      const stockData = {
        'TSLA': { price: 250.00, change24h: -1.2, volume24h: 45000000, type: 'stocks' },
        'AAPL': { price: 185.00, change24h: 0.8, volume24h: 52000000, type: 'stocks' },
        'GOOGL': { price: 142.00, change24h: 1.5, volume24h: 28000000, type: 'stocks' },
        'SPY': { price: 375.00, change24h: 0.5, volume24h: 75000000, type: 'etf' },
        'QQQ': { price: 310.00, change24h: 1.2, volume24h: 45000000, type: 'etf' },
      };

      Object.entries(stockData).forEach(([symbol, data]) => {
        marketDataUpdate[symbol] = {
          symbol,
          ...data,
          lastUpdated: Date.now() / 1000
        };
      });

      setMarketData(marketDataUpdate);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDeltas = useCallback(() => {
    if (!selectedPortfolio || !marketData) return;

    const deltas = {};
    selectedPortfolio.assets.forEach(asset => {
      const currentMarketData = marketData[asset.symbol];
      if (currentMarketData) {
        const currentValue = parseFloat(asset.quantity) * currentMarketData.price;
        const costBasis = parseFloat(asset.quantity) * parseFloat(asset.averageCost);
        const unrealizedPnL = currentValue - costBasis;
        const unrealizedPnLPercent = (unrealizedPnL / costBasis) * 100;

        deltas[asset.id] = {
          currentPrice: currentMarketData.price,
          currentValue,
          costBasis,
          unrealizedPnL,
          unrealizedPnLPercent,
          dayChange: currentMarketData.change24h || 0,
          priceChange24h: currentMarketData.price * (currentMarketData.change24h || 0) / 100,
        };
      }
    });

    setDeltaMetrics(deltas);
  }, [selectedPortfolio, marketData]);

  const setupRealTimeUpdates = () => {
    // In production, this would connect to WebSocket feeds
    console.log('Setting up real-time market data updates...');
  };

  const connectExchange = async (exchange) => {
    // Simulate exchange connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newConnection = {
      id: `connection_${Date.now()}`,
      exchangeName: exchange.id,
      name: exchange.name,
      type: exchange.type,
      status: 'connected',
      apiKeyConnected: true,
      lastSync: new Date().toISOString(),
      accountBalance: Math.random() * 10000,
      tradingPairs: exchange.type === 'crypto' ? ['BTC/USD', 'ETH/USD', 'ADA/USD'] : 
                    exchange.type === 'stocks' ? ['TSLA', 'AAPL', 'GOOGL'] : 
                    ['EUR/USD', 'GBP/USD', 'JPY/USD']
    };

    setExchangeConnections(prev => [...prev, newConnection]);
    return newConnection;
  };

  const createPriceAlert = (symbol, targetPrice, alertType) => {
    const alert = {
      id: `alert_${Date.now()}`,
      symbol,
      targetPrice: parseFloat(targetPrice),
      alertType, // 'above', 'below', 'change_percent'
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setAlerts(prev => [...prev, alert]);
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

  const formatDelta = (value) => {
    const sign = value >= 0 ? '+' : '';
    const color = value >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={color}>
        {sign}{formatCurrency(value)}
      </span>
    );
  };

  if (!hasWalletOrAuth) {
    return (
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-4">
          Authentication Required
        </h3>
        <p className="dark:text-[#B3B3B3] text-gray-600 mb-6">
          Please connect your wallet or sign in to access Delta Tracker features.
        </p>
        <button
          onClick={() => window.location.href = '/api/login'}
          className="px-6 py-3 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-[#B3B3B3] text-black mb-2">
              📊 Delta Tracker
            </h2>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
              Advanced multi-asset portfolio tracking • Real-time deltas • {PERRETT_CONFIG.OWNER} 
              <span className="text-xs ml-2">PERRETT and Associate Private Investment Firm LLC</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm dark:text-[#B3B3B3] text-gray-500">Last Update</div>
            <div className="text-sm font-medium dark:text-[#B3B3B3] text-black">
              {lastUpdate.toLocaleTimeString()}
            </div>
            <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'overview', name: 'Portfolio Overview', icon: '📊' },
            { id: 'exchanges', name: 'Exchange Connections', icon: '🔗' },
            { id: 'assets', name: 'Asset Types', icon: '💰' },
            { id: 'alerts', name: 'Price Alerts', icon: '🔔' },
            { id: 'analytics', name: 'Delta Analytics', icon: '📈' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#2F80ED] text-white'
                  : 'dark:bg-[#181818] bg-gray-100 dark:text-[#B3B3B3] text-gray-700 hover:bg-gray-200 dark:hover:bg-[#222]'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Overview Tab */}
      {activeTab === 'overview' && selectedPortfolio && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Portfolio Summary */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
            <h3 className="text-lg font-bold dark:text-[#B3B3B3] text-black mb-4">
              {selectedPortfolio.name}
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm dark:text-[#B3B3B3] text-gray-500">Total Value</div>
                <div className="text-xl font-bold dark:text-[#B3B3B3] text-black">
                  {formatCurrency(selectedPortfolio.totalValue)}
                </div>
              </div>
              <div>
                <div className="text-sm dark:text-[#B3B3B3] text-gray-500">24h Change</div>
                <div className="text-lg font-semibold">
                  {formatDelta(selectedPortfolio.performance.dayChange)}
                </div>
              </div>
              <div>
                <div className="text-sm dark:text-[#B3B3B3] text-gray-500">Total Return</div>
                <div className="text-lg font-semibold">
                  {formatPercentage(selectedPortfolio.performance.totalReturnPercent)}
                </div>
              </div>
              <div>
                <div className="text-sm dark:text-[#B3B3B3] text-gray-500">Risk Level</div>
                <div className="text-sm font-medium dark:text-[#B3B3B3] text-black capitalize">
                  {selectedPortfolio.riskLevel}
                </div>
              </div>
            </div>

            {/* Asset List */}
            <div className="space-y-3">
              <h4 className="font-semibold dark:text-[#B3B3B3] text-black">Holdings</h4>
              {selectedPortfolio.assets.map(asset => {
                const delta = deltaMetrics[asset.id];
                return (
                  <div key={asset.id} className="flex items-center justify-between p-3 dark:bg-[#181818] bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#2F80ED] rounded-full flex items-center justify-center text-white font-bold">
                        {asset.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium dark:text-[#B3B3B3] text-black">{asset.name}</div>
                        <div className="text-sm dark:text-[#B3B3B3] text-gray-500">
                          {asset.quantity} {asset.symbol} • {asset.assetType}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium dark:text-[#B3B3B3] text-black">
                        {formatCurrency(delta?.currentValue || asset.value)}
                      </div>
                      <div className="text-sm">
                        {delta ? formatPercentage(delta.unrealizedPnLPercent) : formatPercentage(asset.dayChange)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
            <h3 className="text-lg font-bold dark:text-[#B3B3B3] text-black mb-4">Performance</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm dark:text-[#B3B3B3] text-gray-500 mb-1">24h Change</div>
                <div className="text-lg font-semibold">
                  {formatDelta(selectedPortfolio.performance.dayChange)}
                </div>
                <div className="text-sm">
                  {formatPercentage(selectedPortfolio.performance.dayChangePercent)}
                </div>
              </div>
              
              <div>
                <div className="text-sm dark:text-[#B3B3B3] text-gray-500 mb-1">7d Change</div>
                <div className="text-lg font-semibold">
                  {formatDelta(selectedPortfolio.performance.weekChange)}
                </div>
                <div className="text-sm">
                  {formatPercentage(selectedPortfolio.performance.weekChangePercent)}
                </div>
              </div>
              
              <div>
                <div className="text-sm dark:text-[#B3B3B3] text-gray-500 mb-1">30d Change</div>
                <div className="text-lg font-semibold">
                  {formatDelta(selectedPortfolio.performance.monthChange)}
                </div>
                <div className="text-sm">
                  {formatPercentage(selectedPortfolio.performance.monthChangePercent)}
                </div>
              </div>
              
              <div>
                <div className="text-sm dark:text-[#B3B3B3] text-gray-500 mb-1">1y Change</div>
                <div className="text-lg font-semibold">
                  {formatDelta(selectedPortfolio.performance.yearChange)}
                </div>
                <div className="text-sm">
                  {formatPercentage(selectedPortfolio.performance.yearChangePercent)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exchange Connections Tab */}
      {activeTab === 'exchanges' && (
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
          <h3 className="text-lg font-bold dark:text-[#B3B3B3] text-black mb-6">Exchange Connections</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {supportedExchanges.map(exchange => (
              <div key={exchange.id} className="dark:bg-[#181818] bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{exchange.icon}</div>
                  <div>
                    <div className="font-medium dark:text-[#B3B3B3] text-black">{exchange.name}</div>
                    <div className="text-sm dark:text-[#B3B3B3] text-gray-500 capitalize">{exchange.type}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => connectExchange(exchange)}
                  className="w-full px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Connect API
                </button>
              </div>
            ))}
          </div>

          {/* Connected Exchanges */}
          {exchangeConnections.length > 0 && (
            <div>
              <h4 className="font-semibold dark:text-[#B3B3B3] text-black mb-4">Connected Exchanges</h4>
              <div className="space-y-3">
                {exchangeConnections.map(connection => (
                  <div key={connection.id} className="flex items-center justify-between p-4 dark:bg-[#181818] bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium dark:text-[#B3B3B3] text-black">{connection.name}</div>
                        <div className="text-sm dark:text-[#B3B3B3] text-gray-500">
                          Balance: {formatCurrency(connection.accountBalance)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm dark:text-[#B3B3B3] text-gray-500">
                      Connected • {connection.tradingPairs.length} pairs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset Types Tab */}
      {activeTab === 'assets' && (
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
          <h3 className="text-lg font-bold dark:text-[#B3B3B3] text-black mb-6">Supported Asset Types</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assetTypes.map(assetType => (
              <div key={assetType.id} className="dark:bg-[#181818] bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">{assetType.icon}</div>
                <div className="font-semibold dark:text-[#B3B3B3] text-black mb-2">{assetType.name}</div>
                <div className="text-2xl font-bold text-[#2F80ED] mb-1">{assetType.count}</div>
                <div className="text-sm dark:text-[#B3B3B3] text-gray-500">Assets Supported</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold dark:text-[#B3B3B3] text-black">Price Alerts</h3>
            <button
              onClick={() => createPriceAlert('BTC', 30000, 'above')}
              className="px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              + Create Alert
            </button>
          </div>
          
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔔</div>
              <div className="dark:text-[#B3B3B3] text-gray-500">No price alerts set</div>
              <div className="text-sm dark:text-[#B3B3B3] text-gray-400 mt-2">
                Create alerts to get notified of price movements
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-4 dark:bg-[#181818] bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium dark:text-[#B3B3B3] text-black">
                      {alert.symbol} {alert.alertType} {formatCurrency(alert.targetPrice)}
                    </div>
                    <div className="text-sm dark:text-[#B3B3B3] text-gray-500">
                      Created {new Date(alert.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${alert.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {alert.isActive ? 'Active' : 'Triggered'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delta Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
          <h3 className="text-lg font-bold dark:text-[#B3B3B3] text-black mb-6">Delta Analytics</h3>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold dark:text-[#B3B3B3] text-black mb-4">Real-Time Deltas</h4>
              <div className="space-y-3">
                {Object.entries(deltaMetrics).map(([assetId, delta]) => {
                  const asset = selectedPortfolio?.assets.find(a => a.id === assetId);
                  if (!asset) return null;
                  
                  return (
                    <div key={assetId} className="flex items-center justify-between p-3 dark:bg-[#181818] bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium dark:text-[#B3B3B3] text-black">{asset.symbol}</div>
                        <div className="text-sm dark:text-[#B3B3B3] text-gray-500">
                          {formatCurrency(delta.currentPrice)} per unit
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatDelta(delta.unrealizedPnL)}
                        </div>
                        <div className="text-sm">
                          {formatPercentage(delta.unrealizedPnLPercent)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold dark:text-[#B3B3B3] text-black mb-4">Performance Summary</h4>
              <div className="space-y-4">
                <div className="p-4 dark:bg-[#181818] bg-gray-50 rounded-lg">
                  <div className="text-sm dark:text-[#B3B3B3] text-gray-500 mb-1">Best Performer</div>
                  <div className="font-medium dark:text-[#B3B3B3] text-black">Bitcoin (BTC)</div>
                  <div className="text-sm text-green-600">+15.2% this month</div>
                </div>
                
                <div className="p-4 dark:bg-[#181818] bg-gray-50 rounded-lg">
                  <div className="text-sm dark:text-[#B3B3B3] text-gray-500 mb-1">Largest Holding</div>
                  <div className="font-medium dark:text-[#B3B3B3] text-black">Bitcoin (BTC)</div>
                  <div className="text-sm dark:text-[#B3B3B3] text-gray-500">54.7% allocation</div>
                </div>
                
                <div className="p-4 dark:bg-[#181818] bg-gray-50 rounded-lg">
                  <div className="text-sm dark:text-[#B3B3B3] text-gray-500 mb-1">Portfolio Diversity</div>
                  <div className="font-medium dark:text-[#B3B3B3] text-black">4 Asset Classes</div>
                  <div className="text-sm dark:text-[#B3B3B3] text-gray-500">Moderate risk level</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeltaTracker;