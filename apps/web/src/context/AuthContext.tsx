import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const INITIAL_CLIENT_BADGES: Badge[] = [];

const INITIAL_PROFESSIONAL_BADGES: Badge[] = [
  {
    id: 'new-platform',
    name: 'Nuevo en la plataforma',
    description: 'Se registró hace menos de 30 días',
    icon: '🆕',
    category: 'experience'
  }
];

// Mock user for development
const MOCK_PROFESSIONAL: User = {
  id: '1',
  email: 'professional@fixia.com.ar',
  name: 'Carlos',
  lastName: 'Rodríguez',
  birthDate: '1985-03-15',
  address: 'Av. San Martín 1234, Rawson',
  phone: '+54 280 4567890',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
  accountType: 'professional',
  planType: 'premium',
  isVerified: true,
  emailVerified: true,
  documentVerified: true,
  professionalVerified: true,
  dni: '12345678',
  professionalId: 'PROF-001',
  matricula: 'MAT-12345',
  cuitCuil: '20-12345678-9',
  serviceCategories: ['Desarrollo Web', 'Consultoría IT'],
  availability: 'available',
  badges: [
    {
      id: 'verified-profile',
      name: 'Perfil verificado',
      description: 'Documento de identidad validado',
      icon: '✅',
      earned_date: '2024-01-15',
      category: 'verification'
    },
    {
      id: 'reliable',
      name: 'Confiable',
      description: '90% de servicios completados exitosamente en últimos 90 días',
      icon: '🛡️',
      earned_date: '2024-02-01',
      category: 'reputation'
    },
    {
      id: 'quality',
      name: 'Insignia de calidad',
      description: 'Promedio de 4.7+ estrellas sin reclamos en últimos 50 servicios',
      icon: '⭐',
      earned_date: '2024-02-15',
      category: 'quality'
    }
  ],
  totalServices: 89,
  completedServices: 82,
  averageRating: 4.9,
  totalReviews: 76,
  joinDate: '2024-01-01',
  pendingContactRequests: 0,
  maxContactRequests: 10,
  province: 'Chubut',
  city: 'Rawson',
  isMonotributista: true,
  isLaunchPromotion: true,
  promotionExpiryDate: '2024-04-01'
};

const MOCK_CLIENT: User = {
  id: '2',
  email: 'client@fixia.com.ar',
  name: 'María',
  lastName: 'González',
  birthDate: '1990-07-22',
  address: 'Belgrano 567, Puerto Madryn',
  phone: '+54 280 1234567',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face',
  accountType: 'client',
  planType: 'free',
  isVerified: true,
  emailVerified: true,
  availability: 'available',
  badges: [
    {
      id: 'verified-profile',
      name: 'Perfil verificado',
      description: 'Email verificado correctamente',
      icon: '✅',
      earned_date: '2024-01-20',
      category: 'verification'
    }
  ],
  totalServices: 0,
  completedServices: 0,
  averageRating: 0,
  totalReviews: 0,
  joinDate: '2024-01-20',
  pendingContactRequests: 1,
  maxContactRequests: 3,
  province: 'Chubut',
  city: 'Puerto Madryn',
  isLaunchPromotion: true,
  promotionExpiryDate: '2024-04-01'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      // Check for stored auth data
      const storedUser = localStorage.getItem('fixia_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock login logic
      let mockUser: User;
      if (email.includes('professional') || email.includes('pro')) {
        mockUser = MOCK_PROFESSIONAL;
      } else {
        mockUser = MOCK_CLIENT;
      }
      
      mockUser.email = email;
      setUser(mockUser);
      localStorage.setItem('fixia_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Error en el inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any, accountType: 'client' | 'professional') => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date().toISOString();
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        lastName: userData.lastName,
        birthDate: userData.birthDate,
        address: userData.address,
        phone: userData.phone,
        accountType,
        planType: accountType === 'professional' ? 'premium' : 'free',
        isVerified: false,
        emailVerified: false,
        availability: 'available',
        badges: accountType === 'professional' ? INITIAL_PROFESSIONAL_BADGES : INITIAL_CLIENT_BADGES,
        totalServices: 0,
        completedServices: 0,
        averageRating: 0,
        totalReviews: 0,
        joinDate: now,
        pendingContactRequests: 0,
        maxContactRequests: accountType === 'professional' ? 10 : 3,
        province: userData.province || 'Chubut',
        city: userData.city || '',
        isLaunchPromotion: true, // First 200 users get free promotion
        promotionExpiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        ...userData
      };

      setUser(newUser);
      localStorage.setItem('fixia_user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fixia_user');
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('fixia_user', JSON.stringify(updatedUser));
  };

  const requestContactProfessional = async (professionalId: string) => {
    if (!user) return;
    
    if (user.pendingContactRequests >= user.maxContactRequests) {
      throw new Error(`No puedes tener más de ${user.maxContactRequests} solicitudes pendientes`);
    }
    
    const updatedUser = {
      ...user,
      pendingContactRequests: user.pendingContactRequests + 1
    };
    
    setUser(updatedUser);
    localStorage.setItem('fixia_user', JSON.stringify(updatedUser));
  };

  const respondToContactRequest = async (requestId: string, accept: boolean) => {
    if (!user) return;
    
    // In a real app, this would update the backend
    // For now, just simulate the response
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const updateAvailability = async (status: 'available' | 'busy' | 'offline') => {
    if (!user) return;
    
    const updatedUser = { ...user, availability: status };
    setUser(updatedUser);
    localStorage.setItem('fixia_user', JSON.stringify(updatedUser));
  };

  const upgradeToPremium = async () => {
    if (!user) return;
    
    const updatedUser = { ...user, planType: 'premium' as const, maxContactRequests: 10 };
    setUser(updatedUser);
    localStorage.setItem('fixia_user', JSON.stringify(updatedUser));
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