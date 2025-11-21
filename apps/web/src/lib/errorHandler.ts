import { toast } from 'sonner';

export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

/**
 * Centralized API error handler
 * Extracts error message, shows toast notification, and logs in development
 */
export function handleApiError(error: any, customMessage?: string): ApiError {
    // Extract error message from various error formats
    const message =
        error?.response?.data?.message ||
        error?.message ||
        customMessage ||
        'Ocurrió un error inesperado';

    const statusCode = error?.response?.status;
    const errors = error?.response?.data?.errors;

    // Show toast notification to user
    toast.error(message);

    // Log detailed error in development
    if (import.meta.env.DEV) {
        console.error('[API Error]', {
            message,
            statusCode,
            errors,
            originalError: error,
            stack: error?.stack,
        });
    }

    return { message, statusCode, errors };
}

/**
 * Extract error message from error object
 */
export function getErrorMessage(error: any): string {
    return (
        error?.response?.data?.message ||
        error?.message ||
        'Ocurrió un error inesperado'
    );
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
    return (
        error?.message === 'Network Error' ||
        error?.code === 'ECONNABORTED' ||
        !error?.response
    );
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
    const statusCode = error?.response?.status;
    return statusCode === 401 || statusCode === 403;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
    const statusCode = error?.response?.status;
    return statusCode === 400 || statusCode === 422;
}

/**
 * Get user-friendly error message based on status code
 */
export function getFriendlyErrorMessage(error: any): string {
    const statusCode = error?.response?.status;

    switch (statusCode) {
        case 400:
            return 'Los datos enviados no son válidos. Por favor, verifica e intenta nuevamente.';
        case 401:
            return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        case 403:
            return 'No tienes permiso para realizar esta acción.';
        case 404:
            return 'El recurso solicitado no fue encontrado.';
        case 409:
            return 'Ya existe un recurso con estos datos.';
        case 422:
            return 'Los datos enviados no son válidos. Por favor, verifica e intenta nuevamente.';
        case 429:
            return 'Demasiadas solicitudes. Por favor, espera un momento e intenta nuevamente.';
        case 500:
            return 'Error del servidor. Por favor, intenta nuevamente más tarde.';
        case 503:
            return 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.';
        default:
            if (isNetworkError(error)) {
                return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
            }
            return getErrorMessage(error);
    }
}
