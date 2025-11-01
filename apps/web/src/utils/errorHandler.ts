/**
 * Centralized error handling utilities for consistent error extraction and typing
 * Eliminates the need for `catch (error: any)` patterns throughout the codebase
 */

import { AxiosError } from 'axios';

/**
 * Standardized error response structure
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: string;
  statusCode?: number;
}

/**
 * Custom Error class that extends Error with proper typing
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Extract error message from various error types
 * Safely handles: AxiosError, Error, and unknown types
 *
 * @param error - The caught error (can be any type)
 * @param defaultMessage - Default message if error cannot be extracted
 * @returns Extracted error message
 *
 * @example
 * try {
 *   await api.post('/users');
 * } catch (error) {
 *   const message = extractErrorMessage(error);
 *   toast.error(message);
 * }
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred'
): string {
  // Axios error
  if (error instanceof AxiosError) {
    // First try response data message
    if (error.response?.data) {
      const data = error.response.data as any;
      if (typeof data.message === 'string') {
        return data.message;
      }
      if (typeof data.error === 'string') {
        return data.error;
      }
    }

    // Then try status text
    if (error.response?.statusText) {
      return error.response.statusText;
    }

    // Then try error message
    if (error.message) {
      return error.message;
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // App Error
  if (error instanceof AppError) {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  // Object with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const errorObj = error as any;
    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }
  }

  // Fallback
  return defaultMessage;
}

/**
 * Extract full error response with all details
 *
 * @param error - The caught error
 * @param defaultResponse - Default response if cannot extract
 * @returns ErrorResponse object with message, code, statusCode, and details
 */
export function extractErrorResponse(
  error: unknown,
  defaultResponse: ErrorResponse = { message: 'An unexpected error occurred' }
): ErrorResponse {
  // Axios error
  if (error instanceof AxiosError) {
    const data = error.response?.data as any;

    return {
      message: data?.message || error.message || defaultResponse.message,
      code: data?.code || error.code,
      statusCode: error.response?.status,
      details: data?.details || error.response?.statusText,
    };
  }

  // App Error
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      message: error.message || defaultResponse.message,
      details: error.stack,
    };
  }

  // Unknown error
  return defaultResponse;
}

/**
 * Extract HTTP status code from error
 *
 * @param error - The caught error
 * @returns HTTP status code or undefined
 */
export function extractErrorStatusCode(error: unknown): number | undefined {
  if (error instanceof AxiosError) {
    return error.response?.status;
  }

  if (error instanceof AppError) {
    return error.statusCode;
  }

  return undefined;
}

/**
 * Check if error is a specific HTTP status
 *
 * @param error - The caught error
 * @param status - HTTP status code to check for
 * @returns True if error is the specified status
 *
 * @example
 * if (isHttpError(error, 401)) {
 *   redirectToLogin();
 * }
 */
export function isHttpError(error: unknown, status: number): boolean {
  return extractErrorStatusCode(error) === status;
}

/**
 * Check if error is a specific type of error
 *
 * @param error - The caught error
 * @param statusRange - Status codes to check (e.g., [400, 499] for client errors)
 * @returns True if error falls in the range
 */
export function isHttpErrorInRange(
  error: unknown,
  statusRange: [number, number]
): boolean {
  const status = extractErrorStatusCode(error);
  if (!status) return false;
  return status >= statusRange[0] && status <= statusRange[1];
}

/**
 * Determine if error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  return isHttpErrorInRange(error, [400, 499]);
}

/**
 * Determine if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  return isHttpErrorInRange(error, [500, 599]);
}

/**
 * Determine if error is a network error (no response)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response && error.code === 'ERR_NETWORK';
  }
  return false;
}

/**
 * Determine if error is a timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.code === 'ECONNABORTED';
  }
  return false;
}

/**
 * Determine if error is an authentication error (401)
 */
export function isAuthenticationError(error: unknown): boolean {
  return isHttpError(error, 401);
}

/**
 * Determine if error is an authorization error (403)
 */
export function isAuthorizationError(error: unknown): boolean {
  return isHttpError(error, 403);
}

/**
 * Determine if error is a not found error (404)
 */
export function isNotFoundError(error: unknown): boolean {
  return isHttpError(error, 404);
}

/**
 * Determine if error is a validation error (422 or 400 with validation data)
 */
export function isValidationError(error: unknown): boolean {
  if (isHttpError(error, 422)) return true;
  if (error instanceof AxiosError && error.response?.status === 400) {
    const data = error.response.data as any;
    return !!(data?.errors || data?.validation);
  }
  return false;
}

/**
 * Safe error logging with proper typing
 *
 * @param error - The caught error
 * @param context - Additional context about where the error occurred
 */
export function logError(
  error: unknown,
  context?: string
): void {
  const errorResponse = extractErrorResponse(error);
  const contextStr = context ? ` [${context}]` : '';

  console.error(`❌ Error${contextStr}:`, {
    message: errorResponse.message,
    code: errorResponse.code,
    statusCode: errorResponse.statusCode,
    details: errorResponse.details,
    fullError: error,
  });
}

/**
 * Type guard to check if error is AxiosError
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is standard Error
 */
export function isStandardError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Get user-friendly error message based on error type
 * Used for displaying errors to users in UI
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Network connection error. Please check your internet connection.';
  }

  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.';
  }

  if (isAuthenticationError(error)) {
    return 'Your session has expired. Please log in again.';
  }

  if (isAuthorizationError(error)) {
    return 'You do not have permission to perform this action.';
  }

  if (isNotFoundError(error)) {
    return 'The requested resource was not found.';
  }

  if (isServerError(error)) {
    return 'Server error. Please try again later.';
  }

  if (isValidationError(error)) {
    return extractErrorMessage(error, 'Please check your input and try again.');
  }

  return extractErrorMessage(error);
}

export default {
  extractErrorMessage,
  extractErrorResponse,
  extractErrorStatusCode,
  isHttpError,
  isHttpErrorInRange,
  isClientError,
  isServerError,
  isNetworkError,
  isTimeoutError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
  isValidationError,
  logError,
  isAxiosError,
  isAppError,
  isStandardError,
  getUserFriendlyErrorMessage,
};
