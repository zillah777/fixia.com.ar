/**
 * @deprecated This AuthContext is deprecated in favor of SecureAuthContext.
 * All new code should use SecureAuthContext which provides httpOnly cookie-based authentication
 * instead of localStorage token storage for better security.
 * 
 * This file is kept for compatibility during migration but will be removed in future versions.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, userService, AuthResponse, LoginRequest, RegisterRequest } from '../lib/services';
import { toast } from 'sonner';

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
  name: string; // This comes from backend as 'name' (mapped from fullName)
  lastName?: string;
  phone?: string;
  avatar?: string;
  userType: 'client' | 'professional'; // Backend uses 'userType' not 'accountType'
  location?: string; // Backend stores location as a single field
  planType: 'free' | 'premium';
  isVerified: boolean;
  emailVerified: boolean;
  role?: string; // Optional role property for compatibility
  
  // Professional specific fields (only populated for professionals)
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
  accountType: 'client' | 'professional'; // Computed from userType
  availability: 'available' | 'busy' | 'offline'; // Default for clients
  badges: Badge[]; // Default empty array
  totalServices: number; // From professionalProfile or 0
  completedServices: number; // From professionalProfile or 0
  averageRating: number; // From professionalProfile or 0
  totalReviews: number; // From professionalProfile or 0
  joinDate: string; // ISO date string
  
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  requestContactProfessional: (professionalId: string) => Promise<void>;
  respondToContactRequest: (requestId: string, accept: boolean) => Promise<void>;
  updateAvailability: (status: 'available' | 'busy' | 'offline') => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email?: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to safely get nested object property
const safeGet = (obj: any, path: string[], fallback: any = null) => {
  try {
    return path.reduce((current, key) => {
      return current && typeof current === 'object' && current[key] !== undefined ? current[key] : fallback;
    }, obj);
  } catch {
    return fallback;
  }
};

// Helper function to safely convert to string
const safeString = (value: any, fallback = ''): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  try {
    return String(value);
  } catch {
    return fallback;
  }
};

// Helper function to safely convert to number
const safeNumber = (value: any, fallback = 0): number => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number' && !isNaN(value)) return value;
  try {
    const parsed = Number(value);
    return isNaN(parsed) ? fallback : parsed;
  } catch {
    return fallback;
  }
};

// Helper function to safely convert to boolean
const safeBool = (value: any, fallback = false): boolean => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
};

// Transform backend user data to frontend format for compatibility
const transformBackendUser = (backendUser: any): User => {
  // Absolute validation - handle ANY falsy value
  if (!backendUser || typeof backendUser !== 'object') {
    console.error('🚨 transformBackendUser: Invalid backend user data received:', backendUser);
    throw new Error('Invalid user data received from server');
  }
  
  // Debug logging with safe stringification
  try {
    console.log('🔍 transformBackendUser received:', JSON.stringify(backendUser, null, 2));
  } catch (stringifyError) {
    console.log('🔍 transformBackendUser received (unstringifiable object):', backendUser);
  }
  
  // BULLETPROOF location parsing - handle ALL edge cases
  let city = '';
  let province = 'Chubut'; // Default province for Argentina
  
  try {
    const locationValue = backendUser.location || backendUser.Location || '';
    const locationStr = safeString(locationValue).trim();
    
    if (locationStr && locationStr.length > 0) {
      // Handle various location formats
      if (locationStr.includes(', ')) {
        const locationParts = locationStr.split(', ').map(part => part.trim()).filter(Boolean);
        city = safeString(locationParts[0], '');
        province = safeString(locationParts[1], 'Chubut');
      } else if (locationStr.includes(',')) {
        const locationParts = locationStr.split(',').map(part => part.trim()).filter(Boolean);
        city = safeString(locationParts[0], '');
        province = safeString(locationParts[1], 'Chubut');
      } else {
        // Single value - assume it's a city
        city = locationStr;
        province = 'Chubut';
      }
    }
  } catch (locationError) {
    console.warn('🚨 Error parsing location, using defaults:', locationError);
    city = '';
    province = 'Chubut';
  }
  
  // Get professional profile safely
  const professionalProfile = safeGet(backendUser, ['professional_profile']) || 
                              safeGet(backendUser, ['professionalProfile']) || 
                              null;
  
  // Safely extract user type with multiple fallbacks
  const userType = safeString(backendUser.user_type) || 
                   safeString(backendUser.userType) || 
                   safeString(backendUser.accountType) || 
                   'client';
  
  // Ensure user type is valid
  const validUserType = (userType === 'professional' || userType === 'client') ? userType : 'client';
  
  // Build the user object with comprehensive safety checks
  const transformedUser: User = {
    // Essential fields with absolute safety
    id: safeString(backendUser.id || backendUser._id, ''),
    email: safeString(backendUser.email, ''),
    name: safeString(backendUser.name || backendUser.fullName || backendUser.firstName, 'Usuario'),
    lastName: safeString(backendUser.lastName || backendUser.last_name, ''),
    phone: safeString(backendUser.phone || backendUser.phoneNumber, ''),
    avatar: safeString(backendUser.avatar || backendUser.profileImage, ''),
    userType: validUserType as 'client' | 'professional',
    location: safeString(backendUser.location, ''),
    planType: (safeString(backendUser.planType) === 'premium' ? 'premium' : 'free') as 'free' | 'premium',
    
    // Verification fields
    isVerified: safeBool(backendUser.verified || backendUser.isVerified),
    emailVerified: safeBool(backendUser.email_verified || backendUser.emailVerified),
    
    // Professional profile with safe extraction
    professionalProfile: professionalProfile ? {
      id: safeString(professionalProfile.id, ''),
      serviceCategories: Array.isArray(professionalProfile.serviceCategories) 
        ? professionalProfile.serviceCategories.map((cat: any) => safeString(cat)).filter(Boolean)
        : [],
      description: safeString(professionalProfile.description, ''),
      experience: safeString(professionalProfile.experience, ''),
      pricing: safeString(professionalProfile.pricing, ''),
      availability: safeString(professionalProfile.availability, 'offline'),
      portfolio: safeString(professionalProfile.portfolio, ''),
      certifications: safeString(professionalProfile.certifications, ''),
      averageRating: safeNumber(professionalProfile.averageRating, 0),
      totalReviews: safeNumber(professionalProfile.totalReviews, 0),
      totalServices: safeNumber(professionalProfile.totalServices, 0),
      completedServices: safeNumber(professionalProfile.completedServices, 0),
      verified: safeBool(professionalProfile.verified),
      createdAt: safeString(professionalProfile.createdAt || professionalProfile.created_at, new Date().toISOString()),
      updatedAt: safeString(professionalProfile.updatedAt || professionalProfile.updated_at, new Date().toISOString()),
    } : undefined,
    
    // Legacy computed fields for backward compatibility
    accountType: validUserType as 'client' | 'professional',
    availability: safeString(professionalProfile?.availability, 'offline') as 'available' | 'busy' | 'offline',
    badges: Array.isArray(backendUser.badges) ? backendUser.badges : [],
    totalServices: safeNumber(professionalProfile?.totalServices, 0),
    completedServices: safeNumber(professionalProfile?.completedServices, 0),
    averageRating: safeNumber(professionalProfile?.averageRating, 0),
    totalReviews: safeNumber(professionalProfile?.totalReviews, 0),
    joinDate: safeString(backendUser.created_at || backendUser.createdAt, new Date().toISOString()),
    
    // Contact limits with safe defaults
    pendingContactRequests: safeNumber(backendUser.pendingContactRequests, 0),
    maxContactRequests: safeNumber(
      backendUser.maxContactRequests, 
      (safeString(backendUser.planType) === 'premium' ? 10 : 3)
    ),
    
    // Argentina specific - safely parsed above
    province,
    city,
    
    // Promotion tracking
    isLaunchPromotion: safeBool(backendUser.isLaunchPromotion),
    promotionExpiryDate: safeString(backendUser.promotionExpiryDate, '') || undefined,
    
    // Timestamps
    createdAt: safeString(backendUser.created_at || backendUser.createdAt, new Date().toISOString()),
    updatedAt: safeString(backendUser.updated_at || backendUser.updatedAt, new Date().toISOString()),
  };
  
  // Final validation - ensure we have minimum required fields
  if (!transformedUser.id || !transformedUser.email) {
    console.error('🚨 Missing critical user fields after transformation:', { 
      id: transformedUser.id, 
      email: transformedUser.email 
    });
    throw new Error('Missing critical user information');
  }
  
  console.log('✅ User transformation completed successfully:', transformedUser);
  return transformedUser;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for stored auth data with safety checks
        let storedUser: string | null = null;
        let token: string | null = null;
        
        try {
          storedUser = localStorage.getItem('fixia_user');
          token = localStorage.getItem('fixia_token');
        } catch (storageError) {
          console.warn('⚠️ LocalStorage access failed:', storageError);
        }
        
        if (storedUser && token) {
          try {
            // Try to get fresh user data from server
            const freshUserData = await userService.getProfile();
            
            // BULLETPROOF transformation with fallback
            let transformedUser: User;
            try {
              transformedUser = transformBackendUser(freshUserData);
            } catch (transformError) {
              console.warn('⚠️ Fresh user data transformation failed, using fallback:', transformError);
              
              try {
                // Parse stored user data as backup
                const parsedStoredUser = JSON.parse(storedUser);
                transformedUser = validateStoredUser(parsedStoredUser);
              } catch (parseError) {
                console.error('🚨 Both fresh and stored user data failed:', parseError);
                throw new Error('Unable to initialize user data');
              }
            }
            
            setUser(transformedUser);
            
            // Update localStorage with fresh data
            try {
              localStorage.setItem('fixia_user', JSON.stringify(transformedUser));
            } catch (storageError) {
              console.warn('⚠️ Failed to update localStorage:', storageError);
            }
            
          } catch (apiError) {
            // If API call fails, fallback to stored user data
            console.warn('⚠️ Failed to fetch fresh user data, using stored data:', apiError);
            
            try {
              const parsedStoredUser = JSON.parse(storedUser);
              const validatedUser = validateStoredUser(parsedStoredUser);
              setUser(validatedUser);
            } catch (parseError) {
              console.error('🚨 Stored user data is corrupted:', parseError);
              // Clear invalid data
              localStorage.removeItem('fixia_user');
              localStorage.removeItem('fixia_token');
            }
          }
        }
      } catch (error) {
        console.warn('🚨 Auth initialization failed:', error);
        // Clear invalid data
        try {
          localStorage.removeItem('fixia_user');
          localStorage.removeItem('fixia_token');
        } catch (clearError) {
          console.warn('⚠️ Failed to clear localStorage:', clearError);
        }
      } finally {
        setLoading(false);
      }
    };

    // Simulate the existing loading time for UI consistency
    const timer = setTimeout(() => {
      initializeAuth();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Validate and sanitize stored user data
  const validateStoredUser = (storedUserData: any): User => {
    if (!storedUserData || typeof storedUserData !== 'object') {
      throw new Error('Invalid stored user data');
    }

    // If stored data is already valid, return it
    if (storedUserData.id && storedUserData.email && storedUserData.name) {
      return storedUserData as User;
    }

    // If stored data is incomplete, try to repair it
    const now = new Date().toISOString();
    return {
      id: storedUserData.id || 'temp-' + Math.random().toString(36),
      email: storedUserData.email || '',
      name: storedUserData.name || 'Usuario',
      lastName: storedUserData.lastName || '',
      phone: storedUserData.phone || '',
      avatar: storedUserData.avatar || '',
      userType: (storedUserData.userType === 'professional' || storedUserData.userType === 'client') 
        ? storedUserData.userType : 'client',
      location: storedUserData.location || '',
      planType: (storedUserData.planType === 'premium') ? 'premium' : 'free',
      isVerified: Boolean(storedUserData.isVerified),
      emailVerified: Boolean(storedUserData.emailVerified),
      professionalProfile: storedUserData.professionalProfile || undefined,
      accountType: storedUserData.accountType || storedUserData.userType || 'client',
      availability: storedUserData.availability || 'offline',
      badges: Array.isArray(storedUserData.badges) ? storedUserData.badges : [],
      totalServices: Number(storedUserData.totalServices) || 0,
      completedServices: Number(storedUserData.completedServices) || 0,
      averageRating: Number(storedUserData.averageRating) || 0,
      totalReviews: Number(storedUserData.totalReviews) || 0,
      joinDate: storedUserData.joinDate || now,
      pendingContactRequests: Number(storedUserData.pendingContactRequests) || 0,
      maxContactRequests: Number(storedUserData.maxContactRequests) || 3,
      province: storedUserData.province || 'Chubut',
      city: storedUserData.city || '',
      isLaunchPromotion: Boolean(storedUserData.isLaunchPromotion),
      promotionExpiryDate: storedUserData.promotionExpiryDate || undefined,
      createdAt: storedUserData.createdAt || now,
      updatedAt: storedUserData.updatedAt || now,
    };
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credentials: LoginRequest = { email, password };
      const response: AuthResponse = await authService.login(credentials);
      
      // BULLETPROOF user transformation with multiple error boundaries
      let transformedUser: User;
      
      try {
        // Primary transformation attempt
        transformedUser = transformBackendUser(response.user);
      } catch (transformError) {
        console.error('🚨 Primary user transformation failed:', transformError);
        
        // Fallback transformation with minimal safe user object
        try {
          transformedUser = createSafeUserFallback(response.user, email);
          console.warn('⚠️ Using fallback user transformation');
        } catch (fallbackError) {
          console.error('🚨 Fallback user transformation also failed:', fallbackError);
          throw new Error('No se pudo procesar la información del usuario. Por favor, intenta nuevamente.');
        }
      }
      
      // Additional validation before setting user
      if (!transformedUser?.id || !transformedUser?.email) {
        console.error('🚨 Transformed user missing critical fields:', transformedUser);
        throw new Error('Datos de usuario incompletos. Por favor, contacta soporte.');
      }
      
      setUser(transformedUser);
      
      // Safe localStorage storage with error handling
      try {
        localStorage.setItem('fixia_user', JSON.stringify(transformedUser));
      } catch (storageError) {
        console.warn('⚠️ Failed to store user data locally:', storageError);
        // Don't throw here - user can still function without localStorage
      }
      
      toast.success(`¡Bienvenido/a, ${transformedUser.name}!`);
    } catch (error: any) {
      console.error('🚨 Login process failed:', error);
      
      // Enhanced error handling with more specific messages
      let errorMessage = 'Error en el inicio de sesión';
      
      if (error.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Cuenta no verificada. Revisa tu email para verificar tu cuenta.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
      } else if (error.message?.includes('usuario')) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to create a minimal safe user object
  const createSafeUserFallback = (backendUser: any, email: string): User => {
    console.log('🔧 Creating safe user fallback for:', backendUser);
    
    const now = new Date().toISOString();
    const safeId = String(backendUser?.id || backendUser?._id || Math.random().toString(36));
    const safeName = String(backendUser?.name || backendUser?.fullName || 'Usuario');
    
    return {
      id: safeId,
      email: email,
      name: safeName,
      lastName: '',
      phone: '',
      avatar: '',
      userType: 'client',
      location: '',
      planType: 'free',
      isVerified: false,
      emailVerified: false,
      professionalProfile: undefined,
      accountType: 'client',
      availability: 'offline',
      badges: [],
      totalServices: 0,
      completedServices: 0,
      averageRating: 0,
      totalReviews: 0,
      joinDate: now,
      pendingContactRequests: 0,
      maxContactRequests: 3,
      province: 'Chubut',
      city: '',
      isLaunchPromotion: false,
      promotionExpiryDate: undefined,
      createdAt: now,
      updatedAt: now,
    };
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      // Map RegisterPage data to backend format
      const registerData = {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        userType: userData.userType,
        location: userData.location,
        phone: userData.phone,
        birthdate: userData.birthdate,
        // Professional-specific fields (will be ignored if userType is 'client')
        serviceCategories: userData.serviceCategories || [],
        description: userData.description || '',
        experience: userData.experience || '',
        pricing: userData.pricing || '',
        availability: userData.availability || '',
        portfolio: userData.portfolio || '',
        certifications: userData.certifications || ''
      };

      const response: AuthResponse = await authService.register(registerData);
      
      // Don't automatically log in user - they need to verify email first
      // Success message is handled by the RegisterPage component for better UX
    } catch (error: any) {
      // Handle API errors gracefully - don't show toast here, let the page handle it
      const errorMessage = error.response?.data?.message || error.message || 'Error en el registro';
      throw error; // Re-throw the original error to preserve response data
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.warn('Logout request failed, but clearing local data');
    }
    
    setUser(null);
    localStorage.removeItem('fixia_user');
    localStorage.removeItem('fixia_token');
    localStorage.removeItem('fixia_refresh_token');
    toast.success('Sesión cerrada correctamente');
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = await userService.updateProfile(userData);
      const transformedUser = transformBackendUser(updatedUser);
      setUser(transformedUser);
      localStorage.setItem('fixia_user', JSON.stringify(transformedUser));
      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el perfil';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const requestContactProfessional = async (professionalId: string, message = 'Me interesa contactarte para conocer más sobre tus servicios.') => {
    if (!user) return;
    
    try {
      await userService.sendContactRequest(professionalId, message);
      
      // Update local user state optimistically
      const updatedUser = {
        ...user,
        pendingContactRequests: user.pendingContactRequests + 1
      };
      
      setUser(updatedUser);
      localStorage.setItem('fixia_user', JSON.stringify(updatedUser));
      
      toast.success('Solicitud de contacto enviada correctamente');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al enviar la solicitud';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const respondToContactRequest = async (requestId: string, accept: boolean, message?: string) => {
    if (!user) return;
    
    try {
      await userService.respondToContactRequest(requestId, accept, message);
      
      const actionText = accept ? 'aceptada' : 'rechazada';
      toast.success(`Solicitud de contacto ${actionText} correctamente`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al responder la solicitud';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateAvailability = async (status: 'available' | 'busy' | 'offline') => {
    if (!user) return;
    
    try {
      const updatedUser = await userService.updateAvailability(status);
      const transformedUser = transformBackendUser(updatedUser);
      setUser(transformedUser);
      localStorage.setItem('fixia_user', JSON.stringify(transformedUser));
      
      const statusText = status === 'available' ? 'disponible' : status === 'busy' ? 'ocupado' : 'desconectado';
      toast.success(`Estado actualizado a ${statusText}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el estado';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return;
    
    try {
      const response = await userService.upgradeToPremium();
      
      // In a real app, redirect to payment URL
      if (response.paymentUrl) {
        window.open(response.paymentUrl, '_blank');
        toast.success('Redirigiendo al procesador de pagos...');
      } else {
        // For development, simulate upgrade
        const updatedUser = { ...user, planType: 'premium' as const, maxContactRequests: 10 };
        setUser(updatedUser);
        localStorage.setItem('fixia_user', JSON.stringify(updatedUser));
        toast.success('¡Felicitaciones! Ahora tienes acceso premium');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar la actualización';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await authService.verifyEmail(token);
      
      // Update user's email verification status if they're logged in
      if (user) {
        const updatedUser = { ...user, emailVerified: true, isVerified: true };
        setUser(updatedUser);
        localStorage.setItem('fixia_user', JSON.stringify(updatedUser));
      }
      
      toast.success('¡Email verificado exitosamente!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al verificar el email';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resendVerificationEmail = async (email?: string) => {
    try {
      // If email is provided, we might need to set it in the request context
      // For now, the backend should handle it based on the current user session or token
      await authService.resendVerificationEmail();
      toast.success('Email de verificación reenviado. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al reenviar el email de verificación';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      requestContactProfessional,
      respondToContactRequest,
      updateAvailability,
      upgradeToPremium,
      verifyEmail,
      resendVerificationEmail,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};