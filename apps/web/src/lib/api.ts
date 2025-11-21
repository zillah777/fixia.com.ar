/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { secureTokenManager } from '../utils/secureTokenManager';
import { logger } from '../utils/logger';

// API Configuration with robust validation
const getAPIBaseURL = (): string => {
  const envURL = import.meta.env.VITE_API_URL;

  // Validate environment URL if provided
  if (envURL) {
    try {
      new URL(envURL);
      return envURL;
    } catch (error) {
      console.error('😨 Invalid VITE_API_URL:', envURL);
      throw new Error('Invalid API URL configuration');
    }
  }

  // Production fallback
  if (import.meta.env.PROD) {
    console.error('😨 VITE_API_URL not configured for production!');
    throw new Error('API URL must be configured for production deployment');
  }

  // Development fallback
  const fallbackURL = 'http://localhost:4000';
  logger.warn('⚠️ Using fallback API URL for development:', fallbackURL);
  return fallbackURL;
};

const API_BASE_URL = getAPIBaseURL();

// Debug: Log the API base URL (only in development)
logger.debug('🔗 API Base URL:', API_BASE_URL);

// Create axios instance with secure httpOnly cookie configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds - Render.com free tier needs ~50s to wake up
  headers: {
    'Content-Type': 'application/json',
  },
  // SECURITY: Enable credentials for httpOnly cookie authentication
  withCredentials: true, // Required for httpOnly cookies
  maxContentLength: 50 * 1024 * 1024, // 50MB limit
  maxBodyLength: 50 * 1024 * 1024, // 50MB limit
  validateStatus: (status) => {
    // Accept 2xx and 3xx status codes
    return status >= 200 && status < 400;
  },
});

// SECURITY: Hybrid approach - httpOnly cookies + localStorage fallback for cross-domain
// Cookies are automatically included with withCredentials: true
// BUT for cross-domain (fixia.app → fixia-api.onrender.com), we need Authorization header
//
// SECURITY NOTE (CVSS 7.5 - High): localStorage tokens are vulnerable to XSS
// RECOMMENDED: When deployed to same domain, remove localStorage fallback and use httpOnly cookies only
// See audit: COMPREHENSIVE_SECURITY_AUDIT_2025.md - Section 1.1.2

