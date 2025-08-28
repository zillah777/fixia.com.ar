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

// Transform backend user data to frontend format for compatibility
const transformBackendUser = (backendUser: any): User => {
  // Validate backendUser exists
  if (!backendUser) {
    throw new Error('Backend user data is required');
  }
  
  // Safely parse location for Argentina specific fields
  let city = '';
  let province = 'Chubut';
  
  try {
    if (backendUser?.location && typeof backendUser.location === 'string') {
      const locationParts = backendUser.location.split(', ');
      city = locationParts[0] || '';
      province = locationParts[1] || 'Chubut';
    }
  } catch (error) {
    console.warn('Error parsing location:', error);
    // Use defaults
  }
  
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name, // Backend maps fullName to name
    lastName: backendUser.lastName || '',
    phone: backendUser.phone || '',
    avatar: backendUser.avatar || '',
    userType: backendUser.user_type || backendUser.userType,
    location: backendUser.location || '',
    planType: backendUser.planType || 'free',
    isVerified: backendUser.verified || backendUser.isVerified || false,
    emailVerified: backendUser.email_verified || backendUser.emailVerified || false,
    
    // Professional profile
    professionalProfile: backendUser.professional_profile || backendUser.professionalProfile || null,
    
    // Legacy computed fields for backward compatibility
    accountType: backendUser.user_type || backendUser.userType, // Same as userType
    availability: (backendUser.professional_profile || backendUser.professionalProfile)?.availability || 'offline',
    badges: backendUser.badges || [],
    totalServices: (backendUser.professional_profile || backendUser.professionalProfile)?.totalServices || 0,
    completedServices: (backendUser.professional_profile || backendUser.professionalProfile)?.completedServices || 0,
    averageRating: (backendUser.professional_profile || backendUser.professionalProfile)?.averageRating || 0,
    totalReviews: (backendUser.professional_profile || backendUser.professionalProfile)?.totalReviews || 0,
    joinDate: backendUser.created_at || backendUser.createdAt || new Date().toISOString(),
    
    // Contact limits (default for clients, can be overridden by backend)
    pendingContactRequests: backendUser.pendingContactRequests || 0,
    maxContactRequests: backendUser.maxContactRequests || (backendUser.planType === 'premium' ? 10 : 3),
    
    // Argentina specific
    province,
    city,
    
    // Promotion tracking
    isLaunchPromotion: backendUser.isLaunchPromotion || false,
    promotionExpiryDate: backendUser.promotionExpiryDate || null,
    
    // Timestamps
    createdAt: backendUser.created_at || backendUser.createdAt || new Date().toISOString(),
    updatedAt: backendUser.updated_at || backendUser.updatedAt || new Date().toISOString(),
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for stored auth data
        const storedUser = localStorage.getItem('fixia_user');
        const token = localStorage.getItem('fixia_token');
        
        if (storedUser && token) {
          // Try to get fresh user data from server
          try {
            const freshUserData = await userService.getProfile();
            const transformedUser = transformBackendUser(freshUserData);
            setUser(transformedUser);
            localStorage.setItem('fixia_user', JSON.stringify(transformedUser));
          } catch (error) {
            // If token is invalid, fallback to stored user data
            console.warn('Failed to fetch fresh user data, using stored data');
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.warn('Auth initialization failed:', error);
        // Clear invalid data
        localStorage.removeItem('fixia_user');
        localStorage.removeItem('fixia_token');
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credentials: LoginRequest = { email, password };
      const response: AuthResponse = await authService.login(credentials);
      
      // Transform backend user data to frontend format for compatibility
      const transformedUser = transformBackendUser(response.user);
      
      setUser(transformedUser);
      localStorage.setItem('fixia_user', JSON.stringify(transformedUser));
      
      toast.success(`¡Bienvenido/a, ${transformedUser.name}!`);
    } catch (error: any) {
      // Handle API errors gracefully
      const errorMessage = error.response?.data?.message || error.message || 'Error en el inicio de sesión';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
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