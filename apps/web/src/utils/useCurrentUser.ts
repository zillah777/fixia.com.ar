import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  user_type: 'client' | 'professional' | 'dual' | 'admin';
  subscription_type?: 'free' | 'premium' | 'professional';
  subscription_status?: 'active' | 'inactive';
  isVerified: boolean;
  // ... otras propiedades del usuario
}

const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    // Este endpoint debe devolver los datos del usuario autenticado
    // basándose en la cookie httpOnly segura.
    const user = await api.get<User>('/auth/me');
    return user;
  } catch (error: any) {
    // Si la API devuelve 401, significa que no hay una sesión válida.
    // Devolvemos null para que el resto de la app sepa que el usuario no está logueado.
    // El interceptor de api.ts ya maneja el logueo de errores inesperados.
    if (error?.response?.status === 401) {
      return null;
    }
    // Para otros errores, los relanzamos para que React Query los maneje.
    throw error;
  }
};

export const useCurrentUser = () => {
  return useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 15, // Considerar los datos del usuario "frescos" por 15 minutos
    retry: false, // No reintentar en caso de 401, ya que significa que no está logueado.
  });
};