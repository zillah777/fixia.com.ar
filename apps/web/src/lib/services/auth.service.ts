/**
 * @deprecated This auth service is deprecated in favor of SecureAuthContext methods.
 * It still uses localStorage token management which is less secure.
 * New code should use the SecureAuthContext directly which uses httpOnly cookies.
 */

import { api } from '../api';
import { User } from '../../context/SecureAuthContext';

// DEPRECATED: Stub tokenManager for backward compatibility
const tokenManager = {
  setToken: (token: string) => localStorage.setItem('fixia_token', token),
  getToken: () => localStorage.getItem('fixia_token'),
  removeToken: () => localStorage.removeItem('fixia_token'),
  setRefreshToken: (token: string) => localStorage.setItem('fixia_refresh_token', token),
  getRefreshToken: () => localStorage.getItem('fixia_refresh_token'),
  removeRefreshToken: () => localStorage.removeItem('fixia_refresh_token'),
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  userType: 'client' | 'professional';
  location?: string;
  phone?: string;
  birthdate?: string;
  // Professional-specific fields
  serviceCategories?: string[];
  description?: string;
  experience?: string;
  pricing?: string;
  availability?: string;
  portfolio?: string;
  certifications?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens
    if (response.access_token) {
      tokenManager.setToken(response.access_token);
    }
    if (response.refresh_token) {
      tokenManager.setRefreshToken(response.refresh_token);
    }
    
    return response;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    // Store tokens
    if (response.access_token) {
      tokenManager.setToken(response.access_token);
    }
    if (response.refresh_token) {
      tokenManager.setRefreshToken(response.refresh_token);
    }
    
    return response;
  },

  async logout(): Promise<void> {
    try {
      // The backend expects a refresh_token in the request body
      const refreshToken = localStorage.getItem('fixia_refresh_token');
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.warn('Logout request failed, but clearing local data');
    } finally {
      tokenManager.removeToken();
      localStorage.removeItem('fixia_user');
      localStorage.removeItem('fixia_refresh_token');
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = tokenManager.getRefreshToken();
    const response = await api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
    
    if (response.access_token) {
      tokenManager.setToken(response.access_token);
    }
    if (response.refresh_token) {
      tokenManager.setRefreshToken(response.refresh_token);
    }
    
    return response;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, new_password: newPassword });
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async resendVerificationEmail(): Promise<void> {
    await api.post('/auth/resend-verification');
  },
};

export default authService;