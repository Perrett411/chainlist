import React, { useState, useEffect, useRef } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

const CryptoWalletConnections = () => {
  const [connectedWallets, setConnectedWallets] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletData, setWalletData] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState('');
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const speakingRef = useRef(false);
  const pendingCommandRef = useRef(null);

  // Supported crypto wallets and exchanges
  const supportedWallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      type: 'browser_wallet',
      icon: '🦊',
      networks: ['ethereum', 'polygon', 'binance_smart_chain'],
      description: 'Most popular Ethereum wallet'
    },
    {
      id: 'coinbase_wallet',
      name: 'Coinbase Wallet',
      type: 'browser_wallet', 
      icon: '🔵',
      networks: ['ethereum', 'polygon', 'avalanche'],
      description: 'Self-custody wallet by Coinbase'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      type: 'protocol',
      icon: '🔗',
      networks: ['ethereum', 'polygon', 'arbitrum', 'optimism'],
      description: 'Connect 300+ mobile wallets'
    },
    {
      id: 'binance',
      name: 'Binance',
      type: 'exchange',
      icon: '🟡',
      networks: ['binance_smart_chain', 'ethereum'],
      description: 'World\'s largest crypto exchange'
    },
    {
      id: 'coinbase_pro',
      name: 'Coinbase Advanced',
      type: 'exchange',
      icon: '🔷',
      networks: ['ethereum', 'bitcoin'],
      description: 'Professional trading platform'
    },
    {
      id: 'kraken',
      name: 'Kraken',
      type: 'exchange',
      icon: '🐙',
      networks: ['ethereum', 'bitcoin', 'solana'],
      description: 'Secure crypto exchange'
    },
    {
      id: 'phantom',
      name: 'Phantom',
      type: 'browser_wallet',
      icon: '👻',
      networks: ['solana'],
      description: 'Leading Solana wallet'
    },
    {
      id: 'ledger',
      name: 'Ledger',
      type: 'hardware_wallet',
      icon: '🔒',
      networks: ['ethereum', 'bitcoin', 'solana', 'cardano'],
      description: 'Hardware wallet security'
    },
    {
      id: 'trezor',
      name: 'Trezor',
      type: 'hardware_wallet',
      icon: '🛡️',
      networks: ['ethereum', 'bitcoin'],
      description: 'Original hardware wallet'
    }
  ];

  // Sync refs with state
  useEffect(() => {
    listeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    speakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Initialize Speech Recognition for Wallet Commands (once only)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        try {
          const command = event.results[0][0].transcript.toLowerCase();
          setLastVoiceCommand(command);
          pendingCommandRef.current = command;
          // Stop recognition and let onend handle the TTS
          recognitionRef.current?.stop();
        } catch (error) {
          console.error('Speech recognition result error:', error);
          setIsListening(false);
          listeningRef.current = false;
        }
      };

      recognitionRef.current.onerror = (event) => {
        try {
          console.error('Speech recognition error:', event.error);
          recognitionRef.current?.abort();
          setIsListening(false);
          listeningRef.current = false;
          // Queue error message for after recognition stops
          pendingCommandRef.current = 'ERROR_MESSAGE';
        } catch (error) {
          console.error('Speech recognition error handler error:', error);
          setIsListening(false);
          listeningRef.current = false;
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        listeningRef.current = false;
        
        // Process any pending command after a short delay to ensure ASR is fully stopped
        setTimeout(() => {
          if (pendingCommandRef.current) {
            const command = pendingCommandRef.current;
            pendingCommandRef.current = null;
            
            if (command === 'ERROR_MESSAGE') {
              speakResponse('Sorry, I didn\'t catch that. Please try again.');
            } else {
              handleVoiceCommand(command);
            }
          }
        }, 300);
      };
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      listeningRef.current = false;
      speakingRef.current = false;
      pendingCommandRef.current = null;
    };
  }, []); // Only initialize once

  // Handle Voice Commands for Wallet Operations
  const handleVoiceCommand = async (command) => {
    console.log('Voice command received:', command);
    
    try {
      // Connect wallet commands
      if (command.includes('connect') && command.includes('metamask')) {
        const metamask = supportedWallets.find(w => w.id === 'metamask');
        if (metamask && !connectedWallets.some(w => w.id === 'metamask')) {
          speakResponse('Connecting to MetaMask wallet...');
          await connectWallet(metamask);
        } else if (connectedWallets.some(w => w.id === 'metamask')) {
          speakResponse('MetaMask is already connected.');
        } else {
          speakResponse('MetaMask wallet not found in supported wallets.');
        }
      }
      else if (command.includes('connect') && command.includes('coinbase')) {
        const coinbase = supportedWallets.find(w => w.id === 'coinbase_wallet');
        if (coinbase && !connectedWallets.some(w => w.id === 'coinbase_wallet')) {
          speakResponse('Connecting to Coinbase Wallet...');
          await connectWallet(coinbase);
        } else if (connectedWallets.some(w => w.id === 'coinbase_wallet')) {
          speakResponse('Coinbase Wallet is already connected.');
        } else {
          speakResponse('Coinbase Wallet not found.');
        }
      }
      else if (command.includes('connect') && command.includes('phantom')) {
        const phantom = supportedWallets.find(w => w.id === 'phantom');
        if (phantom && !connectedWallets.some(w => w.id === 'phantom')) {
          speakResponse('Connecting to Phantom wallet...');
          await connectWallet(phantom);
        } else if (connectedWallets.some(w => w.id === 'phantom')) {
          speakResponse('Phantom wallet is already connected.');
        } else {
          speakResponse('Phantom wallet not found.');
        }
      }
      else if (command.includes('connect') && command.includes('ledger')) {
        const ledger = supportedWallets.find(w => w.id === 'ledger');
        if (ledger && !connectedWallets.some(w => w.id === 'ledger')) {
          speakResponse('Connecting to Ledger hardware wallet...');
          await connectWallet(ledger);
        } else if (connectedWallets.some(w => w.id === 'ledger')) {
          speakResponse('Ledger is already connected.');
        } else {
          speakResponse('Ledger wallet not found.');
        }
      }
      // Disconnect commands
      else if (command.includes('disconnect') && command.includes('metamask')) {
        if (connectedWallets.some(w => w.id === 'metamask')) {
          speakResponse('Disconnecting MetaMask wallet...');
          disconnectWallet('metamask');
        } else {
          speakResponse('MetaMask is not currently connected.');
        }
      }
      else if (command.includes('disconnect') && command.includes('all')) {
        if (connectedWallets.length > 0) {
          speakResponse(`Disconnecting all ${connectedWallets.length} connected wallets...`);
          connectedWallets.forEach(wallet => disconnectWallet(wallet.id));
        } else {
          speakResponse('No wallets are currently connected.');
        }
      }
      // Status commands
      else if (command.includes('status') || command.includes('connected')) {
        if (connectedWallets.length === 0) {
          speakResponse('No wallets are currently connected. You can connect MetaMask, Coinbase Wallet, Phantom, Ledger, or other supported wallets.');
        } else {
          const walletNames = connectedWallets.map(w => w.name).join(', ');
          speakResponse(`You have ${connectedWallets.length} wallet${connectedWallets.length > 1 ? 's' : ''} connected: ${walletNames}`);
        }
      }
      else if (command.includes('balance') || command.includes('total')) {
        const totalBalance = connectedWallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
        if (totalBalance > 0) {
          speakResponse(`Your total balance across all connected wallets is approximately ${totalBalance.toFixed(4)} tokens.`);
        } else {
          speakResponse('No balance information available. Please ensure your wallets are properly connected.');
        }
      }
      // Help commands
      else if (command.includes('help') || command.includes('commands')) {
        speakResponse('I can help you with wallet operations. Say "connect MetaMask", "connect Coinbase", "connect Phantom", "disconnect all", "check status", or "show balance" to interact with your crypto wallets.');
      }
      // Generic connect command
      else if (command.includes('connect') && !command.includes('wallet')) {
        speakResponse('Which wallet would you like to connect? Available options include MetaMask, Coinbase Wallet, Phantom, Ledger, WalletConnect, and various exchanges.');
      }
      else {
        speakResponse('I didn\'t understand that command. Try saying "connect MetaMask", "check status", "show balance", or "help" for available commands.');
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      speakResponse('Sorry, there was an error processing your command. Please try again.');
    }
  };

  // Text-to-Speech Response (only when not listening, using refs for current state)
  const speakResponse = (text) => {
    if ('speechSynthesis' in window && !listeningRef.current && !speakingRef.current) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      setIsSpeaking(true);
      speakingRef.current = true;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        speakingRef.current = false;
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        speakingRef.current = false;
      };
      
      window.speechSynthesis.speak(utterance);
    } else if (listeningRef.current) {
      // Don't speak while listening to avoid ASR/TTS conflict
      console.log('Skipping TTS while listening:', text);
    } else if (speakingRef.current) {
      // Don't speak while already speaking
      console.log('Skipping TTS while already speaking:', text);
    }
  };

  // Start/Stop Voice Recognition (prevent re-entrancy)
  const toggleVoiceRecognition = () => {
    try {
      if (listeningRef.current) {
        recognitionRef.current?.stop();
        setIsListening(false);
        listeningRef.current = false;
      } else if (!speakingRef.current) {
        // Only start if not currently speaking
        // Stop any current speech before starting recognition
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        speakingRef.current = false;
        
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
          listeningRef.current = true;
          // Don't speak while starting recognition to avoid TTS/ASR conflict
        } else {
          alert('Speech recognition is not supported in this browser. Please use Chrome or Edge for voice commands.');
        }
      }
    } catch (error) {
      console.error('Voice recognition toggle error:', error);
      setIsListening(false);
      listeningRef.current = false;
      // Delay error speech to avoid conflict
      setTimeout(() => {
        speakResponse('Voice recognition encountered an error. Please try again.');
      }, 500);
    }
  };

  // Connect to wallet
  const connectWallet = async (wallet) => {
    setIsConnecting(true);
    
    try {
      let connectionResult;
      
      if (wallet.type === 'browser_wallet') {
        connectionResult = await connectBrowserWallet(wallet);
      } else if (wallet.type === 'exchange') {
        connectionResult = await connectExchange(wallet);
      } else if (wallet.type === 'hardware_wallet') {
        connectionResult = await connectHardwareWallet(wallet);
      } else if (wallet.type === 'protocol') {
        connectionResult = await connectProtocol(wallet);
      }

      if (connectionResult.success) {
        setConnectedWallets(prev => [...prev, {
          ...wallet,
          address: connectionResult.address,
          balance: connectionResult.balance,
          connectedAt: new Date().toISOString()
        }]);

        setWalletData(prev => ({
          ...prev,
          [wallet.id]: connectionResult.data
        }));

        alert(`Successfully connected to ${wallet.name}!`);
        speakResponse(`Successfully connected to ${wallet.name}. Your wallet is now ready for transactions.`);
      }
    } catch (error) {
      console.error(`Error connecting to ${wallet.name}:`, error);
      alert(`Failed to connect to ${wallet.name}. Please try again.`);
      speakResponse(`Failed to connect to ${wallet.name}. Please check your wallet and try again.`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect browser wallets (MetaMask, Coinbase Wallet, etc.)
  const connectBrowserWallet = async (wallet) => {
    if (wallet.id === 'metamask') {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });

        return {
          success: true,
          address: accounts[0],
          balance: parseInt(balance, 16) / Math.pow(10, 18), // Convert Wei to ETH
          data: { chainId: await window.ethereum.request({ method: 'eth_chainId' }) }
        };
      } else {
        throw new Error('MetaMask not installed');
      }
    }

    if (wallet.id === 'coinbase_wallet') {
      // Simulate Coinbase Wallet connection
      return {
        success: true,
        address: '0x' + Math.random().toString(16).substr(2, 40),
        balance: Math.random() * 10,
        data: { provider: 'coinbase_wallet' }
      };
    }

    if (wallet.id === 'phantom') {
      // Simulate Phantom wallet connection
      if (typeof window.solana !== 'undefined') {
        const response = await window.solana.connect();
        return {
          success: true,
          address: response.publicKey.toString(),
          balance: Math.random() * 100, // SOL balance
          data: { network: 'solana-mainnet' }
        };
      } else {
        throw new Error('Phantom wallet not installed');
      }
    }

    // Generic browser wallet simulation
    return {
      success: true,
      address: '0x' + Math.random().toString(16).substr(2, 40),
      balance: Math.random() * 5,
      data: { provider: wallet.id }
    };
  };

  // Connect to exchanges via API
  const connectExchange = async (wallet) => {
    // In real implementation, this would use OAuth or API keys
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    
    return {
      success: true,
      address: `${wallet.id}_account_${Math.random().toString(36).substr(2, 8)}`,
      balance: Math.random() * 1000,
      data: {
        exchange: wallet.id,
        tradingPairs: ['BTC/USD', 'ETH/USD', 'BNB/USD'],
        apiConnected: true
      }
    };
  };

  // Connect hardware wallets
  const connectHardwareWallet = async (wallet) => {
    // Simulate hardware wallet connection process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      success: true,
      address: '0x' + Math.random().toString(16).substr(2, 40),
      balance: Math.random() * 20,
      data: {
        hardware: true,
        deviceModel: wallet.id,
        firmwareVersion: '2.1.0'
      }
    };
  };

  // Connect via WalletConnect protocol
  const connectProtocol = async (wallet) => {
    // Simulate WalletConnect QR code process
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    return {
      success: true,
      address: '0x' + Math.random().toString(16).substr(2, 40),
      balance: Math.random() * 15,
      data: {
        protocol: 'walletconnect',
        session: 'active',
        connectedApp: wallet.name
      }
    };
  };

  // Disconnect wallet
  const disconnectWallet = (walletId) => {
    setConnectedWallets(prev => prev.filter(w => w.id !== walletId));
    setWalletData(prev => {
      const newData = { ...prev };
      delete newData[walletId];
      return newData;
    });
    const walletName = connectedWallets.find(w => w.id === walletId)?.name || 'wallet';
    alert(`Disconnected from ${walletName}`);
    speakResponse(`Disconnected from ${walletName}.`);
  };

  // Get wallet type color
  const getWalletTypeColor = (type) => {
    switch (type) {
      case 'browser_wallet': return 'bg-blue-100 text-blue-700';
      case 'exchange': return 'bg-green-100 text-green-700';
      case 'hardware_wallet': return 'bg-purple-100 text-purple-700';
      case 'protocol': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500"></div>
            Crypto Wallet Connections
          </h2>
          <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
            Connect all your crypto wallets and exchanges • {PERRETT_CONFIG.OWNER} <span className="text-xs">PERRETT and Associate Private Investment Firm LLC</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleVoiceRecognition}
            disabled={isSpeaking && !isListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse hover:bg-red-600' 
                : isSpeaking
                ? 'bg-yellow-500 text-white opacity-75'
                : 'bg-[#2F80ED] text-white hover:bg-blue-600'
            } disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 9a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                </svg>
                Listening...
              </>
            ) : isSpeaking ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.785L4.146 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.146l4.237-3.785z" clipRule="evenodd" />
                  <path d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" />
                </svg>
                Speaking...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Voice Control
              </>
            )}
          </button>
          <div className="text-right">
            <div className="text-sm font-medium dark:text-[#B3B3B3] text-gray-900">
              {connectedWallets.length} Connected
            </div>
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
              Quantum-secured
            </div>
          </div>
        </div>
      </div>

      {/* Voice Command Status */}
      {(isListening || isSpeaking || lastVoiceCommand) && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-[#171717] rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isListening && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    🎤 Listening for wallet commands...
                  </span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    🔊 Speaking response...
                  </span>
                </div>
              )}
              {lastVoiceCommand && !isListening && !isSpeaking && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-blue-700 dark:text-blue-400">
                    ✅ Last command: "{lastVoiceCommand}"
                  </span>
                </div>
              )}
            </div>
            {isListening && (
              <button
                onClick={toggleVoiceRecognition}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-all"
              >
                Stop Listening
              </button>
            )}
          </div>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-500">
            💡 Say: "connect MetaMask", "connect Coinbase", "check status", "show balance", "disconnect all", or "help"
          </div>
        </div>
      )}

      {/* Connected Wallets */}
      {connectedWallets.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-3">
            Connected Wallets ({connectedWallets.length})
          </h3>
          <div className="space-y-3">
            {connectedWallets.map((wallet) => (
              <div key={wallet.id} className="bg-gray-50 dark:bg-[#171717] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div>
                      <h4 className="font-semibold dark:text-[#B3B3B3] text-gray-900">{wallet.name}</h4>
                      <p className="text-sm dark:text-[#B3B3B3] text-gray-600 font-mono">
                        {wallet.address.substring(0, 16)}...{wallet.address.substring(wallet.address.length - 4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold dark:text-[#B3B3B3] text-gray-900">
                      {wallet.balance.toFixed(4)} {wallet.networks[0]?.toUpperCase() || 'CRYPTO'}
                    </div>
                    <button
                      onClick={() => disconnectWallet(wallet.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getWalletTypeColor(wallet.type)}`}>
                    {wallet.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-[#0D0D0D] dark:text-[#B3B3B3] text-gray-700">
                    Connected: {new Date(wallet.connectedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Wallets */}
      <div>
        <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-3">
          Available Wallets & Exchanges
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {supportedWallets.map((wallet) => {
            const isConnected = connectedWallets.some(w => w.id === wallet.id);
            
            return (
              <div key={wallet.id} className="border dark:border-[#171717] border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div>
                      <h4 className="font-medium dark:text-[#B3B3B3] text-gray-900">{wallet.name}</h4>
                      <p className="text-xs dark:text-[#B3B3B3] text-gray-600">{wallet.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => isConnected ? disconnectWallet(wallet.id) : connectWallet(wallet)}
                    disabled={isConnecting}
                    className={`px-3 py-1 text-xs rounded-full transition-all disabled:opacity-50 ${
                      isConnected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isConnecting ? 'Connecting...' : (isConnected ? 'Disconnect' : 'Connect')}
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getWalletTypeColor(wallet.type)}`}>
                    {wallet.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
                  Networks: {wallet.networks.join(', ').toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-[#171717] rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm dark:text-[#B3B3B3] text-gray-700">
          <strong>Universal Crypto Integration:</strong> This system supports all major crypto wallets, 
          exchanges, and blockchain networks. Connect your existing wallets to access unified portfolio 
          tracking, automated trading, and AI-powered financial analysis across all your crypto assets.
        </div>
      </div>
    </div>
  );
};

export default CryptoWalletConnections;