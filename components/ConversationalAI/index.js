import React, { useState, useRef, useEffect } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

const ConversationalAI = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const recognitionRef = useRef(null);

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

  // Handle User Input (voice or text)
  const handleUserInput = async (input) => {
    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);
    
    // Process with CFO AI
    const aiResponseText = await processWithCFOAI(input);
    const aiMessage = { role: 'assistant', content: aiResponseText, timestamp: new Date() };
    setConversation(prev => [...prev, aiMessage]);
    setAiResponse(aiResponseText);
    
    // Speak the response
    speakResponse(aiResponseText);
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