// Helper to read cookie value
const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Request interceptor - Add Bearer token from localStorage for cross-domain compatibility
// Also adds CSRF token for state-changing requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // The Authorization header is no longer needed from the client.
    // The browser will automatically send the secure httpOnly cookie.

    // SECURITY: Add CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
    // CSRF protection is implemented on backend (see csrf.guard.ts)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
      // Exempt auth endpoints from CSRF validation (they have their own security)
      const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/verify', '/auth/logout'];
      const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));

      if (!isAuthEndpoint) {
        const csrfToken = getCookieValue('csrf-token');
        // SECURITY FIX: CSRF token is mandatory for state-changing requests (except auth)
        if (!csrfToken) {
          const errorMessage = 'CSRF token missing. Request blocked for security reasons. Please refresh the page.';
          console.error(errorMessage);
          toast.error('Error de seguridad. Por favor, recarga la página.');
          return Promise.reject(new Error(errorMessage));
        }
        if (config.headers) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
      }
    }

    // httpOnly cookies are also sent automatically as a fallback
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle global errors and token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // CRITICAL: Prevent infinite loops on auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');

    // Don't retry auth endpoints or if already retried
    if (error.response?.status === 401 && !originalRequest._retry &&
      !isAuthEndpoint &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/verify')) {

      // Prevent infinite refresh loops
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // The refresh logic is now handled by secureTokenManager, which relies on HttpOnly cookies.
      // We no longer need to manually handle refresh tokens from localStorage here.
      try {
        // Delegate refresh logic to the secure manager
        const refreshed = await secureTokenManager.refreshToken();

        if (refreshed) {
          logger.success('Token refreshed successfully via secure manager.');
          processQueue(null);
          return apiClient(originalRequest);
        } else {
          logger.error('Token refresh failed via secure manager.');
          throw new Error('Token refresh failed.');
        }
      } catch (refreshError) {
        processQueue(refreshError);

        // Check context BEFORE clearing data
        const currentPath = window.location.pathname;
        const isPublicPage = currentPath === '/' ||
          currentPath.startsWith('/services') ||
          currentPath.startsWith('/profile/') ||
          currentPath.startsWith('/terms') ||
          currentPath.startsWith('/privacy') ||
          currentPath.startsWith('/about') ||
          currentPath.startsWith('/how-it-works') ||
          currentPath.startsWith('/contact') ||
          currentPath.startsWith('/pricing') ||
          currentPath.startsWith('/help') ||
          currentPath.startsWith('/status') ||
          currentPath.startsWith('/tutorials');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register') ||
          currentPath.includes('/verify-email') || currentPath.includes('/forgot-password') ||
          currentPath.includes('/reset-password');
        const isAuthVerification = originalRequest?.url?.includes('/auth/verify') ||
          originalRequest?.url?.includes('/auth/me');
        const hadUserData = localStorage.getItem('fixia_user_basic');

        // The secureTokenManager's refreshToken method already handles clearing local data on failure.
        // No need to manually clear localStorage here.

        // Only redirect if:
        // 1. NOT on a public page (allow public pages to work without auth)
        // 2. NOT on an auth page already
        // 3. NOT just checking auth status (expected 401 on /auth/verify or /auth/me)
        // 4. User HAD data (meaning they were logged in but token expired)
        if (!isPublicPage && !isAuthPage && !isAuthVerification && hadUserData) {
          // Session truly expired for a logged-in user on a protected page
          logger.info('Session expired - redirecting to login');
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Enhanced error handling with specific messages
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Error desconocido';

      switch (status) {
        case 400:
          toast.error(message || 'Solicitud inválida. Verifica los datos enviados.');
          break;
        case 401:
          // Silent auth check for public pages - don't show errors
          const isPublicAuthCheck = error.config?.url?.includes('/auth/verify') ||
            (error.config?.url?.includes('/favorites/') && error.config?.url?.includes('/check')) ||
            error.config?.url?.includes('/auth/login');

          if (!isPublicAuthCheck) {
            console.info('Authentication required - redirecting to login');
            // Only show toast for authenticated operations (add/remove favorites)
            if (error.config?.url?.includes('/favorites/') && !error.config?.url?.includes('/check')) {
              toast.error('Debes iniciar sesión para agregar favoritos');
            }
          }
          // Suppress console logs for expected 401s on public pages
          break;
        case 403:
          toast.error('No tienes permisos para realizar esta acción.');
          break;
        case 404:
          toast.error('El recurso solicitado no fue encontrado.');
          break;
        case 409:
          toast.error('Conflicto con el estado actual del recurso.');
          break;
        case 422:
          toast.error('Los datos enviados no son válidos.');
          break;
        case 429:
          toast.error('Demasiadas solicitudes. Espera un momento e intenta nuevamente.');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Error del servidor. Por favor, intenta nuevamente.');
          break;
        default:
          if (status >= 400 && status < 500) {
            toast.error(message || 'Error en la solicitud.');
          } else if (status >= 500) {
            toast.error('Error interno del servidor.');
          }
      }
    } else if (error.code) {
      // Network errors
      switch (error.code) {
        case 'ECONNREFUSED':
        case 'ERR_NETWORK':
          toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
          break;
        case 'ECONNABORTED':
          toast.error('La solicitud tardó demasiado tiempo. Intenta nuevamente.');
          break;
        case 'ERR_CANCELED':
          // Don't show toast for cancelled requests
          break;
        default:
          toast.error('Error de conexión. Verifica tu red.');
      }
    } else {
      // Generic error
      console.error('Unknown API error:', error);
      if (import.meta.env.DEV) {
        toast.error('Error desconocido. Revisa la consola para más detalles.');
      } else {
        toast.error('Ocurrió un error inesperado.');
      }
    }

    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API methods wrapper with error handling
export const api = {
  get: <T = any>(url: string, config?: any): Promise<T> => {
    return apiClient.get(url, config).then(response => {
      // Handle backend's TransformInterceptor wrapper format
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return response.data.data;
      }
      return response.data;
    });
  },

  post: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return apiClient.post(url, data, config).then(response => {
      // Debug logging for /auth/login endpoint
      if (url.includes('/auth/login')) {
        logger.debug('🔍 RAW response from /auth/login:', {
          hasResponseData: !!response.data,
          responseDataKeys: response.data ? Object.keys(response.data) : [],
          hasSuccess: 'success' in (response.data || {}),
          hasData: 'data' in (response.data || {}),
          fullResponse: response.data,
        });
      }

      // Handle backend's TransformInterceptor wrapper format
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        if (url.includes('/auth/login')) {
          logger.debug('✅ Extracting response.data.data:', response.data.data);
        }
        return response.data.data;
      }

      if (url.includes('/auth/login')) {
        logger.debug('⚠️ Returning response.data directly (no wrapper):', response.data);
      }
      return response.data;
    });
  },

  put: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return apiClient.put(url, data, config).then(response => {
      // Handle backend's TransformInterceptor wrapper format
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return response.data.data;
      }
      return response.data;
    });
  },

  patch: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return apiClient.patch(url, data, config).then(response => {
      // Handle backend's TransformInterceptor wrapper format
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return response.data.data;
      }
      return response.data;
    });
  },

  delete: <T = any>(url: string, config?: any): Promise<T> => {
    return apiClient.delete(url, config).then(response => {
      // Handle backend's TransformInterceptor wrapper format
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return response.data.data;
      }
      return response.data;
    });
  },
};

// Public Stats API
export interface PublicStats {
  totalProfessionals: number;
  activeProfessionals: number;
  totalClients: number;
  totalServices: number;
  totalUsers: number;
}

export const getPublicStats = async (): Promise<PublicStats> => {
  return api.get<PublicStats>('/stats/public');
};

export default api;