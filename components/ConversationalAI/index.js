import React, { useState, useRef, useEffect } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

const ConversationalAI = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const recognitionRef = useRef(null);

  // AI Assistant Pricing Plans
  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic Financial AI',
      price: 29.99,
      period: 'month',
      queries: 100,
      features: [
        'Basic financial analysis',
        'Portfolio overview',
        'Simple spreadsheet operations',
        'Email support'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'professional',
      name: 'Professional CFO AI',
      price: 99.99,
      period: 'month',
      queries: 500,
      features: [
        'Advanced financial modeling',
        'Investment strategy analysis',
        'Complex spreadsheet automation',
        'Real-time market insights',
        'Priority support',
        'Custom reports'
      ],
      color: 'from-purple-500 to-pink-500',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Financial AI',
      price: 299.99,
      period: 'month',
      queries: 'unlimited',
      features: [
        'Unlimited AI consultations',
        'Custom financial algorithms',
        'Multi-company analysis',
        'API integrations',
        'Dedicated account manager',
        'White-label options'
      ],
      color: 'from-green-500 to-emerald-500'
    }
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Start/Stop Listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Check usage limits
  const checkUsageLimits = () => {
    if (!selectedPlan) return false;
    if (selectedPlan.queries === 'unlimited') return true;
    return usageCount < selectedPlan.queries;
  };

  // Handle User Input (voice or text)
  const handleUserInput = async (input) => {
    // Check if user has access
    if (!selectedPlan) {
      setShowPricing(true);
      return;
    }
    
    if (!checkUsageLimits()) {
      const upgradeMessage = { 
        role: 'assistant', 
        content: `You've reached your monthly query limit of ${selectedPlan.queries}. Please upgrade your plan to continue using the AI assistant.`, 
        timestamp: new Date() 
      };
      setConversation(prev => [...prev, upgradeMessage]);
      setShowPricing(true);
      return;
    }

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);
    
    // Increment usage
    setUsageCount(prev => prev + 1);
    
    // Process with CFO AI
    const aiResponseText = await processWithCFOAI(input);
    const aiMessage = { role: 'assistant', content: aiResponseText, timestamp: new Date() };
    setConversation(prev => [...prev, aiMessage]);
    setAiResponse(aiResponseText);
    
    // Speak the response
    speakResponse(aiResponseText);
  };

  // Handle plan selection and payment
  const handlePlanSelection = async (plan) => {
    try {
      // Create payment intent via Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: plan.price,
          planId: plan.id,
          planName: plan.name
        }),
      });
      
      if (response.ok) {
        const { clientSecret } = await response.json();
        // Here you would integrate with Stripe checkout
        // For now, simulate successful payment
        setSelectedPlan(plan);
        setUsageCount(0);
        setShowPricing(false);
        
        const welcomeMessage = { 
          role: 'assistant', 
          content: `Welcome to ${plan.name}! You now have access to ${plan.queries === 'unlimited' ? 'unlimited' : plan.queries} AI consultations per month. How can I help you with your financial analysis today?`, 
          timestamp: new Date() 
        };
        setConversation([welcomeMessage]);
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  // Process input with CFO AI
  const processWithCFOAI = async (input) => {
    try {
      // This would connect to OpenAI API when keys are configured
      // For now, return contextual responses based on Perrett and Associates business
      const contextualResponse = generateContextualResponse(input);
      return contextualResponse;
    } catch (error) {
      console.error('Error processing with CFO AI:', error);
      return `I'm ${PERRETT_CONFIG.AI_NAME}, and I understand you're asking about "${input}". How can I assist you with your financial management needs?`;
    }
  };

  // Generate contextual responses for financial queries
  const generateContextualResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('blockchain') || lowerInput.includes('crypto')) {
      return `As ${PERRETT_CONFIG.AI_NAME}, I can help you analyze blockchain investments using our quantum-enhanced security protocols. Our system leverages ${PERRETT_CONFIG.QUANTUM_PRINCIPLES.NAKAMOTO_THESIS} for optimal risk assessment.`;
    }
    
    if (lowerInput.includes('investment') || lowerInput.includes('portfolio')) {
      return `I'm here to assist with your investment portfolio analysis. ${PERRETT_CONFIG.OWNER} specializes in quantum-powered financial intelligence for optimal returns.`;
    }
    
    if (lowerInput.includes('quantum') || lowerInput.includes('energy')) {
      return `Our quantum blockchain technology uses Einstein's mass-energy equivalence (${PERRETT_CONFIG.QUANTUM_PRINCIPLES.MASS_ENERGY_EQUIVALENCE}) to enhance cryptocurrency mining and validation efficiency.`;
    }
    
    return `Hello, I'm ${PERRETT_CONFIG.AI_NAME} from ${PERRETT_CONFIG.OWNER}. I specialize in ${PERRETT_CONFIG.ASSOCIATION} and can help you with blockchain analysis, investment strategies, and financial planning. How may I assist you today?`;
  };

  // Text-to-Speech
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-4">
        <div className="w-3 h-3 rounded-full bg-[#2F80ED] mr-3"></div>
        <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black">
          {PERRETT_CONFIG.AI_NAME}
        </h2>
      </div>
      
      <p className="text-sm dark:text-[#B3B3B3] text-gray-600 mb-6">
        {PERRETT_CONFIG.BRAND.tagline} • {PERRETT_CONFIG.OWNER} <span className="text-xs">PERRETT and Associate Private Investment Firm LLC</span>
      </p>

      {/* Current Plan & Usage Display */}
      {selectedPlan && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-[#171717] rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium dark:text-[#B3B3B3] text-gray-700">
              Current Plan: {selectedPlan.name}
            </span>
            <button
              onClick={() => setShowPricing(true)}
              className="text-xs text-[#2F80ED] hover:underline"
            >
              Upgrade
            </button>
          </div>
          <div className="text-xs dark:text-[#B3B3B3] text-gray-600">
            Usage: {usageCount}/{selectedPlan.queries === 'unlimited' ? '∞' : selectedPlan.queries} queries this month
          </div>
          <div className="w-full bg-gray-200 dark:bg-[#252525] rounded-full h-2 mt-2">
            <div 
              className="bg-[#2F80ED] h-2 rounded-full transition-all"
              style={{ 
                width: selectedPlan.queries === 'unlimited' ? '100%' : `${(usageCount / selectedPlan.queries) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0D0D0D] rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold dark:text-[#B3B3B3] text-black">
                  💰 AI Financial Assistant Pricing
                </h3>
                <button
                  onClick={() => setShowPricing(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-[#B3B3B3] dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-sm dark:text-[#B3B3B3] text-gray-600 mb-8 text-center">
                Choose the perfect plan for your financial analysis and spreadsheet automation needs
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pricingPlans.map((plan) => (
                  <div key={plan.id} className={`relative rounded-lg p-6 border-2 transition-all ${
                    plan.popular 
                      ? 'border-[#2F80ED] shadow-lg scale-105' 
                      : 'border-gray-200 dark:border-[#171717] hover:border-[#2F80ED]'
                  }`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[#2F80ED] text-white px-4 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} mb-4 flex items-center justify-center`}>
                      <span className="text-white text-xl font-bold">
                        {plan.id === 'basic' ? '📊' : plan.id === 'professional' ? '🤖' : '🏢'}
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-2">
                      {plan.name}
                    </h4>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold dark:text-[#B3B3B3] text-black">
                        ${plan.price}
                      </span>
                      <span className="text-sm dark:text-[#B3B3B3] text-gray-600">/{plan.period}</span>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                        {plan.queries === 'unlimited' ? 'Unlimited' : plan.queries} AI consultations/month
                      </p>
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm dark:text-[#B3B3B3] text-gray-600">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handlePlanSelection(plan)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                        plan.popular
                          ? 'bg-[#2F80ED] text-white hover:bg-blue-600'
                          : 'bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-700 hover:bg-gray-200 dark:hover:bg-[#252525]'
                      }`}
                    >
                      {selectedPlan?.id === plan.id ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-xs dark:text-[#B3B3B3] text-gray-500">
                  🔒 Secure payment processing via Stripe • 30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Display */}
      <div className="mb-6 max-h-64 overflow-y-auto space-y-3">
        {conversation.map((message, index) => (
          <div key={index} className={`p-3 rounded-lg ${
            message.role === 'user' 
              ? 'bg-gray-100 dark:bg-[#171717] ml-8' 
              : 'bg-[#2F80ED] text-white mr-8'
          }`}>
            <p className="text-sm">{message.content}</p>
            <span className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      {/* Access Control */}
      {!selectedPlan && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-[#171717] dark:to-[#171717] rounded-lg border border-[#2F80ED]">
          <div className="text-center">
            <h3 className="font-semibold dark:text-[#B3B3B3] text-gray-900 mb-2">
              🚀 Unlock AI Financial Assistant
            </h3>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600 mb-3">
              Get professional financial analysis, spreadsheet automation, and investment insights
            </p>
            <button
              onClick={() => setShowPricing(true)}
              className="bg-[#2F80ED] text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 mb-4">
        {/* Voice Control */}
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-[50px] transition-all ${
            isListening 
              ? 'bg-red-500 text-white' 
              : 'bg-[#2F80ED] text-white hover:bg-blue-600'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6 6 0 1111.336 0A6.002 6.002 0 0110 16a6.002 6.002 0 01-5.668-7.973z" clipRule="evenodd"/>
          </svg>
          {isListening ? 'Stop Listening' : 'Start Conversation'}
        </button>

        {/* Speech Control */}
        <button
          onClick={isSpeaking ? stopSpeaking : () => speakResponse(aiResponse)}
          className={`flex items-center gap-2 px-4 py-2 rounded-[50px] transition-all ${
            isSpeaking 
              ? 'bg-orange-500 text-white' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          disabled={!aiResponse}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793l-4.146-3.317a1 1 0 00-.632-.226H2a1 1 0 01-1-1V7.5a1 1 0 011-1h1.605a1 1 0 00.632-.226l4.146-3.317a1 1 0 011-.003zM14 5a3 3 0 013 3v4a3 3 0 01-3 3" clipRule="evenodd"/>
          </svg>
          {isSpeaking ? 'Stop Speaking' : 'Speak Response'}
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleUserInput('Analyze my blockchain portfolio')}
          className="px-3 py-2 text-sm bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-700 rounded hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors"
        >
          Portfolio Analysis
        </button>
        <button
          onClick={() => handleUserInput('Show quantum blockchain status')}
          className="px-3 py-2 text-sm bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-700 rounded hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors"
        >
          Quantum Status
        </button>
        <button
          onClick={() => handleUserInput('Market risk assessment')}
          className="px-3 py-2 text-sm bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-700 rounded hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors"
        >
          Risk Assessment
        </button>
        <button
          onClick={() => handleUserInput('Financial planning advice')}
          className="px-3 py-2 text-sm bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-700 rounded hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors"
        >
          Financial Planning
        </button>
      </div>

      {/* Status Indicators */}
      <div className="mt-4 flex gap-4 text-xs dark:text-[#B3B3B3] text-gray-500">
        <span className={`flex items-center gap-1 ${isListening ? 'text-red-500' : ''}`}>
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-300'}`}></div>
          {isListening ? 'Listening...' : 'Ready to listen'}
        </span>
        <span className={`flex items-center gap-1 ${isSpeaking ? 'text-green-500' : ''}`}>
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          {isSpeaking ? 'Speaking...' : 'Ready to speak'}
        </span>
      </div>
    </div>
  );
};

export default ConversationalAI;