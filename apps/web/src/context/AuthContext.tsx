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
  name: string;
  lastName: string;
  birthDate?: string;
  address?: string;
  phone: string;
  avatar?: string;
  accountType: 'client' | 'professional';
  planType: 'free' | 'premium';
  isVerified: boolean;
  emailVerified: boolean;
  documentVerified?: boolean;
  professionalVerified?: boolean;
  
  // Professional specific fields
  dni?: string;
  professionalId?: string;
  matricula?: string;
  cuitCuil?: string;
  serviceCategories?: string[];
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
  
  // Argentina specific
  province: string;
  city: string;
  isMonotributista?: boolean;
  
  // Promotion tracking
  isLaunchPromotion: boolean;
  promotionExpiryDate?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any, accountType: 'client' | 'professional') => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  requestContactProfessional: (professionalId: string) => Promise<void>;
  respondToContactRequest: (requestId: string, accept: boolean) => Promise<void>;
  updateAvailability: (status: 'available' | 'busy' | 'offline') => Promise<void>;
  upgradeToPremium: () => Promise<void>;
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

// Removed mock users - now using real API data

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
            setUser(freshUserData);
            localStorage.setItem('fixia_user', JSON.stringify(freshUserData));
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
      
      setUser(response.user);
      localStorage.setItem('fixia_user', JSON.stringify(response.user));
      
      toast.success(`¡Bienvenido/a, ${response.user.name}!`);
    } catch (error: any) {
      // Handle API errors gracefully
      const errorMessage = error.response?.data?.message || error.message || 'Error en el inicio de sesión';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any, accountType: 'client' | 'professional') => {
    setLoading(true);
    try {
      // Combine address fields for location if available
      let location = '';
      if (userData.address && userData.city && userData.province) {
        location = `${userData.address}, ${userData.city}, ${userData.province}`;
      } else if (userData.city && userData.province) {
        location = `${userData.city}, ${userData.province}`;
      } else if (userData.province) {
        location = userData.province;
      }

      const registerData: RegisterRequest = {
        email: userData.email,
        password: userData.password,
        name: `${userData.name} ${userData.lastName || ''}`.trim(),
        user_type: accountType,
        location: location || undefined,
        phone: userData.phone,
        whatsapp_number: userData.phone, // Use phone as whatsapp for now
      };

      const response: AuthResponse = await authService.register(registerData);
      
      setUser(response.user);
      localStorage.setItem('fixia_user', JSON.stringify(response.user));
      
      toast.success(`¡Cuenta creada exitosamente, ${response.user.name}!`);
    } catch (error: any) {
      // Handle API errors gracefully
      const errorMessage = error.response?.data?.message || error.message || 'Error en el registro';
      toast.error(errorMessage);
      throw new Error(errorMessage);
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
      setUser(updatedUser);
      localStorage.setItem('fixia_user', JSON.stringify(updatedUser));
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
      setUser(updatedUser);
      localStorage.setItem('fixia_user', JSON.stringify(updatedUser));
      
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

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      requestContactProfessional,
      respondToContactRequest,
      updateAvailability,
      upgradeToPremium,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};