import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorId: string | null;
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  onError?: (error: Error) => void;
  reportToMonitoring?: boolean;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorId: null
  });

  const handleError = useCallback((error: Error, context?: string) => {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update error state
    setErrorState({
      error,
      isError: true,
      errorId
    });

    // Show toast notification if enabled
    if (options.showToast !== false) {
      const message = options.fallbackMessage || error.message || 'Ocurrió un error inesperado';
      toast.error(message, {
        description: context ? `Contexto: ${context}` : undefined,
        action: {
          label: 'Cerrar',
          onClick: () => {}
        }
      });
    }

    // Call custom error handler
    options.onError?.(error);

    // Log error
    console.error('useErrorHandler caught error:', {
      errorId,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // Report to monitoring if enabled
    if (options.reportToMonitoring !== false) {
      reportError(error, context, errorId);
    }
  }, [options]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorId: null
    });
  }, []);

  // Wrapper for async functions
  const withErrorHandling = useCallback(<T extends (...args: any[]) => Promise<any>>(
    asyncFn: T,
    context?: string
  ): T => {
    return (async (...args: any[]) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        handleError(error as Error, context);
        throw error; // Re-throw so caller can handle if needed
      }
    }) as T;
  }, [handleError]);

  // Wrapper for sync functions that might throw
  const withSyncErrorHandling = useCallback(<T extends (...args: any[]) => any>(
    syncFn: T,
    context?: string
  ): T => {
    return ((...args: any[]) => {
      try {
        return syncFn(...args);
      } catch (error) {
        handleError(error as Error, context);
        throw error;
      }
    }) as T;
  }, [handleError]);

  return {
    ...errorState,
    handleError,
    clearError,
    withErrorHandling,
    withSyncErrorHandling
  };
}

// Async error reporting function
async function reportError(error: Error, context?: string, errorId?: string) {
  try {
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/errors/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId,
          message: error.message,
          stack: error.stack,
          context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });
    }
  } catch (reportingError) {
    console.error('Failed to report error to monitoring:', reportingError);
  }
}

// Hook for handling network/API errors specifically
export function useApiErrorHandler() {
  const { handleError, ...rest } = useErrorHandler({
    showToast: true,
    reportToMonitoring: true
  });

  const handleApiError = useCallback((error: any, endpoint?: string) => {
    let processedError = error;

    // Process different types of API errors
    if (error?.response) {
      // HTTP error response
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      processedError = new Error(`API Error ${status}: ${message}`);
      processedError.name = 'ApiError';
    } else if (error?.request) {
      // Network error
      processedError = new Error('Error de red: No se pudo conectar al servidor');
      processedError.name = 'NetworkError';
    } else if (typeof error === 'string') {
      processedError = new Error(error);
    }

    handleError(processedError, endpoint ? `API: ${endpoint}` : 'API');
  }, [handleError]);

  return {
    ...rest,
    handleError: handleApiError,
    handleApiError
  };
}

// Hook for form validation errors
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const hasFieldError = useCallback((field: string) => {
    return Boolean(fieldErrors[field]);
  }, [fieldErrors]);

  const getFieldError = useCallback((field: string) => {
    return fieldErrors[field] || null;
  }, [fieldErrors]);

  return {
    fieldErrors,
    handleFieldError,
    clearFieldError,
    clearAllFieldErrors,
    hasFieldError,
    getFieldError
  };
}