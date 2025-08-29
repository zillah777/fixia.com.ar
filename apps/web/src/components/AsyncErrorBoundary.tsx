import React, { Component, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCcw, Wifi, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
  retryCount: number;
}

class AsyncErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isNetworkError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isNetworkError = error.name === 'NetworkError' || 
                          error.message.includes('fetch') ||
                          error.message.includes('network') ||
                          error.message.includes('Failed to load');

    return {
      hasError: true,
      error,
      isNetworkError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log async/network errors separately
    console.error('AsyncErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isNetworkError: this.state.isNetworkError,
      timestamp: new Date().toISOString()
    });

    // Auto-retry for network errors
    if (this.state.isNetworkError && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private scheduleRetry = () => {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000); // Exponential backoff
    
    this.retryTimeout = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <AsyncErrorFallback
        error={this.state.error}
        isNetworkError={this.state.isNetworkError}
        retryCount={this.state.retryCount}
        maxRetries={this.maxRetries}
        onRetry={this.handleManualRetry}
      />;
    }

    return this.props.children;
  }
}

function AsyncErrorFallback({
  error,
  isNetworkError,
  retryCount,
  maxRetries,
  onRetry
}: {
  error: Error | null;
  isNetworkError: boolean;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
}) {
  const isMaxRetriesReached = retryCount >= maxRetries;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 border border-red-200 rounded-lg bg-red-50 max-w-md mx-auto"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0">
          {isNetworkError ? (
            <WifiOff className="h-6 w-6 text-red-600" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-red-600" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-800">
            {isNetworkError ? 'Error de Conexión' : 'Error Asíncrono'}
          </h3>
          <p className="text-xs text-red-700 mt-1">
            {isNetworkError 
              ? 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
              : 'Hubo un problema cargando el contenido dinámico.'
            }
          </p>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && error && (
        <div className="mb-4 p-3 bg-red-100 rounded border text-xs font-mono text-red-800 break-all">
          {error.message}
        </div>
      )}

      {retryCount > 0 && (
        <div className="mb-4 text-xs text-red-600">
          Intentos: {retryCount}/{maxRetries}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onRetry}
          disabled={isMaxRetriesReached}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCcw className="h-4 w-4" />
          {isMaxRetriesReached ? 'Máx. intentos' : 'Reintentar'}
        </button>
        
        {isNetworkError && (
          <button
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Wifi className="h-4 w-4" />
            Recargar
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default AsyncErrorBoundary;