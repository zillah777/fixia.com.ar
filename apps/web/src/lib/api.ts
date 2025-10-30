/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

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
  console.warn('⚠️ Using fallback API URL for development:', fallbackURL);
  return fallbackURL;
};

const API_BASE_URL = getAPIBaseURL();

// Debug: Log the API base URL (only in development)
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

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

// Request interceptor - Add Bearer token from localStorage for cross-domain compatibility
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // FALLBACK: For cross-domain compatibility, add token from localStorage to Authorization header
    // This is necessary because httpOnly cookies don't work between fixia.app and fixia-api.onrender.com
    const accessToken = localStorage.getItem('fixia_access_token');

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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

    if (error.response?.status === 401 && !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/verify')) {
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

      try {
        // SECURITY: Attempt token refresh via httpOnly cookies AND localStorage token
        const refreshToken = localStorage.getItem('fixia_refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            withCredentials: true, // Include httpOnly cookies
            timeout: 5000,
            validateStatus: (status) => status === 200
          }
        );

        if (response.status === 200 && response.data) {
          // Update access token in localStorage if provided
          const newAccessToken = response.data.access_token || response.data.data?.access_token;
          if (newAccessToken) {
            localStorage.setItem('fixia_access_token', newAccessToken);
            console.log('✅ Access token refreshed and stored');
          }

          processQueue(null);
          return apiClient(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError);

        // Check context BEFORE clearing data
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register') ||
                          currentPath.includes('/verify-email') || currentPath.includes('/forgot-password');
        const isAuthVerification = originalRequest?.url?.includes('/auth/verify');
        const hadUserData = localStorage.getItem('fixia_user_basic');

        // Clear all authentication data on refresh failure
        localStorage.removeItem('fixia_access_token');
        localStorage.removeItem('fixia_refresh_token');
        localStorage.removeItem('fixia_user_basic');
        localStorage.removeItem('fixia_preferences');

        // Only redirect if:
        // 1. NOT on an auth page already
        // 2. NOT just checking auth status (expected 401 on /auth/verify)
        // 3. User HAD data (meaning they were logged in but token expired)
        if (!isAuthPage && !isAuthVerification && hadUserData) {
          // Session truly expired
          console.log('Session expired - redirecting to login');
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
          // 401 errors are handled by interceptors - don't show toast for login attempts
          if (!error.config?.url?.includes('/auth/login')) {
            console.info('Authentication required - redirecting to login');
          }
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
      // Handle backend's TransformInterceptor wrapper format
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return response.data.data;
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