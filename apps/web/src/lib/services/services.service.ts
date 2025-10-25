import { api, PaginatedResponse } from '../api';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  popular: boolean;
}

export interface Professional {
  id: string;
  name: string;
  lastName?: string;
  avatar?: string;
  verified: boolean;
  level?: string;
  location?: string;
  whatsapp_number?: string;
  averageRating?: number;
  totalReviews?: number;
  professional_profile?: {
    bio?: string;
    rating?: number;
    review_count?: number;
    level?: string;
    specialties?: string[];
    response_time_hours?: number;
    availability_status?: string;
    completed_orders?: number;
  };
  badges?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  }>;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string | { id: string; name: string; slug: string; icon?: string };
  subcategory?: string;
  price: number;
  priceType?: 'fixed' | 'hourly' | 'negotiable';
  images?: string[];
  main_image?: string;
  gallery?: string[];
  tags: string[];
  featured?: boolean;
  active: boolean;
  professional: Professional;
  averageRating?: number;
  totalReviews?: number;
  view_count?: number;
  delivery_time_days?: number;
  revisions_included?: number;
  _count?: {
    favorites?: number;
    reviews?: number;
    service_views?: number;
  };
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceFilters {
  category?: string;
  subcategory?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  featured?: boolean;
  search?: string;
  sortBy?: 'price' | 'rating' | 'reviews' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const servicesService = {
  async getServices(filters?: ServiceFilters): Promise<PaginatedResponse<Service>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/services?${queryString}` : '/services';
    
    return api.get<PaginatedResponse<Service>>(url);
  },

  async getFeaturedServices(limit = 3): Promise<Service[]> {
    const response = await this.getServices({
      featured: true,
      limit,
      sortBy: 'popular',
      sortOrder: 'desc'
    });
    
    return response.data;
  },

  async getServiceById(id: string): Promise<Service> {
    return api.get<Service>(`/services/${id}`);
  },

  async getServicesByProfessional(professionalId: string): Promise<Service[]> {
    return api.get<Service[]>(`/services/professional/${professionalId}`);
  },

  async getCategories(): Promise<ServiceCategory[]> {
    return api.get<ServiceCategory[]>('/services/categories');
  },

  async createService(serviceData: Partial<Service>): Promise<Service> {
    return api.post<Service>('/services', serviceData);
  },

  async updateService(id: string, serviceData: Partial<Service>): Promise<Service> {
    return api.put<Service>(`/services/${id}`, serviceData);
  },

  async deleteService(id: string): Promise<void> {
    return api.delete(`/services/${id}`);
  },

  async toggleServiceActive(id: string): Promise<{ message: string; service: { id: string; active: boolean; title: string } }> {
    return api.put<{ message: string; service: { id: string; active: boolean; title: string } }>(`/services/${id}/toggle-active`, {});
  },

  async searchServices(query: string, filters?: Omit<ServiceFilters, 'search'>): Promise<PaginatedResponse<Service>> {
    return this.getServices({
      ...filters,
      search: query
    });
  },

  async getTopRatedProfessionals(limit = 6): Promise<Professional[]> {
    return api.get<Professional[]>(`/professionals/top-rated?limit=${limit}`);
  },

  async trackView(serviceId: string): Promise<{ message: string }> {
    try {
      return await api.post<{ message: string }>(`/services/${serviceId}/view`, {});
    } catch (error) {
      console.error('Error tracking view:', error);
      // Silently fail - view tracking is not critical
      return { message: 'View tracking failed' };
    }
  },

  async getServiceAnalytics(serviceId: string): Promise<any> {
    return api.get(`/services/${serviceId}/analytics`);
  },

  async getMyServicesAnalytics(): Promise<any> {
    return api.get('/services/my/analytics');
  },
};

export default servicesService;