import React, { Component, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCcw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'component' | 'critical';
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  level: string;
  boundaryName: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error details for monitoring
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack || undefined,
      componentStack: errorInfo.componentStack || undefined,
      timestamp: Date.now(),
      level: this.props.level || 'component',
      boundaryName: this.props.name || 'Unknown'
    };

    console.error('Error Boundary caught an error:', errorDetails);

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(errorDetails);
    }
  };

  private sendToMonitoring = async (errorDetails: ErrorDetails) => {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails),
      });
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Different UI based on error level
      const level = this.props.level || 'component';

      if (level === 'critical') {
        return <CriticalErrorFallback 
          error={this.state.error}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />;
      }

      if (level === 'page') {
        return <PageErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />;
      }

      // Component level error
      return <ComponentErrorFallback
        error={this.state.error}
        onRetry={this.handleRetry}
        boundaryName={this.props.name}
      />;
    }

    return this.props.children;
  }
}

// Critical error fallback (for app-level errors)
function CriticalErrorFallback({ 
  error, 
  onReload, 
  onGoHome 
}: { 
  error: Error | null;
  onReload: () => void;
  onGoHome: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center"
      >
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Error Crítico de la Aplicación
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            La aplicación ha encontrado un error crítico y no puede continuar.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-4 p-3 bg-red-50 rounded-md text-left">
              <p className="text-xs font-mono text-red-800 break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onReload}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Recargar Aplicación
          </button>
          
          <button
            onClick={onGoHome}
            className="w-full inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir al Inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Page-level error fallback
function PageErrorFallback({
  error,
  onRetry,
  onReload,
  onGoHome
}: {
  error: Error | null;
  onRetry: () => void;
  onReload: () => void;
  onGoHome: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-6">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Bug className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Error en la Página
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Algo salió mal al cargar esta página. Puedes intentar de nuevo.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-4 p-3 bg-orange-50 rounded-md text-left">
              <p className="text-xs font-mono text-orange-800 break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Intentar de Nuevo
          </button>
          
          <button
            onClick={onGoHome}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir al Inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Component-level error fallback (minimal UI disruption)
function ComponentErrorFallback({
  error,
  onRetry,
  boundaryName
}: {
  error: Error | null;
  onRetry: () => void;
  boundaryName?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 border border-orange-200 rounded-md bg-orange-50"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Bug className="h-5 w-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-orange-800">
            Error en {boundaryName || 'componente'}
          </p>
          <p className="text-xs text-orange-700 mt-1">
            Este componente no pudo cargarse correctamente.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <p className="text-xs font-mono text-orange-600 mt-2 break-all">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onRetry}
            className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ErrorBoundary;