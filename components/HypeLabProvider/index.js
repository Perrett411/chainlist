import { useEffect, useState } from "react";
import { HYPELAB_API_URL, HYPELAB_PROPERTY_SLUG } from "../../constants/hypelab";

// Feature flag to disable HypeLab in development
const DISABLE_IN_DEVELOPMENT = process.env.NODE_ENV === 'development';

const HypeLabProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Client-only guard - ensure we're running on the client
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setIsClient(true);
      }
    } catch (error) {
      console.warn('[HypeLab Provider] Client detection failed:', error);
      setInitError(error);
    }
  }, []);

  // Initialize HypeLab with proper error handling
  useEffect(() => {
    // Skip initialization if disabled in development
    if (DISABLE_IN_DEVELOPMENT) {
      console.log('[HypeLab Provider] Skipped initialization - development mode');
      return;
    }

    // Only initialize if we're on the client
    if (!isClient) {
      return;
    }

    // Defensive guards for required globals
    if (typeof window === 'undefined') {
      console.warn('[HypeLab Provider] Window object not available');
      return;
    }

    if (typeof document === 'undefined') {
      console.warn('[HypeLab Provider] Document object not available');
      return;
    }

    let timeoutId;
    let isComponentMounted = true;

    const initializeHypeLab = async () => {
      try {
        console.log('[HypeLab Provider] Starting initialization...');

        // Check if HypeLab is already loaded
        if (typeof window.HypeLab !== 'undefined') {
          console.log('[HypeLab Provider] Already initialized');
          if (isComponentMounted) {
            setIsInitialized(true);
          }
          return;
        }

        // Load HypeLab script with error handling
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://api.hypelab.com/v1/scripts/hp-sdk.js?v=0';
        
        script.onload = () => {
          try {
            if (typeof window.HypeLab === 'undefined') {
              throw new Error('HypeLab SDK not loaded after script execution');
            }

            const config = {
              URL: HYPELAB_API_URL,
              propertySlug: HYPELAB_PROPERTY_SLUG,
              environment: process.env.NODE_ENV || 'development'
            };

            console.log('[HypeLab Provider] Initializing with config:', config);
            window.HypeLab.initialize(config);
            
            if (isComponentMounted) {
              setIsInitialized(true);
              setInitError(null);
              console.log('[HypeLab Provider] Successfully initialized');
            }
          } catch (error) {
            console.error('[HypeLab Provider] Initialization error:', {
              message: error.message,
              stack: error.stack,
              config: { URL: HYPELAB_API_URL, propertySlug: HYPELAB_PROPERTY_SLUG }
            });
            if (isComponentMounted) {
              setInitError(error);
            }
          }
        };

        script.onerror = (event) => {
          const error = new Error(`Failed to load HypeLab script: ${event.message || 'Network error'}`);
          console.error('[HypeLab Provider] Script load error:', {
            message: error.message,
            event,
            src: script.src
          });
          if (isComponentMounted) {
            setInitError(error);
          }
        };

        // Add script to document
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        } else {
          document.head.appendChild(script);
        }

        // Set timeout for initialization
        timeoutId = setTimeout(() => {
          if (!isInitialized && isComponentMounted) {
            const timeoutError = new Error('HypeLab initialization timeout');
            console.warn('[HypeLab Provider] Initialization timeout');
            setInitError(timeoutError);
          }
        }, 10000); // 10 second timeout

      } catch (error) {
        console.error('[HypeLab Provider] Unexpected initialization error:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        if (isComponentMounted) {
          setInitError(error);
        }
      }
    };

    initializeHypeLab();

    // Cleanup function
    return () => {
      isComponentMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isClient, isInitialized]);

  // Global error handler for unhandled HypeLab errors
  useEffect(() => {
    if (!isClient) return;

    const handleGlobalError = (event) => {
      try {
        const error = event.error || event.reason || event;
        const errorMessage = error?.message || 'Unknown error';
        
        // Check if this is a HypeLab-related error
        if (errorMessage.toLowerCase().includes('hypelab') || 
            event.filename?.includes('hypelab') ||
            event.filename?.includes('hp-sdk')) {
          
          console.error('[HypeLab Provider] Global error caught:', {
            message: errorMessage,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: error?.stack,
            error: error
          });
          
          // Prevent the error from propagating as an uncaught exception
          event.preventDefault?.();
          return true;
        }
      } catch (handlerError) {
        console.error('[HypeLab Provider] Error in global error handler:', handlerError);
      }
    };

    const handleUnhandledRejection = (event) => {
      try {
        const reason = event.reason || event;
        const reasonMessage = reason?.message || String(reason);
        
        // Check if this is a HypeLab-related rejection
        if (reasonMessage.toLowerCase().includes('hypelab')) {
          console.error('[HypeLab Provider] Global promise rejection caught:', {
            reason: reasonMessage,
            stack: reason?.stack,
            originalReason: reason
          });
          
          // Prevent the unhandled rejection
          event.preventDefault?.();
          return true;
        }
      } catch (handlerError) {
        console.error('[HypeLab Provider] Error in unhandled rejection handler:', handlerError);
      }
    };

    // Add global error listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isClient]);

  // Don't render children if HypeLab is disabled in development
  if (DISABLE_IN_DEVELOPMENT) {
    return children;
  }

  // Don't render children until client is ready
  if (!isClient) {
    return null;
  }

  // If there's an initialization error, log it but still render children
  if (initError) {
    console.warn('[HypeLab Provider] Rendering children despite error:', initError.message);
  }

  // Return children directly since HypeLab is initialized via script injection
  return children;
};

export default HypeLabProvider;