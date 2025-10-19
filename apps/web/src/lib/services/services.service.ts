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
  lastName: string;
  avatar?: string;
  verified: boolean;
  level: string;
  location: string;
  averageRating: number;
  totalReviews: number;
  badges: Array<{
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
  category: string;
  subcategory?: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'negotiable';
  images: string[];
  tags: string[];
  featured: boolean;
  active: boolean;
  professional: Professional;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
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

  async toggleServiceStatus(id: string): Promise<Service> {
    return api.patch<Service>(`/services/${id}/toggle-status`);
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
};

export default servicesService;