import { api } from '../api';

export interface FavoriteService {
  id: string;
  service: {
    id: string;
    title: string;
    description: string;
    price_from: number;
    price_to: number;
    currency: string;
    category: {
      name: string;
      slug: string;
      icon: string;
    };
    images: string[];
    is_active: boolean;
    professional: {
      id: string;
      name: string;
      avatar: string;
      rating: number;
    };
    reviews_count: number;
  };
  added_at: string;
}

export interface FavoriteProfessional {
  id: string;
  professional: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    location: string;
    rating: number;
    specialties: string[];
    years_experience: number;
    services_count: number;
    reviews_count: number;
  };
  added_at: string;
}

export const favoritesService = {
  /**
   * Get all favorites (services and professionals)
   */
  async getAllFavorites(): Promise<{ services: FavoriteService[]; professionals: FavoriteProfessional[] }> {
    const response = await api.get('/favorites');
    return response.data;
  },

  /**
   * Get favorite services
   */
  async getFavoriteServices(): Promise<FavoriteService[]> {
    const response = await api.get('/favorites/services');
    return response.data;
  },

  /**
   * Get favorite professionals
   */
  async getFavoriteProfessionals(): Promise<FavoriteProfessional[]> {
    const response = await api.get('/favorites/professionals');
    return response.data;
  },

  /**
   * Add service to favorites
   */
  async addServiceToFavorites(serviceId: string): Promise<{ success: boolean; favorite: { id: string; added_at: string } }> {
    const response = await api.post(`/favorites/services/${serviceId}`);
    return response.data;
  },

  /**
   * Remove service from favorites
   */
  async removeServiceFromFavorites(serviceId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/favorites/services/${serviceId}`);
    return response.data;
  },

  /**
   * Add professional to favorites
   */
  async addProfessionalToFavorites(professionalId: string): Promise<{ success: boolean; favorite: { id: string; added_at: string } }> {
    const response = await api.post(`/favorites/professionals/${professionalId}`);
    return response.data;
  },

  /**
   * Remove professional from favorites
   */
  async removeProfessionalFromFavorites(professionalId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/favorites/professionals/${professionalId}`);
    return response.data;
  },

  /**
   * Check if service is in favorites
   */
  async isServiceFavorite(serviceId: string): Promise<{ is_favorite: boolean; favorite_id?: string }> {
    const response = await api.get(`/favorites/services/${serviceId}/check`);
    return response.data;
  },
};

export default favoritesService;
