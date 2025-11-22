import { createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { secureTokenManager } from '../utils/secureTokenManager';
import { sanitizeInput, detectMaliciousContent } from '../utils/sanitization';
import { validatePassword } from '../utils/passwordValidation';
import { validateProductionCredentials } from '../utils/credentialValidator';
import { getUserFriendlyErrorMessage, logError } from '../utils/errorHandler';
import { useCurrentUser } from '../utils/useCurrentUser';

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
  userType: 'client' | 'professional' | 'dual';
  location?: string;
  planType: 'free' | 'premium';
  isVerified: boolean;
  emailVerified: boolean;
  role?: string;
  bio?: string;
  whatsapp_number?: string;
  social_linkedin?: string;
  social_twitter?: string;
  social_facebook?: string;
  social_instagram?: string;
  notifications_messages?: boolean;
  notifications_orders?: boolean;
  notifications_projects?: boolean;
  notifications_newsletter?: boolean;
  timezone?: string;
  isSubscriptionActive?: boolean;
  subscriptionStatus?: string;
  subscriptionType?: string;
  subscriptionStartedAt?: string;
  subscriptionExpiresAt?: string;
  subscriptionPrice?: number;
  autoRenew?: boolean;
  isProfessionalActive?: boolean;
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
  accountType: 'client' | 'professional';
  availability: 'available' | 'busy' | 'offline';
  badges: Badge[];
  totalServices: number;
  completedServices: number;
  averageRating: number;
  totalReviews: number;
  joinDate: string;
  pendingContactRequests: number;
  maxContactRequests: number;
  province: string;
  city: string;
  isLaunchPromotion: boolean;
  promotionExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  requiresVerification: boolean;
}

