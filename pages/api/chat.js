// AI Chat API endpoint for Agent Portal
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, context, user } = req.body;

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        response: `Hello ${user || 'Agent'}! I'm your AI work assistant. I can help you with:

🔹 **Work Tasks & Projects**: Planning, organizing, and executing assignments
🔹 **Financial Analysis**: Market research, reporting, and investment insights  
🔹 **Client Services**: Communication strategies and relationship management
🔹 **Professional Development**: Skills improvement and career guidance
🔹 **Process Optimization**: Workflow improvements and efficiency tips

What would you like help with today? Ask me about your current assignments, need project planning assistance, or want guidance on professional tasks.

*Note: OpenAI integration is available but not configured with API key.*`
      });
    }

    // Skip OpenAI API calls temporarily due to rate limiting - use intelligent fallbacks
    // This prevents delays and provides immediate responses to users
    
    const messageText = message?.toLowerCase() || '';
    let contextualResponse = '';

    // Enhanced contextual responses based on user input
    if (messageText.includes('blockchain') || messageText.includes('crypto') || messageText.includes('chain')) {
      contextualResponse = `As your X Chainlist AI assistant, I can help you analyze blockchain networks and cryptocurrencies. For blockchain analysis, I recommend focusing on:

🔗 **Network Security**: Evaluate consensus mechanisms and validator distribution
📊 **Performance Metrics**: Check transaction throughput and confirmation times  
💰 **Economic Models**: Analyze tokenomics and staking rewards
🔍 **RPC Reliability**: Test endpoint availability and response times

What specific blockchain network or cryptocurrency would you like to analyze?`;
    }
    else if (messageText.includes('financial') || messageText.includes('investment') || messageText.includes('portfolio')) {
      contextualResponse = `I'm your CFO AI from Perrett and Associates, specializing in quantum-enhanced financial analysis. For investment strategy, I recommend:

📈 **Portfolio Diversification**: Balance traditional and crypto assets
🎯 **Risk Management**: Set stop-losses and position sizing rules
📊 **Market Analysis**: Monitor trends, volume, and technical indicators
💎 **Due Diligence**: Research fundamentals before investing

What financial analysis or investment decision can I help you with today?`;
    }
    else if (messageText.includes('project') || messageText.includes('task') || messageText.includes('planning')) {
      contextualResponse = `For effective project management at Perrett and Associates, I recommend:

📋 **Project Planning**: Break down tasks into milestones with clear deadlines
👥 **Team Coordination**: Assign responsibilities and track progress
📊 **Resource Allocation**: Balance workload and optimize efficiency
🎯 **Goal Alignment**: Ensure objectives match business strategy

What specific project or task would you like help organizing?`;
    }
    else if (messageText.includes('client') || messageText.includes('service') || messageText.includes('relationship')) {
      contextualResponse = `For superior client service at our investment firm:

🤝 **Communication**: Maintain regular updates and transparency
📞 **Responsiveness**: Address inquiries promptly and professionally  
📋 **Documentation**: Keep detailed records of all interactions
💡 **Value Creation**: Proactively identify opportunities for clients

How can I assist you with client relationship management?`;
    }
    else if (messageText.includes('report') || messageText.includes('analysis') || messageText.includes('document')) {
      contextualResponse = `For professional financial reporting and documentation:

📊 **Executive Summary**: Start with key findings and recommendations
📈 **Data Visualization**: Use charts and graphs for clarity
🔍 **Analysis Depth**: Include methodology and assumptions
✅ **Actionable Insights**: Provide clear next steps

What type of report or analysis are you preparing?`;
    }
    else {
      contextualResponse = `Hello! I'm your X Chainlist AI assistant from Perrett and Associates Private Investment Firm. I specialize in:

🤖 **AI-Powered Analysis**: Quantum-enhanced financial intelligence
⛓️ **Blockchain Expertise**: Network analysis and crypto strategies  
💼 **Professional Services**: Project management and client relations
📊 **Financial Planning**: Investment analysis and portfolio optimization

I'm here to provide immediate assistance. What would you like help with today?`;
    }

    res.status(200).json({ response: contextualResponse });
  } catch (error) {
    console.error('AI Chat error:', error);
    
    // Enhanced fallback response for work-related queries with rate limit awareness
    const fallbackResponses = {
      'project': 'For project planning, I recommend breaking down your task into smaller milestones, setting clear deadlines, and identifying key stakeholders. What specific project are you working on?',
      'client': 'When working with clients, focus on clear communication, understanding their needs, and providing regular updates. How can I help with your client relationship?',
      'report': 'For effective reports, structure your content with an executive summary, key findings, analysis, and actionable recommendations. What type of report are you preparing?',
      'task': 'To manage tasks effectively, prioritize by urgency and impact, set realistic deadlines, and track progress regularly. What tasks do you need help organizing?',
      'analysis': 'For financial analysis, ensure you have reliable data sources, use appropriate metrics, and present findings clearly with visual aids. What analysis are you conducting?',
      'financial': 'For financial management, I recommend focusing on budgeting, cash flow analysis, risk assessment, and investment strategy. How can I assist with your financial planning?',
      'investment': 'For investment analysis, consider diversification, risk tolerance, market trends, and long-term goals. What investment decisions are you evaluating?',
      'blockchain': 'For blockchain and crypto analysis, focus on technology fundamentals, market dynamics, regulatory environment, and risk management. What blockchain topic interests you?'
    };

    const messageText = req.body.message?.toLowerCase() || '';
    let fallbackResponse = `I'm your X Chainlist AI assistant from Perrett and Associates. I can help with project planning, client management, financial analysis, blockchain insights, and professional development.`;
    
    // Check if this was a rate limit error
    if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      fallbackResponse += ' Currently experiencing high demand - please try again in a moment. ';
    }

    // Provide contextual response based on user input
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (messageText.includes(key)) {
        fallbackResponse = response;
        break;
      }
    }

    // Add helpful context for X Chainlist specific queries
    if (messageText.includes('chain') || messageText.includes('network') || messageText.includes('rpc')) {
      fallbackResponse = 'I can help you with blockchain network analysis, RPC endpoint evaluation, and chain selection strategies. What specific blockchain network are you working with?';
    }

    res.status(200).json({ response: fallbackResponse });
  }
}