import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

const AIWalletAssistant = ({ isMinimized = false, onToggleSize }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantType, setAssistantType] = useState('wallet'); // wallet, portfolio, analytics
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const listeningTimeoutRef = useRef(null);

  const {
    walletState,
    portfolioSummary,
    user,
    isAuthenticated,
    hasWalletOrAuth,
    formatAddress,
    formatCurrency,
    refreshPortfolio
  } = useWallet();

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setTranscript(command);
        handleVoiceCommand(command);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'aborted') {
          speakResponse('Sorry, I had trouble hearing that. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-introduction when wallet connects
  useEffect(() => {
    if (walletState.isConnected && conversation.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: `Hello! I'm your AI Wallet Assistant. I can see you've connected your wallet ${formatAddress(walletState.address)}. I'm here to help you manage your crypto portfolio, analyze transactions, and provide financial insights. How can I assist you today?`,
        timestamp: new Date(),
        type: 'wallet_connected'
      };
      setConversation([welcomeMessage]);
      
      // Auto-speak welcome message after a brief delay
      setTimeout(() => {
        speakResponse(welcomeMessage.content);
      }, 2000);
    }
  }, [walletState.isConnected, formatAddress, conversation.length]);

  const speakResponse = (text) => {
    if ('speechSynthesis' in window && !isSpeaking) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      clearTimeout(listeningTimeoutRef.current);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        
        // Auto-stop listening after 10 seconds
        listeningTimeoutRef.current = setTimeout(() => {
          recognitionRef.current?.stop();
          setIsListening(false);
        }, 10000);
      } else {
        alert('Speech recognition is not supported in this browser.');
      }
    }
  };

  const handleVoiceCommand = async (command) => {
    setIsProcessing(true);
    
    // Add user message to conversation
    const userMessage = {
      role: 'user',
      content: command,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);

    try {
      let response = '';
      let responseType = 'general';

      // Process wallet-specific commands
      if (command.includes('balance') || command.includes('how much')) {
        if (walletState.isConnected) {
          const ethBalance = walletState.balance?.toFixed(4) || '0.0000';
          const portfolioValue = portfolioSummary.totalValue || 0;
          response = `Your wallet balance is ${ethBalance} ETH. Your total portfolio value is ${formatCurrency(portfolioValue)}. Combined, you have ${formatCurrency(portfolioValue + (walletState.balance * 2500 || 0))} in total assets.`;
          responseType = 'balance';
        } else {
          response = "I don't see a connected wallet. Please connect your wallet first so I can show you your balance.";
          responseType = 'no_wallet';
        }
      }
      
      else if (command.includes('portfolio') || command.includes('investments')) {
        if (portfolioSummary.portfolios && portfolioSummary.portfolios.length > 0) {
          response = `You have ${portfolioSummary.portfolioCount} portfolios. Your total portfolio value is ${formatCurrency(portfolioSummary.totalValue)} with a ${portfolioSummary.dayChange > 0 ? 'gain' : 'loss'} of ${Math.abs(portfolioSummary.dayChange).toFixed(2)}% today.`;
          responseType = 'portfolio';
        } else {
          response = "You don't have any portfolios yet. Would you like me to help you create your first investment portfolio?";
          responseType = 'no_portfolio';
        }
      }
      
      else if (command.includes('transaction') || command.includes('send') || command.includes('transfer')) {
        response = "I can help you understand transactions, but I cannot execute them for security reasons. Please use your wallet interface for sending funds. I can provide guidance on transaction fees and timing though.";
        responseType = 'transaction';
      }
      
      else if (command.includes('price') || command.includes('market')) {
        response = "I can provide market insights! Currently, I'm seeing positive portfolio performance today. For specific coin prices, I'd recommend checking your portfolio dashboard or connecting to live market data.";
        responseType = 'market';
      }
      
      else if (command.includes('help') || command.includes('what can you do')) {
        response = "I'm your AI Wallet Assistant! I can help you check balances, analyze your portfolio performance, understand transactions, provide market insights, and guide you through wallet management. I can also speak responses and listen to voice commands. What would you like to know?";
        responseType = 'help';
      }
      
      else if (command.includes('connect') || command.includes('wallet')) {
        if (walletState.isConnected) {
          response = `Your wallet ${formatAddress(walletState.address)} is already connected on chain ${walletState.chainId}. Everything looks good!`;
          responseType = 'already_connected';
        } else {
          response = "I'll help you connect a wallet. Please use the connect button in the interface, and I'll be ready to assist once you're connected.";
          responseType = 'connect_help';
        }
      }
      
      else if (command.includes('refresh') || command.includes('update')) {
        await refreshPortfolio();
        response = "I've refreshed your portfolio data. Your latest balances and performance metrics are now up to date.";
        responseType = 'refresh';
      }
      
      else {
        // AI-style general response for wallet context
        response = await generateAIResponse(command);
        responseType = 'ai_general';
      }

      // Add assistant response to conversation
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: responseType,
        walletData: walletState.isConnected ? {
          address: walletState.address,
          balance: walletState.balance,
          chainId: walletState.chainId
        } : null
      };

      setConversation(prev => [...prev, assistantMessage]);
      speakResponse(response);
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        type: 'error'
      };
      setConversation(prev => [...prev, errorMessage]);
      speakResponse(errorMessage.content);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIResponse = async (command) => {
    // Simulate AI processing with wallet context
    const walletContext = walletState.isConnected 
      ? `Connected wallet: ${formatAddress(walletState.address)}, Balance: ${walletState.balance?.toFixed(4)} ETH, Chain: ${walletState.chainId}`
      : "No wallet connected";
    
    const portfolioContext = portfolioSummary.totalValue 
      ? `Portfolio value: ${formatCurrency(portfolioSummary.totalValue)}, Change: ${portfolioSummary.dayChange}%`
      : "No portfolio data";

    // Simple rule-based responses with wallet awareness
    if (command.includes('advice') || command.includes('recommend')) {
      return "Based on your current wallet and portfolio status, I recommend diversifying your holdings and keeping track of market trends. Consider setting up regular portfolio reviews to optimize your investments.";
    }
    
    if (command.includes('safe') || command.includes('security')) {
      return "Wallet security is crucial! Always verify transaction details before signing, use hardware wallets for large amounts, and never share your private keys or seed phrases. I can help you review transaction details safely.";
    }

    return `I understand you're asking about "${command}". As your wallet assistant, I'm here to help with crypto and portfolio management. ${walletContext}. ${portfolioContext}. How can I assist you further?`;
  };

  const clearConversation = () => {
    setConversation([]);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const getAssistantStatus = () => {
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    if (isProcessing) return 'thinking';
    if (hasWalletOrAuth) return 'ready';
    return 'waiting';
  };

  const getStatusColor = () => {
    const status = getAssistantStatus();
    switch (status) {
      case 'listening': return 'bg-green-500';
      case 'speaking': return 'bg-blue-500';
      case 'thinking': return 'bg-yellow-500';
      case 'ready': return 'bg-[#2F80ED]';
      default: return 'bg-gray-500';
    }
  };

  const getStatusMessage = () => {
    const status = getAssistantStatus();
    switch (status) {
      case 'listening': return 'Listening...';
      case 'speaking': return 'Speaking...';
      case 'thinking': return 'Processing...';
      case 'ready': return 'Ready to help';
      default: return 'Connect wallet to start';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleSize}
          className={`w-16 h-16 rounded-full ${getStatusColor()} text-white shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center`}
        >
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-white animate-ping"></div>
            )}
            {isSpeaking ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.146 13.2A1 1 0 014 12.38V7.62a1 1 0 01.146-.82l4.237-3.614zM16 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM18 8a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM18 12a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white dark:bg-[#0D0D0D] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <div>
            <div className="font-medium text-sm dark:text-[#B3B3B3] text-black">
              AI Wallet Assistant
            </div>
            <div className="text-xs text-gray-500">{getStatusMessage()}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={clearConversation}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear conversation"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={onToggleSize}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversation */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {conversation.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#2F80ED] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm mb-2">
              {hasWalletOrAuth 
                ? "I'm ready to help with your wallet and portfolio!" 
                : "Connect your wallet to get started"}
            </p>
            <p className="text-xs">
              Click the microphone to speak or type your questions
            </p>
          </div>
        ) : (
          conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-[#2F80ED] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 dark:text-[#B3B3B3] text-black'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleListening}
            disabled={isProcessing || !hasWalletOrAuth}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
              isListening
                ? 'bg-red-500 text-white'
                : 'bg-[#2F80ED] text-white hover:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Stop Listening
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                {hasWalletOrAuth ? 'Ask Me Anything' : 'Connect First'}
              </>
            )}
          </button>
          
          {isSpeaking && (
            <button
              onClick={() => window.speechSynthesis.cancel()}
              className="p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM12 9a1 1 0 00-2 0v2a1 1 0 002 0V9z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {transcript && (
          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
            Heard: "{transcript}"
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-2">
        <div className="text-xs text-gray-400 text-center">
          {PERRETT_CONFIG.OWNER} • AI Wallet Assistant
        </div>
      </div>
    </div>
  );
};

export default AIWalletAssistant;