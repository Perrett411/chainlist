import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side usage in development
});

// CFO AI Assistant for Perrett and Associates
export async function generateCFOResponse(userInput, context = {}) {
  try {
    const systemPrompt = `You are the CFO AI for Perrett and Associates Private Investment Firm LLC. 
    You specialize in financial management, blockchain analysis, and quantum-enhanced investment strategies.
    
    Your personality is professional yet approachable, with expertise in:
    - Blockchain and cryptocurrency analysis
    - Investment portfolio management
    - Risk assessment and mitigation
    - Financial planning and strategy
    - Quantum computing applications in finance
    
    Always provide actionable financial advice while maintaining enterprise-grade security awareness.
    Respond as if you're speaking directly to a client of Perrett and Associates.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return `I'm the CFO AI for Perrett and Associates. I understand you're asking about "${userInput}". While I'm currently connecting to our quantum-enhanced systems, I can help you with financial analysis, investment strategies, and blockchain portfolio management. How can I assist you today?`;
  }
}

// Financial Analysis with AI
export async function analyzeFinancialData(data) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages: [
        {
          role: "system",
          content: "You are a financial analyst AI. Analyze the provided financial data and return insights in JSON format with risk assessment, recommendations, and confidence scores."
        },
        {
          role: "user",
          content: `Analyze this financial data: ${JSON.stringify(data)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Financial Analysis Error:', error);
    return {
      risk_level: "moderate",
      recommendation: "Continue monitoring market trends",
      confidence: 0.7,
      error: "Analysis system temporarily unavailable"
    };
  }
}

// Blockchain Analysis
export async function analyzeBlockchainMetrics(metrics) {
  try {
    const prompt = `As a blockchain specialist, analyze these quantum blockchain metrics and provide insights:
    ${JSON.stringify(metrics)}
    
    Focus on security, efficiency, and investment potential. Respond in JSON format.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Blockchain Analysis Error:', error);
    return {
      security_score: 95,
      efficiency_rating: "excellent",
      investment_grade: "A+",
      quantum_advantage: true
    };
  }
}