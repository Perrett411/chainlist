import React, { useState, useEffect } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

const QuantumLockChain = () => {
  const [chainStatus, setChainStatus] = useState('initializing');
  const [quantumMetrics, setQuantumMetrics] = useState({
    energyEfficiency: 0,
    securityLevel: 0,
    transactionSpeed: 0,
    quantumEntanglement: 0
  });
  const [blocks, setBlocks] = useState([]);
  const [isSecure, setIsSecure] = useState(false);

  // Initialize Quantum Lock Chain
  useEffect(() => {
    const initializeChain = () => {
      setChainStatus('running');
      
      // Simulate quantum metrics based on E=mc² principles
      const updateMetrics = () => {
        setQuantumMetrics({
          energyEfficiency: Math.random() * 100,
          securityLevel: 95 + Math.random() * 5, // High security due to quantum encryption
          transactionSpeed: 50 + Math.random() * 50,
          quantumEntanglement: 80 + Math.random() * 20
        });
      };

      // Create genesis block
      const genesisBlock = {
        index: 0,
        timestamp: Date.now(),
        data: {
          type: 'genesis',
          owner: PERRETT_CONFIG.OWNER,
          principle: PERRETT_CONFIG.QUANTUM_PRINCIPLES.MASS_ENERGY_EQUIVALENCE
        },
        hash: generateQuantumHash('genesis_perrett_associates'),
        previousHash: '0',
        quantumSignature: 'Q_' + Math.random().toString(36).substr(2, 9)
      };

      setBlocks([genesisBlock]);
      setIsSecure(true);
      updateMetrics();

      // Update metrics every 3 seconds
      const interval = setInterval(updateMetrics, 3000);
      return () => clearInterval(interval);
    };

    const timer = setTimeout(initializeChain, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Generate quantum hash (simplified simulation)
  const generateQuantumHash = (data) => {
    const hash = btoa(data + Date.now() + Math.random()).substr(0, 16);
    return 'QH_' + hash;
  };

  // Add new block to chain
  const addBlock = (data) => {
    if (!isSecure) return false;

    const newBlock = {
      index: blocks.length,
      timestamp: Date.now(),
      data: data,
      hash: generateQuantumHash(JSON.stringify(data)),
      previousHash: blocks[blocks.length - 1]?.hash || '0',
      quantumSignature: 'Q_' + Math.random().toString(36).substr(2, 9)
    };

    setBlocks(prev => [...prev, newBlock]);
    return true;
  };

  // Simulate financial transaction
  const simulateTransaction = () => {
    const transactionData = {
      type: 'financial_transaction',
      from: PERRETT_CONFIG.OWNER,
      amount: (Math.random() * 10000).toFixed(2),
      currency: 'QTC', // Quantum Token Coin
      purpose: 'Investment Portfolio Rebalancing',
      ai_approved: true,
      risk_level: 'low'
    };

    const success = addBlock(transactionData);
    if (success) {
      alert(`Transaction added to Quantum Lock Chain!\nAmount: ${transactionData.amount} QTC\nPurpose: ${transactionData.purpose}`);
    }
  };

  // Simulate AI analysis
  const performAIAnalysis = () => {
    const analysisData = {
      type: 'ai_analysis',
      analyst: PERRETT_CONFIG.AI_NAME,
      analysis: 'Market trend analysis using quantum algorithms',
      recommendation: 'Diversify portfolio with 15% crypto allocation',
      confidence: (85 + Math.random() * 15).toFixed(1) + '%',
      quantum_verified: true
    };

    const success = addBlock(analysisData);
    if (success) {
      alert(`AI Analysis completed and secured!\nRecommendation: ${analysisData.recommendation}\nConfidence: ${analysisData.confidence}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'initializing': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getMetricColor = (value) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            Quantum Lock Chain
          </h2>
          <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
            {PERRETT_CONFIG.QUANTUM_PRINCIPLES.BLOCKCHAIN_TYPE} • Powered by {PERRETT_CONFIG.QUANTUM_PRINCIPLES.MASS_ENERGY_EQUIVALENCE}
          </p>
        </div>
        <div className={`text-sm font-medium ${getStatusColor(chainStatus)}`}>
          Status: {chainStatus.toUpperCase()}
        </div>
      </div>

      {/* Quantum Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(quantumMetrics).map(([key, value]) => (
          <div key={key} className="bg-gray-50 dark:bg-[#171717] rounded-lg p-3">
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500 uppercase tracking-wide">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className={`text-lg font-bold ${getMetricColor(value)}`}>
              {value.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={simulateTransaction}
          disabled={!isSecure}
          className="flex items-center gap-2 px-4 py-2 bg-[#2F80ED] text-white rounded-[50px] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
          </svg>
          Secure Transaction
        </button>

        <button
          onClick={performAIAnalysis}
          disabled={!isSecure}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-[50px] hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          AI Analysis
        </button>

        <button
          onClick={() => setIsSecure(!isSecure)}
          className={`flex items-center gap-2 px-4 py-2 rounded-[50px] transition-all ${
            isSecure 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
          </svg>
          {isSecure ? 'Secured' : 'Unsecured'}
        </button>
      </div>

      {/* Recent Blocks */}
      <div>
        <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-3">
          Recent Blocks ({blocks.length})
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {blocks.slice(-5).reverse().map((block) => (
            <div key={block.index} className="bg-gray-50 dark:bg-[#171717] rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium dark:text-[#B3B3B3] text-gray-900">
                  Block #{block.index}
                </span>
                <span className="text-xs dark:text-[#B3B3B3] text-gray-500">
                  {new Date(block.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-xs dark:text-[#B3B3B3] text-gray-600 mb-1">
                Type: {block.data.type || 'Unknown'}
              </div>
              <div className="text-xs font-mono dark:text-[#B3B3B3] text-gray-500 truncate">
                Hash: {block.hash}
              </div>
              <div className="text-xs font-mono dark:text-[#B3B3B3] text-gray-400 truncate">
                Quantum: {block.quantumSignature}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantum Principles Display */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-[#171717] dark:to-[#171717] rounded-lg">
        <div className="text-center">
          <div className="text-sm dark:text-[#B3B3B3] text-gray-600 mb-1">
            Quantum Computing Principle
          </div>
          <div className="text-lg font-bold text-[#2F80ED]">
            {PERRETT_CONFIG.QUANTUM_PRINCIPLES.MASS_ENERGY_EQUIVALENCE}
          </div>
          <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
            Optimizing cryptocurrency validation through mass-energy equivalence
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumLockChain;