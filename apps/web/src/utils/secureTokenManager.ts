import { api } from '../lib/api';
import React from 'react';

interface TokenInfo {
  isAuthenticated: boolean;
  expiresAt?: number;
  lastRefresh?: number;
}

type AuthStateListener = (isAuthenticated: boolean) => void;

/**
 * Gestor seguro de tokens que usa httpOnly cookies en lugar de localStorage
 * Los tokens reales se almacenan en cookies httpOnly inaccesibles desde JavaScript
 */
class SecureTokenManager {
  private listeners: AuthStateListener[] = [];
  private tokenInfo: TokenInfo = { isAuthenticated: false };
  private refreshPromise: Promise<void> | null = null;
  private currentUser: any | null = null; // Store user data internally
  private skipVerificationUntil = 0; // Timestamp until which to skip verification after login

  /**
   * Verifica si el usuario está autenticado
   * Se basa en la presencia de cookies httpOnly que solo el servidor puede leer
   */
  async isAuthenticated(skipVerification: boolean = false): Promise<boolean> {
    // If login recently succeeded, skip verification to prevent race conditions
    const now = Date.now();
    if ((now < this.skipVerificationUntil) || skipVerification) {
      return this.tokenInfo.isAuthenticated;
    }

    try {
      // Hacer una llamada liviana al servidor para verificar la autenticación
      const response = await api.get('/auth/verify');
      this.currentUser = response.data?.user || null;

      if (response.data) {
        this.tokenInfo = {
          isAuthenticated: true,
          expiresAt: response.data.expiresAt,
          lastRefresh: Date.now(),
        };
        console.log('✅ Authentication verified successfully');
        return true;
      } else {
        this.currentUser = null;
        this.tokenInfo = { isAuthenticated: false };
        return false;
      }
    } catch (error: any) {
      // Don't log 401 errors as they're expected when user is not authenticated
      if (error?.response?.status !== 401) {
        console.error('Error verificando autenticación:', error);
      } else {
        // Silent handling for expected 401 responses (user not logged in)
        console.debug('No authenticated session found - this is normal on first visit');
      }
      this.currentUser = null;
      this.tokenInfo = { isAuthenticated: false };
      return false;
    }
  }

  /**
   * Realizar login y establecer cookies httpOnly en el servidor
   * FALLBACK: También almacena tokens en localStorage para cross-domain compatibility
   */
  async login(credentials: { email: string; password: string }): Promise<{
    success: boolean;
    user?: any;
    error?: string;
  }> {
    try {
      const data = await api.post('/auth/login', credentials);

      // Debug: Log the actual response structure
      console.log('🔍 Login response data:', {
        hasUser: !!data?.user,
        hasAccessToken: !!data?.access_token,
        hasRefreshToken: !!data?.refresh_token,
        dataKeys: Object.keys(data || {}),
      });

      // API wrapper extracts the inner data automatically
      // So data is now: { user: {...}, access_token: "...", expires_in: ... }
      let userData;
      let expiresAt;
      let accessToken;
      let refreshToken;

      if (data?.user) {
        userData = data.user;
        expiresAt = data.expires_in || data.expiresIn;
        // Backend's SnakeToCamelInterceptor converts to camelCase
        accessToken = data.access_token || data.accessToken;
        refreshToken = data.refresh_token || data.refreshToken;
      } else {
        // Log what we actually received for debugging
        console.error('Unexpected login response format:', data);
      }

      // Verify we got user data
      if (!userData) {
        console.error('No user data received from login response:', data);
        return {
          success: false,
          error: 'No se recibieron datos del usuario en la respuesta del login',
        };
      }

      // The server is now responsible for setting the httpOnly cookies.
      // The client no longer needs to store tokens in localStorage.
      // We will still clear any old data from localStorage on logout.

      // Store user data internally for consistency
      this.currentUser = userData;

      console.log('✅ Authentication successful - tokens storage attempted');

      this.tokenInfo = {
        isAuthenticated: true,
        expiresAt: expiresAt,
        lastRefresh: Date.now(),
      };

      // Set timestamp to skip verification for the next 5 seconds after login
      this.skipVerificationUntil = Date.now() + 5000;

      return {
        success: true,
        user: userData,
      };
    } catch (error: any) {
      // Enhanced error logging to debug cryptic errors
      console.error('Error en login - Details:', {
        message: error?.message || 'Unknown error',
        response: error?.response?.data || 'No response data',
        status: error?.response?.status || 'No status',
        stack: error?.stack?.substring(0, 200) + '...' || 'No stack trace'
      });

      return {
        success: false,
        error: error?.response?.data?.message || error?.message || 'Error de conexión',
      };
    }
  }

  /**
   * Realizar el registro de un nuevo usuario.
   * No inicia sesión automáticamente; el backend debe enviar un email de verificación.
   */
  async register(userData: any): Promise<{ success: boolean; error?: string }> {
    try {
      // El endpoint de registro no devuelve datos de sesión, solo un mensaje de éxito.
      await api.post('/auth/register', userData);
      return { success: true };
    } catch (error: any) {
      // El interceptor de api.ts ya muestra un toast con el error.
      // Aquí devolvemos el mensaje para que el formulario pueda manejarlo si es necesario.
      console.error('Error en registro - Details:', {
        message: error?.message || 'Unknown error',
        response: error?.response?.data || 'No response data',
      });

      return {
        success: false,
        error: error?.response?.data?.message || error?.message || 'Error de registro',
      };
    }
  }

  /**
   * Realizar logout y limpiar cookies httpOnly en el servidor
   * Las cookies httpOnly se limpian automáticamente en el servidor
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.tokenInfo = { isAuthenticated: false };
      // Clear any remaining sensitive data from local storage.
      this.clearLocalData();
      this.notifyListeners();
    }
  }

  /**
   * Refrescar token automáticamente
   * El servidor maneja la rotación de tokens de forma segura
   */
  async refreshToken(): Promise<boolean> {
    // Evitar múltiples refreshes simultáneos
    if (this.refreshPromise) {
      await this.refreshPromise;
      return this.tokenInfo.isAuthenticated;
    }

    this.refreshPromise = this._performRefresh();
    
    try {
      await this.refreshPromise;
      return this.tokenInfo.isAuthenticated;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _performRefresh(): Promise<void> {
    try {
      // The refresh endpoint now uses httpOnly cookies for the refresh token.
      const data = await api.post('/auth/refresh', {});
      this.currentUser = data.user || null;

      this.tokenInfo = {
        isAuthenticated: true,
        expiresAt: data.expiresAt,
        lastRefresh: Date.now(),
      };
    } catch (error: any) {
      // Only log unexpected errors, not 401s which are normal when refresh token expired
      if (error?.response?.status !== 401) {
        console.error('Error refrescando token:', error);
      } else {
        console.debug('Refresh token expired or invalid - user needs to login again');
      }
      this.currentUser = null;
      this.tokenInfo = { isAuthenticated: false };
      this.clearLocalData();
      this.notifyListeners(); // CRITICAL: Notify listeners on refresh failure
    }
  }

  /**
   * Verificar si el token está próximo a vencer y refrescarlo automáticamente
   */
  async checkAndRefreshToken(): Promise<boolean> {
    if (!this.tokenInfo.isAuthenticated) {
      return false;
    }

    // Si no tenemos información de expiración, verificar con el servidor
    if (!this.tokenInfo.expiresAt) {
      return await this.isAuthenticated();
    }

    // Refrescar si falta menos de 5 minutos para que expire
    const fiveMinutesInMs = 5 * 60 * 1000;
    const now = Date.now();
    
    if (this.tokenInfo.expiresAt - now < fiveMinutesInMs) {
      return await this.refreshToken();
    }

    return true;
  }

  /**
   * Limpiar datos locales (pero no las cookies httpOnly, eso lo hace el servidor)
   */
  private clearLocalData(): void {
    // Limpiar cualquier dato sensible del localStorage/sessionStorage
    localStorage.removeItem('fixia_user');
    localStorage.removeItem('fixia_preferences');
    localStorage.removeItem('fixia_access_token');
    localStorage.removeItem('fixia_refresh_token');
    sessionStorage.clear();
  }

  // --- Event Listener System ---
  subscribe(listener: AuthStateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.tokenInfo.isAuthenticated);
    }
  }

  /**
   * Obtener información básica del estado de autenticación (sin tokens)
   */
  getAuthState(): TokenInfo {
    return { ...this.tokenInfo };
  }

  /**
   * Configurar interceptor para axios/fetch que maneje automáticamente la autenticación
   */
  setupAxiosInterceptor() {
    // Los interceptores de axios no están disponibles en nuestro api wrapper personalizado
    // La autenticación se maneja automáticamente via httpOnly cookies
    console.log('SecureTokenManager initialized for httpOnly cookie authentication');
  }

  /**
   * Inicializar el gestor de tokens
   */
  async initialize(): Promise<boolean> {
    this.setupAxiosInterceptor();
    // Don't automatically verify on initialization to prevent redirect loops
    // Verification will happen when needed by the context
    return this.tokenInfo.isAuthenticated;
  }
}

// Instancia singleton
export const secureTokenManager = new SecureTokenManager();

/**
 * Hook para usar el gestor seguro de tokens en componentes React
 * Note: This hook is kept for backward compatibility but SecureAuthContext should be used instead
 */
export const useSecureAuth = () => {
  const [authState, setAuthState] = React.useState<TokenInfo>({ isAuthenticated: false });

  React.useEffect(() => {
    const checkAuth = async () => {
      // Get current auth state without triggering verification on first load
      const currentState = secureTokenManager.getAuthState();
      setAuthState(currentState);
      
      // Only verify if we think we should be authenticated but haven't verified recently
      if (currentState.isAuthenticated && 
          (!currentState.lastRefresh || Date.now() - currentState.lastRefresh > 10 * 60 * 1000)) {
        const isAuth = await secureTokenManager.isAuthenticated();
        setAuthState(secureTokenManager.getAuthState());
      }
    };

    checkAuth();

    // Verificar autenticación cada 10 minutos (less frequent)
    const interval = setInterval(checkAuth, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...authState,
    login: secureTokenManager.login.bind(secureTokenManager),
    logout: secureTokenManager.logout.bind(secureTokenManager),
    refreshToken: secureTokenManager.refreshToken.bind(secureTokenManager),
  };
};

export default secureTokenManager;