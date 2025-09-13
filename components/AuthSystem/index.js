import React, { useState } from 'react';
import { PERRETT_CONFIG } from '../../constants/perrettAssociates';
import { useAuth } from '../../hooks/useAuth';

const AuthSystem = ({ onAuthChange }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Notify parent component of auth changes
  React.useEffect(() => {
    onAuthChange?.(user);
  }, [user, onAuthChange]);

  // Secure server-side login handler
  const handleLogin = () => {
    setIsRedirecting(true);
    // Redirect to secure server-side login endpoint
    window.location.href = '/api/login';
  };

  // Secure server-side logout handler
  const handleLogout = () => {
    setIsRedirecting(true);
    // Redirect to secure server-side logout endpoint
    window.location.href = '/api/logout';
  };

  // Show loading state while checking authentication or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F80ED] mx-auto mb-4"></div>
          <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
            {isRedirecting ? 'Redirecting to secure authentication...' : 'Checking authentication status...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold dark:text-[#B3B3B3] text-black mb-2">
            Access {PERRETT_CONFIG.OWNER} <span className="text-xs font-normal">PERRETT and Associate Private Investment Firm LLC</span>
          </h2>
          <p className="text-sm dark:text-[#B3B3B3] text-gray-600">
            Secure login for {PERRETT_CONFIG.ASSOCIATION} platform
          </p>
        </div>

        {/* Secure Login Button */}
        <div className="space-y-4 mb-6">
          <button
            onClick={handleLogin}
            disabled={isRedirecting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-white bg-[#2F80ED] hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
            <span>
              {isRedirecting ? 'Redirecting...' : 'Secure Login with Replit Auth'}
            </span>
          </button>
          
          <div className="text-center">
            <p className="text-xs dark:text-[#B3B3B3] text-gray-500">
              Supports Google, GitHub, Apple, and email authentication
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-[#171717] rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                Enhanced Security
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Server-side authentication with quantum-enhanced session protection and role-based access control.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs dark:text-[#B3B3B3] text-gray-600 font-medium">
              Quantum-secured authentication
            </span>
          </div>
          <p className="text-xs dark:text-[#B3B3B3] text-gray-500">
            Powered by {PERRETT_CONFIG.QUANTUM_PRINCIPLES?.BLOCKCHAIN_TYPE || 'Quantum Blockchain Technology'}
          </p>
        </div>
      </div>
    );
  }

  // User is logged in - show user info
  return (
    <div className="bg-white dark:bg-[#0D0D0D] rounded-[10px] shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div className="flex-1">
          <h3 className="font-semibold dark:text-[#B3B3B3] text-black">{user.name}</h3>
          <p className="text-sm dark:text-[#B3B3B3] text-gray-600">{user.email}</p>
          <div className="flex gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {user.role?.toUpperCase() || 'USER'}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-[#171717] dark:text-[#B3B3B3] text-gray-700">
              {user.provider?.toUpperCase() || 'REPLIT'}
            </span>
          </div>
        </div>
      </div>

      {/* User Permissions */}
      <div className="mb-4">
        <h4 className="text-sm font-medium dark:text-[#B3B3B3] text-gray-900 mb-2">Permissions</h4>
        <div className="flex gap-2">
          {(user.permissions || []).map((permission) => (
            <span 
              key={permission}
              className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700"
            >
              {permission?.toUpperCase() || 'STANDARD'}
            </span>
          ))}
        </div>
      </div>

      {/* Session Info */}
      <div className="text-xs dark:text-[#B3B3B3] text-gray-500 mb-4">
        <div className="flex justify-between items-center">
          <span>
            Logged in: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Just now'}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs">Secure Session</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
      >
        Logout
      </button>
    </div>
  );
};

export default AuthSystem;