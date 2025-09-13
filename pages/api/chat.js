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

    // OpenAI API integration with rate limiting protection
    let attempts = 0;
    const maxAttempts = 3;
    let aiResponse = null;

    while (attempts < maxAttempts && !aiResponse) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are a professional AI assistant for employees at Perrett and Associates Private Investment Firm LLC. Help with:

- Work tasks, job responsibilities, and project planning
- Financial analysis, investment research, and market insights
- Client service strategies and communication
- Professional development and skills improvement
- Process optimization and workflow efficiency
- Compliance and regulatory guidance
- Report writing and documentation
- Team collaboration and management

Provide practical, actionable advice. Be professional but friendly. Focus on work-related topics and avoid personal matters. Current user: ${user || 'Agent'} | Context: ${context || 'general'}`
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.choices[0]?.message?.content || 'I apologize, but I could not process your request at this time.';
          break;
        } else if (response.status === 429) {
          // Rate limit hit - wait with exponential backoff
          attempts++;
          if (attempts < maxAttempts) {
            const waitTime = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
            console.log(`Rate limit hit, waiting ${waitTime}ms before retry ${attempts}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            throw new Error(`OpenAI API rate limit exceeded after ${maxAttempts} attempts`);
          }
        } else {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      } catch (fetchError) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw fetchError;
        }
        // Wait before retrying for other errors
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (aiResponse) {
      res.status(200).json({ response: aiResponse });
      return;
    }
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