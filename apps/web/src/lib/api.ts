import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'fixia_token';
const REFRESH_TOKEN_KEY = 'fixia_refresh_token';

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  
  setRefreshToken: (refreshToken: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  
  removeRefreshToken: (): void => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle global errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      tokenManager.removeToken();
      tokenManager.removeRefreshToken();
      localStorage.removeItem('fixia_user');
      
      // Only show toast if we're not on the login page
      if (!window.location.pathname.includes('/login')) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } else if (error.response?.status >= 500) {
      toast.error('Error del servidor. Por favor, intenta nuevamente.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
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
    return apiClient.get(url, config).then(response => response.data);
  },

  post: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return apiClient.post(url, data, config).then(response => response.data);
  },

  put: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return apiClient.put(url, data, config).then(response => response.data);
  },

  patch: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return apiClient.patch(url, data, config).then(response => response.data);
  },

  delete: <T = any>(url: string, config?: any): Promise<T> => {
    return apiClient.delete(url, config).then(response => response.data);
  },
};

export default api;