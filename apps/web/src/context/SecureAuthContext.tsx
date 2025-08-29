import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { secureTokenManager } from '../utils/secureTokenManager';
import { sanitizeInput, detectMaliciousContent } from '../utils/sanitization';

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
  createdAt?: string;
  updatedAt?: string;
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
    badges: [],
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
        const isAuth = await secureTokenManager.initialize();
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
      } else {
        throw new Error('Error cargando datos del usuario');
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      setUser(null);
      setIsAuthenticated(false);
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
        
        toast.success('¡Bienvenido de vuelta!');
      } else {
        throw new Error(result.error || 'Error en el login');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      const errorMessage = error.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
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

      if (!sanitizedData.password || sanitizedData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      const result = await response.json();

      if (response.ok && result.user) {
        const transformedUser = transformBackendUserSecurely(result.user);
        setUser(transformedUser);
        setIsAuthenticated(true);
        
        toast.success('¡Cuenta creada exitosamente!');
      } else {
        throw new Error(result.message || 'Error en el registro');
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      const errorMessage = error.message || 'Error al crear la cuenta';
      toast.error(errorMessage);
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
      
      toast.success('Sesión cerrada correctamente');
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