interface SecureAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<any>;
  deleteAccount: (password: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateAvailability: (status: 'available' | 'busy' | 'offline') => Promise<void>;
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
  dni?: string;
  businessName?: string;
  serviceCategories?: string[];
  description?: string;
  experience?: string;
  pricing?: string;
  availability?: string;
  portfolio?: string;
  certifications?: string;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

export const SecureAuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading, refetch } = useCurrentUser();
  const isAuthenticated = !!user;

  // Login seguro
  const login = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password;

      if (!cleanEmail || cleanEmail.length === 0) {
        throw new Error('Email inválido');
      }

      const credentialValidation = validateProductionCredentials(cleanEmail, cleanPassword);
      if (!credentialValidation.isValid && credentialValidation.warnings.length > 0) {
        console.warn('Demo credentials detected in login attempt:', credentialValidation.warnings);
      }

      if (!cleanPassword || cleanPassword.length < 8) {
        throw new Error('Contraseña debe tener al menos 8 caracteres');
      }

      const emailCheck = detectMaliciousContent(cleanEmail);
      if (!emailCheck.isSafe) {
        throw new Error('Email contiene contenido no válido');
      }

      const result = await secureTokenManager.login({
        email: cleanEmail,
        password: cleanPassword
      });

      if (result.success && result.user) {
        await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        toast.success(`¡Hola ${result.user.name || 'Usuario'}! 👋`, {
          description: "Has iniciado sesión correctamente. Redirigiendo al dashboard...",
          duration: 15000,
        });
      } else {
        throw new Error(result.error || 'Error en el login');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);

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
        errorTitle = "Error inesperado";
        errorMessage = serverMessage || "Ocurrió un error inesperado. Por favor intenta nuevamente.";
      }

      toast.error(errorTitle, {
        description: errorMessage,
        duration: 15000,
      });

      throw error;
    }
  };

  // Register con sanitización
  const register = async (userRegistrationData: RegisterRequest) => {
    try {
      const sanitizedData = {
        email: sanitizeInput(userRegistrationData.email, 'email'),
        password: userRegistrationData.password,
        name: sanitizeInput(userRegistrationData.fullName, 'plainText'),
        user_type: ['client', 'professional'].includes(userRegistrationData.userType)
          ? userRegistrationData.userType
          : 'client',
        location: sanitizeInput(userRegistrationData.location || '', 'plainText'),
        phone: sanitizeInput(userRegistrationData.phone || '', 'phone'),
        birthdate: userRegistrationData.birthdate,
        dni: sanitizeInput(userRegistrationData.dni || '', 'plainText'),
        serviceCategories: userRegistrationData.serviceCategories?.map(cat =>
          sanitizeInput(cat, 'plainText')
        ).filter(Boolean),
        description: sanitizeInput(userRegistrationData.description || '', 'basicHTML'),
        experience: sanitizeInput(userRegistrationData.experience || '', 'plainText'),
        pricing: sanitizeInput(userRegistrationData.pricing || '', 'plainText'),
        availability: sanitizeInput(userRegistrationData.availability || '', 'plainText'),
        portfolio: sanitizeInput(userRegistrationData.portfolio || '', 'url'),
        certifications: sanitizeInput(userRegistrationData.certifications || '', 'basicHTML'),
      };

      if (!sanitizedData.email || !sanitizedData.name) {
        throw new Error('Email y nombre son requeridos');
      }

      const credentialValidation = validateProductionCredentials(
        sanitizedData.email,
        sanitizedData.password,
        sanitizedData.name
      );
      if (!credentialValidation.isValid && credentialValidation.warnings.length > 0) {
        console.warn('Demo credentials detected in registration attempt:', credentialValidation.warnings);
      }

      const passwordValidation = validatePassword(sanitizedData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Contraseña no válida: ${passwordValidation.errors[0]}`);
      }

      const result = await api.post('/auth/register', sanitizedData);

      if (result?.success === true) {
        return {
          success: true,
          message: result.message || 'Cuenta creada exitosamente. Revisa tu correo electrónico para verificar tu cuenta.',
          requiresVerification: result.requiresVerification !== false
        };
      } else if (result?.user) {
        return {
          success: true,
          message: 'Registro exitoso',
          requiresVerification: false
        };
      } else {
        throw new Error('Error en el registro');
      }
    } catch (error: any) {
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      logError(error, 'register');

      return {
        success: false,
        message: friendlyMessage,
        requiresVerification: false,
      };
    }
  };

  // Logout seguro
  const logout = async () => {
    try {
      await secureTokenManager.logout();
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('¡Hasta pronto! 👋', {
        description: "Has cerrado sesión correctamente. Te esperamos de vuelta.",
        duration: 15000,
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // Cambiar contraseña con validación
  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    if (newPassword !== confirmPassword) {
      throw new Error('Las contraseñas nuevas no coinciden');
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    if (currentPassword === newPassword) {
      throw new Error('La nueva contraseña debe ser diferente a la actual');
    }

    try {
      const response = await api.post('/auth/change-password', {
        current_password: sanitizeInput(currentPassword, 'plainText'),
        new_password: sanitizeInput(newPassword, 'plainText'),
      });

      toast.success('Contraseña actualizada correctamente');
      return response;
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      if (error.response?.status === 401) {
        throw new Error('Contraseña actual incorrecta');
      }
      throw new Error(error.message || 'Error al cambiar la contraseña');
    }
  };

  // Actualizar perfil con sanitización
  // Only sends fields supported by backend UpdateProfileDto
  const updateProfile = async (userData: Partial<User>) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const sanitizedData: Record<string, any> = {};

      // Basic profile fields
      if (userData.name) {
        sanitizedData.name = sanitizeInput(userData.name, 'plainText');
      }
      if (userData.location) {
        sanitizedData.location = sanitizeInput(userData.location, 'plainText');
      }
      if (userData.phone) {
        sanitizedData.phone = sanitizeInput(userData.phone, 'phone');
      }
      if (userData.avatar) {
        sanitizedData.avatar = sanitizeInput(userData.avatar, 'url');
      }
      if (userData.bio) {
        sanitizedData.bio = sanitizeInput(userData.bio, 'basicHTML');
      }

      // Contact information
      if (userData.whatsapp_number) {
        sanitizedData.whatsapp_number = sanitizeInput(userData.whatsapp_number, 'phone');
      }

      // Social networks
      if (userData.social_linkedin) {
        sanitizedData.social_linkedin = sanitizeInput(userData.social_linkedin, 'url');
      }
      if (userData.social_twitter) {
        sanitizedData.social_twitter = sanitizeInput(userData.social_twitter, 'url');
      }
      if (userData.social_facebook) {
        sanitizedData.social_facebook = sanitizeInput(userData.social_facebook, 'url');
      }
      if (userData.social_instagram) {
        sanitizedData.social_instagram = sanitizeInput(userData.social_instagram, 'url');
      }

      // Notification preferences (boolean values, no sanitization needed)
      if (typeof userData.notifications_messages === 'boolean') {
        sanitizedData.notifications_messages = userData.notifications_messages;
      }
      if (typeof userData.notifications_orders === 'boolean') {
        sanitizedData.notifications_orders = userData.notifications_orders;
      }
      if (typeof userData.notifications_projects === 'boolean') {
        sanitizedData.notifications_projects = userData.notifications_projects;
      }
      if (typeof userData.notifications_newsletter === 'boolean') {
        sanitizedData.notifications_newsletter = userData.notifications_newsletter;
      }

      // Timezone
      if (userData.timezone) {
        sanitizedData.timezone = sanitizeInput(userData.timezone, 'plainText');
      }

      // NOTE: The following fields are NOT supported by backend UpdateProfileDto:
      // - lastName, province, city, birthDate (use registration or combined 'location' field)
      // - dni, matricula, cuitCuil (only set during registration)

      await api.put('/user/profile', sanitizedData);
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
      throw error;
    }
  };

  // Eliminar cuenta del usuario
  // NOTE: Backend uses DELETE /user/profile and does not require password verification
  // The user is authenticated via JWT token which is sufficient for account deletion
  const deleteAccount = async (_password: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // Backend endpoint: DELETE /user/profile (soft delete)
      // No password body required - authentication is via JWT
      await api.delete('/user/profile');

      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      toast.success('Cuenta eliminada correctamente');
      return true;
    } catch (error: any) {
      console.error('Error eliminando cuenta:', error);
      throw new Error(error.message || 'Error al eliminar la cuenta');
    }
  };

  // Refrescar datos del usuario
  const refreshUserData = async () => {
    if (isAuthenticated) {
      await refetch();
    }
  };

  // Actualizar disponibilidad
  const updateAvailability = async (status: 'available' | 'busy' | 'offline') => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      await api.put('/user/availability', { status });
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      const statusText = status === 'available' ? 'disponible' :
        status === 'busy' ? 'ocupado' : 'desconectado';
      toast.success(`Estado actualizado a ${statusText}`);
    } catch (error: any) {
      console.error('Error actualizando disponibilidad:', error);
      toast.error(error.message || 'Error al actualizar el estado');
      throw error;
    }
  };

  // Legacy compatibility methods
  const requestContactProfessional = async (professionalId: string, message?: string) => {
    try {
      await api.post('/contact/request', { professionalId, message });
      toast.success('Solicitud de contacto enviada');
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar solicitud');
      throw error;
    }
  };

  const respondToContactRequest = async (requestId: string, accept: boolean, message?: string) => {
    try {
      await api.post('/contact/respond', { requestId, accept, message });
      const action = accept ? 'aceptada' : 'rechazada';
      toast.success(`Solicitud ${action}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al responder solicitud');
      throw error;
    }
  };

  const upgradeToPremium = async () => {
    try {
      const result = await api.post('/user/upgrade-premium');
      if (result.paymentUrl) {
        window.open(result.paymentUrl, '_blank');
      }
      toast.success('Procesando actualización...');
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar actualización');
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await api.post('/auth/verify-email', { token });
      if (isAuthenticated) {
        await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      }

      toast.success('Email verificado exitosamente. Ya puedes iniciar sesión.');
    } catch (error: any) {
      toast.error(error.message || 'Error al verificar email');
      throw error;
    }
  };

  const resendVerificationEmail = async (email?: string) => {
    try {
      await api.post('/auth/resend-verification', email ? { email } : {});

      toast.success('Email de verificación reenviado');
    } catch (error: any) {
      toast.error(error.message || 'Error al reenviar verificación');
      throw error;
    }
  };

  const value: SecureAuthContextType = {
    user: user ?? null,
    loading: isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
    deleteAccount,
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