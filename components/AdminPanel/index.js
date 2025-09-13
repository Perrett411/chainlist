import React, { useState, useEffect } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';
import { useAuth } from '../../hooks/useAuth';

const AdminPanel = ({ user: propUser }) => {
  const { user: authUser, isAuthenticated } = useAuth();
  const user = propUser || authUser; // Use passed user or authenticated user
  
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Server-side verification will be handled by API routes
  const isAdmin = user?.role === 'admin' && user?.permissions?.includes('admin');

  // Fetch system metrics from secure API
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setIsLoading(false);
      return;
    }

    const fetchSystemMetrics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/system/metrics', {
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required');
            return;
          }
          if (response.status === 403) {
            setError('Admin access required');
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setSystemMetrics(data.metrics);
        setLogs(data.recentLogs || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching system metrics:', err);
        setError('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isAdmin]);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F80ED] mx-auto mb-4"></div>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
              Loading admin panel...
            </p>
          </div>
        </div>
      </div>
    );
  }
  // Handle errors
  if (error) {
    return (
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-2">Admin Access Required</h2>
          <p className="dark:text-[#B3B3B3] text-gray-600 mb-4">{error}</p>
          {!isAuthenticated && (
            <button
              onClick={() => window.location.href = '/api/login'}
              className="px-4 py-2 bg-[#2F80ED] text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              Login to Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'on': return 'text-green-500';
      case 'off': return 'text-red-500';
      case 'read': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-2">Access Denied</h2>
        <p className="dark:text-[#B3B3B3] text-gray-600">
          Administrator permissions required to access API controls
        </p>
        <p className="text-sm dark:text-[#B3B3B3] text-gray-500 mt-2">
          Current role: {user?.role || 'Guest'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-purple-500"></div>
              {PERRETT_CONFIG.OWNER} - Admin Panel
            </h2>
            <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
              API Controls & System Management
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium dark:text-[#B3B3B3] text-gray-900">
              Administrator: {user.name}
            </div>
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      {systemMetrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-4">
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500 uppercase tracking-wide">
              Total API Calls
            </div>
            <div className="text-2xl font-bold text-[#2F80ED]">
              {systemMetrics.totalApiCalls?.toLocaleString() || '0'}
            </div>
          </div>
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-4">
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500 uppercase tracking-wide">
              Active Users
            </div>
            <div className="text-2xl font-bold text-green-500">
              {systemMetrics.activeUsers || '0'}
            </div>
          </div>
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-4">
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500 uppercase tracking-wide">
              System Load
            </div>
            <div className={`text-2xl font-bold ${(systemMetrics.systemLoad || 0) < 70 ? 'text-green-500' : 'text-red-500'}`}>
              {systemMetrics.systemLoad?.toFixed(1) || '0.0'}%
            </div>
          </div>
          <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-4">
            <div className="text-xs dark:text-[#B3B3B3] text-gray-500 uppercase tracking-wide">
              Security Status
            </div>
            <div className={`text-2xl font-bold ${systemMetrics.securityStatus === 'secure' ? 'text-green-500' : 'text-red-500'}`}>
              {systemMetrics.securityStatus?.toUpperCase() || 'UNKNOWN'}
            </div>
          </div>
        </div>
      )}

      {/* API Controls */}
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
        <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-4">
          API Controls & Permissions
        </h3>
        <div className="space-y-4">
          {Object.entries(apiControls).map(([apiName, config]) => (
            <div key={apiName} className="border dark:border-[#171717] border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium dark:text-[#B3B3B3] text-gray-900">
                    {apiName.replace(/_/g, ' ').toUpperCase()}
                  </h4>
                  <span className={`text-sm font-medium ${getStatusColor(config.status)}`}>
                    {config.status.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => toggleApiStatus(apiName)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    config.status === 'on'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {config.status === 'on' ? 'Turn Off' : 'Turn On'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="dark:text-[#B3B3B3] text-gray-600">Permissions:</span>
                  <div className="flex gap-1 mt-1">
                    {['read', 'write', 'admin'].map((perm) => (
                      <button
                        key={perm}
                        onClick={() => {
                          const newPerms = config.permissions.includes(perm)
                            ? config.permissions.filter(p => p !== perm)
                            : [...config.permissions, perm];
                          updateApiPermissions(apiName, newPerms);
                        }}
                        className={`px-2 py-1 text-xs rounded transition-all ${
                          config.permissions.includes(perm)
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-500'
                        }`}
                      >
                        {perm.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="dark:text-[#B3B3B3] text-gray-600">Usage:</span>
                  <div className="dark:text-[#B3B3B3] text-gray-900">{config.usage} / {config.limit}</div>
                  <div className="w-full bg-gray-200 dark:bg-[#171717] rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{width: `${(config.usage / config.limit) * 100}%`}}
                    ></div>
                  </div>
                </div>
                <div>
                  <span className="dark:text-[#B3B3B3] text-gray-600">Status:</span>
                  <div className={`font-medium ${getStatusColor(config.status)}`}>
                    {config.status === 'on' ? 'Operational' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6">
        <h3 className="text-lg font-semibold dark:text-[#B3B3B3] text-black mb-4">
          System Activity Logs
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-4 dark:text-[#B3B3B3] text-gray-500">
              No recent activity
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 text-sm p-2 rounded bg-gray-50 dark:bg-[#171717]">
                <span className="text-xs dark:text-[#B3B3B3] text-gray-500">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-[#0D0D0D] ${getSeverityColor(log.severity)}`}>
                  {log.type}
                </span>
                <span className="flex-1 dark:text-[#B3B3B3] text-gray-700">
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;