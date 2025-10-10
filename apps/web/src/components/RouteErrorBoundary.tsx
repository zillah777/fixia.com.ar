import React, { Component, ReactNode } from 'react';
import { motion } from "framer-motion";
import { Home, RefreshCcw, ArrowLeft, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  routeName?: string;
  fallbackRoute?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `route_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const routeError = {
      errorId: this.state.errorId,
      routeName: this.props.routeName || 'Unknown Route',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('RouteErrorBoundary caught error:', routeError);

    // Send route error to monitoring
    this.reportRouteError(routeError);
  }

  private reportRouteError = async (errorData: any) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/errors/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorData)
        });
      }
    } catch (reportingError) {
      console.error('Failed to report route error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.handleGoHome();
    }
  };

  private handleGoToFallback = () => {
    if (this.props.fallbackRoute) {
      window.location.href = this.props.fallbackRoute;
    } else {
      this.handleGoHome();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            {/* Error Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Bug className="h-10 w-10 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Error en la Página
              </h1>
              
              <p className="text-muted-foreground mb-4">
                {this.props.routeName ? (
                  <>Ocurrió un error en la página <span className="font-medium">{this.props.routeName}</span></>
                ) : (
                  'Ocurrió un error inesperado al cargar esta página'
                )}
              </p>

              {this.state.errorId && (
                <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 font-mono">
                  ID: {this.state.errorId}
                </div>
              )}
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Detalles del Error (Solo en Desarrollo)
                </h3>
                <div className="text-xs font-mono text-red-700 bg-white p-3 rounded border overflow-auto">
                  <div className="mb-2">
                    <strong>Mensaje:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-all">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            >
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCcw className="h-4 w-4" />
                Reintentar
              </button>
              
              <button
                onClick={this.handleGoBack}
                className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver Atrás
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-3 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                <Home className="h-4 w-4" />
                Ir al Inicio
              </button>
              
              {this.props.fallbackRoute && (
                <button
                  onClick={this.handleGoToFallback}
                  className="inline-flex items-center justify-center gap-2 bg-muted text-muted-foreground px-4 py-3 rounded-md text-sm font-medium hover:bg-muted/90 transition-colors"
                >
                  Página Alternativa
                </button>
              )}
            </motion.div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center text-sm text-muted-foreground"
            >
              <p>
                Si este problema persiste, puedes{' '}
                <a 
                  href="/contact" 
                  className="text-primary hover:underline"
                >
                  contactar soporte
                </a>
                {this.state.errorId && (
                  <> e incluir el ID de error mostrado arriba</>
                )}
              </p>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;