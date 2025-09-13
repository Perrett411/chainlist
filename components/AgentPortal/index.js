import React, { useState, useEffect, useRef } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';

const AgentPortal = ({ user }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium'
  });
  const [isWritingReport, setIsWritingReport] = useState(false);
  const [aiChat, setAiChat] = useState([]);
  const [aiMessage, setAiMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize with sample reports
  useEffect(() => {
    const sampleReports = [
      {
        id: 'report_001',
        title: 'Q4 Financial Analysis Summary',
        content: 'Comprehensive analysis of Q4 financial performance showing 15% growth in portfolio management services. Key findings include increased client acquisition and improved retention rates.',
        category: 'financial',
        priority: 'high',
        status: 'completed',
        createdAt: '2024-12-10T14:30:00Z',
        createdBy: user?.firstName || 'Agent',
        wordCount: 157
      },
      {
        id: 'report_002',
        title: 'Client Onboarding Process Review',
        content: 'Review of current client onboarding workflow identifying bottlenecks and proposing streamlined solutions. Recommendations include digital document signing and automated compliance checks.',
        category: 'operations',
        priority: 'medium',
        status: 'draft',
        createdAt: '2024-12-08T09:15:00Z',
        createdBy: user?.firstName || 'Agent',
        wordCount: 134
      }
    ];
    setReports(sampleReports);
  }, [user]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChat]);

  const handleSaveReport = () => {
    if (!currentReport.title || !currentReport.content) {
      alert('Please fill in both title and content for the report.');
      return;
    }

    const newReport = {
      id: `report_${Date.now()}`,
      title: currentReport.title,
      content: currentReport.content,
      category: currentReport.category,
      priority: currentReport.priority,
      status: 'draft',
      createdAt: new Date().toISOString(),
      createdBy: user?.firstName || 'Agent',
      wordCount: currentReport.content.split(' ').length
    };

    setReports([newReport, ...reports]);
    setCurrentReport({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium'
    });
    setIsWritingReport(false);
    alert('Report saved successfully!');
  };

  const sendAiMessage = async () => {
    if (!aiMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: aiMessage,
      timestamp: new Date().toISOString()
    };

    setAiChat([...aiChat, userMessage]);
    setAiMessage('');
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: aiMessage,
          context: 'agent_portal',
          user: user?.firstName || 'Agent'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response || 'I apologize, but I could not process your request at this time. Please try again.',
        timestamp: new Date().toISOString()
      };

      setAiChat(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I\'m experiencing technical difficulties. As your AI assistant for work-related queries, I can help you with job tasks, project planning, research, and professional development. Please try your question again.',
        timestamp: new Date().toISOString()
      };
      setAiChat(prev => [...prev, errorResponse]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-blue-100 text-blue-700';
      case 'review': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const sections = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'reports', name: 'Reports', icon: '📋' },
    { id: 'ai-assistant', name: 'AI Assistant', icon: '🤖' },
    { id: 'tasks', name: 'Tasks', icon: '✅' }
  ];

  if (!user) {
    return (
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-2">
            Access Restricted
          </h2>
          <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
            Please log in to access the Agent Portal
          </p>
        </div>
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
              👨‍💼 Agent Portal
            </h2>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
              Employee workspace for {PERRETT_CONFIG.OWNER} <span className="text-xs">PERRETT and Associate Private Investment Firm LLC</span> • Welcome {user.firstName || user.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium dark:text-[#B3B3B3] text-gray-900">
              {user.role?.toUpperCase()} AGENT
            </div>
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
              Employee ID: {user.id?.substring(0, 8)}
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? 'bg-[#2F80ED] text-white'
                  : 'bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-700 hover:bg-gray-200 dark:hover:bg-[#252525]'
              }`}
            >
              <span>{section.icon}</span>
              <span className="text-sm font-medium">{section.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black">Reports</h3>
              <span className="text-2xl">📋</span>
            </div>
            <div className="text-3xl font-bold dark:text-[#B3B3B3] text-black mb-2">{reports.length}</div>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600">Total reports written</p>
          </div>

          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black">AI Chats</h3>
              <span className="text-2xl">🤖</span>
            </div>
            <div className="text-3xl font-bold dark:text-[#B3B3B3] text-black mb-2">{aiChat.length}</div>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600">AI conversations</p>
          </div>

          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black">Active Tasks</h3>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold dark:text-[#B3B3B3] text-black mb-2">5</div>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600">Pending assignments</p>
          </div>

          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black">Performance</h3>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-3xl font-bold dark:text-[#B3B3B3] text-black mb-2">95%</div>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600">Quality score</p>
          </div>
        </div>
      )}

      {/* Reports Section */}
      {activeSection === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black">Report Management</h3>
              <button
                onClick={() => setIsWritingReport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Report
              </button>
            </div>

            {/* Write New Report Modal */}
            {isWritingReport && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-4">
                    Write New Report
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                          Report Title
                        </label>
                        <input
                          type="text"
                          value={currentReport.title}
                          onChange={(e) => setCurrentReport({...currentReport, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                          placeholder="Enter report title..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={currentReport.category}
                          onChange={(e) => setCurrentReport({...currentReport, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                        >
                          <option value="general">General</option>
                          <option value="financial">Financial</option>
                          <option value="operations">Operations</option>
                          <option value="client">Client Services</option>
                          <option value="compliance">Compliance</option>
                          <option value="marketing">Marketing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={currentReport.priority}
                          onChange={(e) => setCurrentReport({...currentReport, priority: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium dark:text-[#B3B3B3] text-gray-700 mb-2">
                        Report Content
                      </label>
                      <textarea
                        value={currentReport.content}
                        onChange={(e) => setCurrentReport({...currentReport, content: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                        placeholder="Write your report content here..."
                        rows="12"
                      />
                      <div className="text-sm dark:text-[#B3B3B3] text-gray-500 mt-2">
                        Word count: {currentReport.content.split(' ').filter(word => word).length}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setIsWritingReport(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all dark:border-gray-600 dark:text-[#B3B3B3] dark:hover:bg-[#171717]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveReport}
                      className="flex-1 px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                      Save Report
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reports List */}
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold dark:text-[#B3B3B3] text-black mb-1">
                        {report.title}
                      </h4>
                      <p className="text-sm dark:text-[#B3B3B3] text-gray-600 mb-2">
                        {report.content.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(report.priority)}`}>
                        {report.priority.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs dark:text-[#B3B3B3] text-gray-500">
                    <span>
                      By {report.createdBy} • {new Date(report.createdAt).toLocaleDateString()} • {report.wordCount} words
                    </span>
                    <span className="capitalize">{report.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Section */}
      {activeSection === 'ai-assistant' && (
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
          <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-4">
            🤖 AI Work Assistant
          </h3>
          <p className="text-sm dark:text-[#B3B3B3] text-gray-600 mb-6">
            Get help with work tasks, job responsibilities, project planning, and professional development
          </p>

          {/* Chat Interface */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {aiChat.length === 0 && (
                <div className="text-center text-gray-500 dark:text-[#B3B3B3] py-8">
                  <div className="text-4xl mb-4">🤖</div>
                  <p>Ask me anything about your work, job tasks, or professional development!</p>
                  <p className="text-sm mt-2">Example: "Help me plan a client presentation" or "What are best practices for financial reporting?"</p>
                </div>
              )}

              {aiChat.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-[#2F80ED] text-white'
                        : 'bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-black'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-[#171717] px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#171717] dark:border-gray-600 dark:text-[#B3B3B3]"
                  placeholder="Ask about work tasks, projects, or job responsibilities..."
                  disabled={isAiTyping}
                />
                <button
                  onClick={sendAiMessage}
                  disabled={isAiTyping || !aiMessage.trim()}
                  className="px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Section */}
      {activeSection === 'tasks' && (
        <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
          <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-4">
            ✅ Assigned Tasks
          </h3>
          
          <div className="space-y-4">
            {[
              {
                id: 'task_001',
                title: 'Complete Client Risk Assessment',
                description: 'Review and assess risk profiles for new high-net-worth clients',
                dueDate: '2024-12-15',
                priority: 'high',
                status: 'in-progress'
              },
              {
                id: 'task_002',
                title: 'Update Compliance Documentation',
                description: 'Review and update quarterly compliance reports',
                dueDate: '2024-12-20',
                priority: 'medium',
                status: 'pending'
              },
              {
                id: 'task_003',
                title: 'Prepare Market Analysis Report',
                description: 'Analyze current market trends for Q1 planning',
                dueDate: '2024-12-18',
                priority: 'medium',
                status: 'pending'
              }
            ].map((task) => (
              <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold dark:text-[#B3B3B3] text-black mb-1">
                      {task.title}
                    </h4>
                    <p className="text-sm dark:text-[#B3B3B3] text-gray-600 mb-2">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs dark:text-[#B3B3B3] text-gray-500">
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  <button className="text-blue-600 hover:text-blue-800">
                    Mark Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPortal;