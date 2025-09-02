import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { secureTokenManager } from '../utils/secureTokenManager';
import { sanitizeInput, detectMaliciousContent } from '../utils/sanitization';
import { validatePassword } from '../utils/passwordValidation';
import { validateProductionCredentials } from '../utils/credentialValidator';

// Interfaces existentes mantenidas para compatibilidad
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_date?: string;
  category: 'verification' | 'reputation' | 'quality' | 'experience';
}

export interface User {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  userType: 'client' | 'professional';
  location?: string;
  planType: 'free' | 'premium';
  isVerified: boolean;
  emailVerified: boolean;
  role?: string;
  
  // Professional specific fields
  professionalProfile?: {
    id: string;
    serviceCategories: string[];
    description: string;
    experience: string;
    pricing: string;
    availability: string;
    portfolio?: string;
    certifications?: string;
    averageRating: number;
    totalReviews: number;
    totalServices: number;
    completedServices: number;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  
  // Legacy fields for backwards compatibility
  accountType: 'client' | 'professional';
  availability: 'available' | 'busy' | 'offline';
  badges: Badge[];
  totalServices: number;
  completedServices: number;
  averageRating: number;
  totalReviews: number;
  joinDate: string;
  
  // Contact limits for clients
  pendingContactRequests: number;
  maxContactRequests: number;
  
  // Argentina specific (computed from location)
  province: string;
  city: string;
  
  // Promotion tracking
  isLaunchPromotion: boolean;
  promotionExpiryDate?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

interface SecureAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateAvailability: (status: 'available' | 'busy' | 'offline') => Promise<void>;
  // Legacy compatibility methods
  requestContactProfessional: (professionalId: string, message?: string) => Promise<void>;
  respondToContactRequest: (requestId: string, accept: boolean, message?: string) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email?: string) => Promise<void>;
}

interface RegisterRequest {
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

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

// Transformación segura de datos del backend con sanitización
const transformBackendUserSecurely = (backendUser: any): User => {
  if (!backendUser || typeof backendUser !== 'object') {
    throw new Error('Datos de usuario inválidos recibidos del servidor');
  }

  // Sanitizar todos los campos de texto del usuario
  const sanitizedName = sanitizeInput(backendUser.name || backendUser.fullName || '', 'plainText');
  const sanitizedLastName = sanitizeInput(backendUser.lastName || '', 'plainText');
  const sanitizedLocation = sanitizeInput(backendUser.location || '', 'plainText');
  const sanitizedPhone = sanitizeInput(backendUser.phone || '', 'phone');
  const sanitizedEmail = sanitizeInput(backendUser.email || '', 'email');

  // Validar que los datos sanitizados no estén vacíos para campos críticos
  if (!sanitizedName || !sanitizedEmail) {
    throw new Error('Datos de usuario críticos están vacíos después de la sanitización');
  }

  // Detectar contenido malicioso en campos críticos
  const nameCheck = detectMaliciousContent(sanitizedName);
  const emailCheck = detectMaliciousContent(sanitizedEmail);

  if (!nameCheck.isSafe || !emailCheck.isSafe) {
    console.error('Contenido malicioso detectado en datos de usuario:', {
      nameReasons: nameCheck.reasons,
      emailReasons: emailCheck.reasons
    });
    throw new Error('Datos de usuario contienen contenido no seguro');
  }

  const now = new Date().toISOString();

  // Parse location safely
  let city = '';
  let province = 'Chubut';
  
  if (sanitizedLocation) {
    const locationParts = sanitizedLocation.includes(',') 
      ? sanitizedLocation.split(',').map(part => part.trim()) 
      : [sanitizedLocation];
    
    city = locationParts[0] || '';
    province = locationParts[1] || 'Chubut';
  }

  // Construir objeto usuario con datos sanitizados
  const baseUser: User = {
    id: String(backendUser.id || backendUser._id || ''),
    email: sanitizedEmail,
    name: sanitizedName,
    lastName: sanitizedLastName || undefined,
    phone: sanitizedPhone || undefined,
    avatar: backendUser.avatar || undefined,
    userType: ['client', 'professional'].includes(backendUser.userType) 
      ? backendUser.userType 
      : 'client',
    location: sanitizedLocation || undefined,
    planType: ['free', 'premium'].includes(backendUser.planType) 
      ? backendUser.planType 
      : 'free',
    isVerified: Boolean(backendUser.isVerified),
    emailVerified: Boolean(backendUser.emailVerified || backendUser.email_verified),
    role: backendUser.role || undefined,
    accountType: ['client', 'professional'].includes(backendUser.userType) 
      ? backendUser.userType 
      : 'client',
    availability: 'available',
    badges: Array.isArray(backendUser.badges) ? backendUser.badges : [],
    totalServices: Number(backendUser.totalServices) || 0,
    completedServices: Number(backendUser.completedServices) || 0,
    averageRating: Number(backendUser.averageRating) || 0,
    totalReviews: Number(backendUser.totalReviews) || 0,
    joinDate: backendUser.created_at || backendUser.createdAt || now,
    
    // Contact limits
    pendingContactRequests: Number(backendUser.pendingContactRequests) || 0,
    maxContactRequests: Number(backendUser.maxContactRequests) || 3,
    
    // Argentina specific
    province,
    city,
    
    // Promotion tracking
    isLaunchPromotion: Boolean(backendUser.isLaunchPromotion),
    promotionExpiryDate: backendUser.promotionExpiryDate || undefined,
    
    createdAt: backendUser.createdAt || now,
    updatedAt: backendUser.updatedAt || now
  };

  // Agregar perfil profesional si existe, con sanitización
  if (baseUser.userType === 'professional' && backendUser.professionalProfile) {
    const profile = backendUser.professionalProfile;
    
    baseUser.professionalProfile = {
      id: String(profile.id || ''),
      serviceCategories: Array.isArray(profile.serviceCategories) 
        ? profile.serviceCategories.map((cat: string) => sanitizeInput(cat, 'plainText')).filter(Boolean)
        : [],
      description: sanitizeInput(profile.description || '', 'basicHTML'),
      experience: sanitizeInput(profile.experience || '', 'plainText'),
      pricing: sanitizeInput(profile.pricing || '', 'plainText'),
      availability: sanitizeInput(profile.availability || '', 'plainText'),
      portfolio: sanitizeInput(profile.portfolio || '', 'url'),
      certifications: sanitizeInput(profile.certifications || '', 'basicHTML'),
      averageRating: Number(profile.averageRating) || 0,
      totalReviews: Number(profile.totalReviews) || 0,
      totalServices: Number(profile.totalServices) || 0,
      completedServices: Number(profile.completedServices) || 0,
      verified: Boolean(profile.verified),
      createdAt: profile.createdAt || now,
      updatedAt: profile.updatedAt || now
    };
  }

  return baseUser;
};

export const SecureAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Inicializar autenticación segura
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // SECURITY: Clear any deprecated localStorage tokens
        localStorage.removeItem('fixia_token');
        localStorage.removeItem('fixia_refresh_token');
        localStorage.removeItem('fixia_user'); // Old user storage
        
        // Initialize token manager first (sets up interceptors)
        secureTokenManager.setupAxiosInterceptor();
        
        // Check if we have basic user data from a recent successful login
        const basicUserData = localStorage.getItem('fixia_user_basic');
        if (basicUserData) {
          try {
            const parsedData = JSON.parse(basicUserData);
            // If we have recent user data, try to load full user data instead of verification
            await loadUserData();
            return; // Exit early if user data loaded successfully
          } catch (error) {
            console.warn('Failed to load user from basic data:', error);
            localStorage.removeItem('fixia_user_basic');
          }
        }
        
        // Only do authentication verification if we don't have any user data
        const isAuth = await secureTokenManager.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          // Cargar datos del usuario
          await loadUserData();
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Cargar datos del usuario desde el servidor
  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const transformedUser = transformBackendUserSecurely(userData);
        setUser(transformedUser);
        setIsAuthenticated(true); // Set authenticated state when user data loads successfully
        
        // Almacenamiento local seguro (solo datos no sensibles)
        const safeUserData = {
          id: transformedUser.id,
          name: transformedUser.name,
          email: transformedUser.email,
          userType: transformedUser.userType,
          avatar: transformedUser.avatar,
          // NO almacenar tokens o datos sensibles
        };
        localStorage.setItem('fixia_user_basic', JSON.stringify(safeUserData));
      } else if (response.status === 401) {
        // User is not authenticated - don't throw error, just set state
        console.log('User not authenticated - clearing state');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('fixia_user_basic');
      } else {
        throw new Error('Error cargando datos del usuario');
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      // Only clear state if it's not a network error
      if (error.message?.includes('fetch')) {
        console.warn('Network error loading user data - keeping current state');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('fixia_user_basic');
      }
    }
  };

  // Login seguro
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Sanitizar credenciales
      const sanitizedEmail = sanitizeInput(email, 'email');
      const sanitizedPassword = password; // No sanitizar password, solo validar

      // Validar credenciales
      if (!sanitizedEmail) {
        throw new Error('Email inválido');
      }

      // Validar que no sean credenciales demo en producción
      const credentialValidation = validateProductionCredentials(sanitizedEmail, sanitizedPassword);
      if (!credentialValidation.isValid && credentialValidation.warnings.length > 0) {
        console.warn('Demo credentials detected in login attempt:', credentialValidation.warnings);
      }

      // Enhanced password validation for login (more lenient for existing accounts)
      if (!sanitizedPassword || sanitizedPassword.length < 6) {
        throw new Error('Contraseña debe tener al menos 6 caracteres');
      }

      // Detectar contenido malicioso
      const emailCheck = detectMaliciousContent(sanitizedEmail);
      if (!emailCheck.isSafe) {
        throw new Error('Email contiene contenido no válido');
      }

      const result = await secureTokenManager.login({
        email: sanitizedEmail,
        password: sanitizedPassword
      });

      if (result.success && result.user) {
        const transformedUser = transformBackendUserSecurely(result.user);
        setUser(transformedUser);
        setIsAuthenticated(true);
        
        // Almacenamiento local seguro
        const safeUserData = {
          id: transformedUser.id,
          name: transformedUser.name,
          email: transformedUser.email,
          userType: transformedUser.userType,
          avatar: transformedUser.avatar,
        };
        localStorage.setItem('fixia_user_basic', JSON.stringify(safeUserData));
        
        toast.success(`¡Hola ${transformedUser.name || 'Usuario'}! 👋`, {
          description: "Has iniciado sesión correctamente. Redirigiendo al dashboard...",
          duration: 5000,
        });
      } else {
        throw new Error(result.error || 'Error en el login');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Determinar el mensaje de error específico
      let errorTitle = "Error al iniciar sesión";
      let errorMessage = "";
      
      const statusCode = error.response?.status;
      const serverMessage = error.response?.data?.message || error.message || "";
      
      if (statusCode === 401) {
        if (serverMessage.toLowerCase().includes('verify') || 
            serverMessage.toLowerCase().includes('verifica') || 
            serverMessage.toLowerCase().includes('email verification')) {
          errorTitle = "📧 Email no verificado";
          errorMessage = "Necesitas verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada o reenvía el email de verificación.";
        } else if (serverMessage.toLowerCase().includes('credentials') || 
                   serverMessage.toLowerCase().includes('invalid') ||
                   serverMessage.toLowerCase().includes('contraseña') ||
                   serverMessage.toLowerCase().includes('password')) {
          errorTitle = "🔐 Credenciales incorrectas";
          errorMessage = "El email o la contraseña que ingresaste no son correctos. Verifica tus datos e intenta nuevamente.";
        } else {
          errorTitle = "🔐 Acceso denegado";
          errorMessage = "No se pudo iniciar sesión. Verifica tu email y contraseña.";
        }
      } else if (statusCode === 404) {
        errorTitle = "👤 Usuario no encontrado";
        errorMessage = "No existe una cuenta registrada con este email. ¿Necesitas crear una cuenta?";
      } else if (statusCode === 429) {
        errorTitle = "⏰ Demasiados intentos";
        errorMessage = "Has hecho muchos intentos de inicio de sesión. Espera unos minutos antes de intentar nuevamente.";
      } else if (error.code === 'ERR_NETWORK' || serverMessage.toLowerCase().includes('network')) {
        errorTitle = "🌐 Error de conexión";
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.";
      } else {
        errorTitle = "❌ Error inesperado";
        errorMessage = serverMessage || "Ocurrió un error inesperado. Por favor intenta nuevamente.";
      }
      
      toast.error(errorTitle, {
        description: errorMessage,
        duration: 10000,
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register con sanitización
  const register = async (userData: RegisterRequest) => {
    setLoading(true);
    try {
      // Sanitizar todos los campos
      const sanitizedData = {
        email: sanitizeInput(userData.email, 'email'),
        password: userData.password, // No sanitizar password
        fullName: sanitizeInput(userData.fullName, 'plainText'),
        userType: ['client', 'professional'].includes(userData.userType) 
          ? userData.userType 
          : 'client',
        location: sanitizeInput(userData.location || '', 'plainText'),
        phone: sanitizeInput(userData.phone || '', 'phone'),
        birthdate: userData.birthdate,
        // Campos profesionales
        serviceCategories: userData.serviceCategories?.map(cat => 
          sanitizeInput(cat, 'plainText')
        ).filter(Boolean),
        description: sanitizeInput(userData.description || '', 'basicHTML'),
        experience: sanitizeInput(userData.experience || '', 'plainText'),
        pricing: sanitizeInput(userData.pricing || '', 'plainText'),
        availability: sanitizeInput(userData.availability || '', 'plainText'),
        portfolio: sanitizeInput(userData.portfolio || '', 'url'),
        certifications: sanitizeInput(userData.certifications || '', 'basicHTML'),
      };

      // Validaciones
      if (!sanitizedData.email || !sanitizedData.fullName) {
        throw new Error('Email y nombre son requeridos');
      }

      // Validar que no sean credenciales demo en producción
      const credentialValidation = validateProductionCredentials(
        sanitizedData.email, 
        sanitizedData.password, 
        sanitizedData.fullName
      );
      if (!credentialValidation.isValid && credentialValidation.warnings.length > 0) {
        console.warn('Demo credentials detected in registration attempt:', credentialValidation.warnings);
      }

      // Enhanced password validation
      const passwordValidation = validatePassword(sanitizedData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Contraseña no válida: ${passwordValidation.errors[0]}`);
      }

      const response = await api.post('/auth/register', sanitizedData);
      const result = response.data;

      if (result.user) {
        const transformedUser = transformBackendUserSecurely(result.user);
        setUser(transformedUser);
        setIsAuthenticated(true);
        
        // Success message is handled by the calling component (RegisterPage)
      } else {
        throw new Error('Error en el registro');
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      // Error message is handled by the calling component (RegisterPage)
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout seguro
  const logout = async () => {
    setLoading(true);
    try {
      await secureTokenManager.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      // Limpiar almacenamiento local
      localStorage.removeItem('fixia_user_basic');
      localStorage.removeItem('fixia_preferences');
      
      toast.success('¡Hasta pronto! 👋', {
        description: "Has cerrado sesión correctamente. Te esperamos de vuelta.",
        duration: 4000,
      });
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar estado local aunque haya error
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('fixia_user_basic');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar perfil con sanitización
  const updateProfile = async (userData: Partial<User>) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // Sanitizar campos actualizados
      const sanitizedData: any = {};
      
      if (userData.name) {
        sanitizedData.name = sanitizeInput(userData.name, 'plainText');
      }
      if (userData.location) {
        sanitizedData.location = sanitizeInput(userData.location, 'plainText');
      }
      if (userData.phone) {
        sanitizedData.phone = sanitizeInput(userData.phone, 'phone');
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        const updatedUserData = await response.json();
        const transformedUser = transformBackendUserSecurely(updatedUserData);
        setUser(transformedUser);
        
        toast.success('Perfil actualizado correctamente');
      } else {
        throw new Error('Error actualizando el perfil');
      }
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
      throw error;
    }
  };

  // Refrescar datos del usuario
  const refreshUserData = async () => {
    if (isAuthenticated) {
      await loadUserData();
    }
  };

  // Actualizar disponibilidad
  const updateAvailability = async (status: 'available' | 'busy' | 'offline') => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const response = await fetch('/api/user/availability', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, availability: status } : null);
        
        const statusText = status === 'available' ? 'disponible' : 
                          status === 'busy' ? 'ocupado' : 'desconectado';
        toast.success(`Estado actualizado a ${statusText}`);
      } else {
        throw new Error('Error actualizando el estado');
      }
    } catch (error: any) {
      console.error('Error actualizando disponibilidad:', error);
      toast.error(error.message || 'Error al actualizar el estado');
      throw error;
    }
  };

  // Legacy compatibility methods (implement as needed)
  const requestContactProfessional = async (professionalId: string, message?: string) => {
    try {
      const response = await fetch('/api/contact/request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalId, message }),
      });
      
      if (response.ok) {
        toast.success('Solicitud de contacto enviada');
      } else {
        throw new Error('Error al enviar solicitud');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar solicitud');
      throw error;
    }
  };

  const respondToContactRequest = async (requestId: string, accept: boolean, message?: string) => {
    try {
      const response = await fetch('/api/contact/respond', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, accept, message }),
      });
      
      if (response.ok) {
        const action = accept ? 'aceptada' : 'rechazada';
        toast.success(`Solicitud ${action}`);
      } else {
        throw new Error('Error al responder solicitud');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al responder solicitud');
      throw error;
    }
  };

  const upgradeToPremium = async () => {
    try {
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.paymentUrl) {
          window.open(result.paymentUrl, '_blank');
        }
        toast.success('Procesando actualización...');
      } else {
        throw new Error('Error al procesar actualización');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar actualización');
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      
      toast.success('Email verificado exitosamente');
      await refreshUserData();
    } catch (error: any) {
      toast.error(error.message || 'Error al verificar email');
      throw error;
    }
  };

  const resendVerificationEmail = async (email?: string) => {
    try {
      const response = await api.post('/auth/resend-verification', email ? { email } : {});
      
      toast.success('Email de verificación reenviado');
    } catch (error: any) {
      toast.error(error.message || 'Error al reenviar verificación');
      throw error;
    }
  };

  const value: SecureAuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUserData,
    updateAvailability,
    requestContactProfessional,
    respondToContactRequest,
    upgradeToPremium,
    verifyEmail,
    resendVerificationEmail,
  };

  return (
    <SecureAuthContext.Provider value={value}>
      {children}
    </SecureAuthContext.Provider>
  );
};

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};

export default SecureAuthContext;