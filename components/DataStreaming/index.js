import React, { useState, useEffect } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

const DataStreaming = () => {
  const [streamStatus, setStreamStatus] = useState('disconnected');
  const [dataFeeds, setDataFeeds] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    marketPrice: 0,
    volume: 0,
    volatility: 0,
    sentiment: 'neutral'
  });
  const [connectedSources, setConnectedSources] = useState(new Set());

  // Simulate data streaming from various sources
  useEffect(() => {
    let interval;
    
    if (streamStatus === 'connected') {
      interval = setInterval(() => {
        // Simulate real-time market data
        setRealTimeData({
          marketPrice: 45000 + (Math.random() - 0.5) * 2000,
          volume: Math.random() * 1000000,
          volatility: Math.random() * 100,
          sentiment: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)]
        });

        // Add new data feed entry
        const newFeed = {
          id: Date.now(),
          timestamp: new Date(),
          source: Array.from(connectedSources)[Math.floor(Math.random() * connectedSources.size)] || 'Unknown',
          data: {
            type: ['market_update', 'price_alert', 'volume_spike', 'ai_signal'][Math.floor(Math.random() * 4)],
            value: (Math.random() * 100).toFixed(2),
            confidence: (Math.random() * 100).toFixed(1)
          }
        };

        setDataFeeds(prev => [newFeed, ...prev.slice(0, 19)]); // Keep last 20 entries
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [streamStatus, connectedSources]);

  // Connect to data source
  const connectToSource = (sourceName) => {
    setConnectedSources(prev => new Set([...prev, sourceName]));
    
    if (connectedSources.size === 0) {
      setStreamStatus('connecting');
      setTimeout(() => setStreamStatus('connected'), 1500);
    }
  };

  // Disconnect from data source
  const disconnectFromSource = (sourceName) => {
    setConnectedSources(prev => {
      const newSet = new Set(prev);
      newSet.delete(sourceName);
      
      if (newSet.size === 0) {
        setStreamStatus('disconnected');
      }
      
      return newSet;
    });
  };

  // Simulate web scraping functionality
  const performWebScraping = async (url) => {
    try {
      // Simulated web scraping - in real implementation, this would be server-side
      const scrapedData = {
        id: Date.now(),
        timestamp: new Date(),
        source: 'Web Scraper',
        data: {
          type: 'scraped_data',
          url: url,
          content: 'Financial data extracted via web scraping',
          status: 'success'
        }
      };

      setDataFeeds(prev => [scrapedData, ...prev.slice(0, 19)]);
      alert(`Data successfully scraped from: ${url}`);
    } catch (error) {
      console.error('Web scraping error:', error);
      alert('Web scraping failed. Please check the URL and try again.');
    }
  };

  // Data sources configuration
  const dataSources = [
    { name: 'Delta API', type: 'api', status: 'available' },
    { name: '10Web Integration', type: 'web', status: 'available' },
    { name: 'Market Data Feed', type: 'realtime', status: 'available' },
    { name: 'AI Analysis Engine', type: 'ai', status: 'available' },
    { name: 'Blockchain Monitor', type: 'blockchain', status: 'available' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'disconnected': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500"></div>
            Data Streaming Hub
          </h2>
          <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
            Real-time data integration for {PERRETT_CONFIG.OWNER}
          </p>
        </div>
        <div className={`text-sm font-medium ${getStatusColor(streamStatus)}`}>
          {streamStatus.toUpperCase()}
        </div>
      </div>

      {/* Real-time Metrics */}
      {streamStatus === 'connected' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-[#171717] rounded-lg p-3">
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500 uppercase tracking-wide">
              Market Price
            </div>
            <div className="text-lg font-bold text-[#2F80ED]">
              ${realTimeData.marketPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#171717] rounded-lg p-3">
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500 uppercase tracking-wide">
              Volume
            </div>
            <div className="text-lg font-bold text-purple-500">
              {(realTimeData.volume / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#171717] rounded-lg p-3">
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500 uppercase tracking-wide">
              Volatility
            </div>
            <div className="text-lg font-bold text-orange-500">
              {realTimeData.volatility.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#171717] rounded-lg p-3">
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500 uppercase tracking-wide">
              Sentiment
            </div>
            <div className={`text-lg font-bold ${getSentimentColor(realTimeData.sentiment)}`}>
              {realTimeData.sentiment.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Data Sources */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-3">
          Available Data Sources
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {dataSources.map((source) => (
            <div key={source.name} className="flex items-center justify-between bg-gray-50 dark:bg-[#171717] rounded-lg p-3">
              <div>
                <div className="font-medium dark:text-[#B3B3B3] text-gray-900">{source.name}</div>
                <div className="text-xs dark:text-[#B3B3B3] text-gray-500">{source.type}</div>
              </div>
              <button
                onClick={() => 
                  connectedSources.has(source.name) 
                    ? disconnectFromSource(source.name)
                    : connectToSource(source.name)
                }
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  connectedSources.has(source.name)
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {connectedSources.has(source.name) ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Web Scraping Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-3">
          Web Scraping Tools
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter URL to scrape data from..."
            className="flex-1 px-3 py-2 border dark:border-[#171717] border-gray-300 rounded-lg bg-white dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-900 focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                performWebScraping(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder*="URL"]');
              if (input.value) {
                performWebScraping(input.value);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            Scrape
          </button>
        </div>
        <p className="text-xs dark:text-[#B3B3B3] text-gray-500 mt-2">
          Extract financial data from websites using AI-powered web scraping
        </p>
      </div>

      {/* Live Data Feed */}
      <div>
        <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-3">
          Live Data Feed ({dataFeeds.length})
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {dataFeeds.length === 0 ? (
            <div className="text-center py-8 dark:text-[#B3B3B3] text-gray-500">
              Connect to data sources to start streaming
            </div>
          ) : (
            dataFeeds.map((feed) => (
              <div key={feed.id} className="bg-gray-50 dark:bg-[#171717] rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium dark:text-[#B3B3B3] text-gray-900">
                    {feed.source}
                  </span>
                  <span className="text-xs dark:text-[#B3B3B3] text-gray-500">
                    {feed.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs dark:text-[#B3B3B3] text-gray-600 mb-1">
                  Type: {feed.data.type} • Value: {feed.data.value}
                  {feed.data.confidence && ` • Confidence: ${feed.data.confidence}%`}
                </div>
                {feed.data.url && (
                  <div className="text-xs dark:text-[#B3B3B3] text-gray-400 truncate">
                    Source: {feed.data.url}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="mt-6 text-center">
        <div className="text-sm dark:text-[#B3B3B3] text-gray-600">
          Connected Sources: {connectedSources.size} | 
          Total Data Points: {dataFeeds.length} | 
          Status: <span className={getStatusColor(streamStatus)}>{streamStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default DataStreaming;