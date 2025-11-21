import { api } from '../api';

export interface ProfessionalProfile {
    bio?: string;
    rating?: number;
    review_count?: number;
    level?: string;
    years_experience?: number;
    completed_jobs?: number;
    response_time_hours?: number;
    specialties?: string[];
}

export interface Professional {
    id: string;
    name: string;
    lastName?: string;
    avatar?: string;
    location?: string;
    verified: boolean;
    professional_profile?: ProfessionalProfile;
    service?: {
        id: string;
        title: string;
        description: string;
        price_min?: number;
        price_max?: number;
        currency?: string;
        delivery_time_days?: number;
        category: string;
    };
    specialties?: string[];
    bio?: string;
}

export interface CategoryStats {
    category: string;
    count: number;
    icon?: string;
}

export const professionalsService = {
    /**
     * Get top-rated professionals
     */
    async getTopProfessionals(limit = 6): Promise<Professional[]> {
        return api.get<Professional[]>(`/professionals/top-rated?limit=${limit}`);
    },

    /**
     * Get professionals by category with their best service
     */
    async getProfessionalsByCategory(category: string, limit = 3): Promise<Professional[]> {
        try {
            // Try the dedicated endpoint first
            return await api.get<Professional[]>(`/professionals/by-category/${encodeURIComponent(category)}?limit=${limit}`);
        } catch (error) {
            // Fallback: get services by category and extract unique professionals
            console.warn(`Endpoint /professionals/by-category not available, using fallback`);
            const services = await api.get<any[]>(`/services?category=${encodeURIComponent(category)}&limit=${limit * 2}&sortBy=rating&sortOrder=desc`);

            // Extract unique professionals from services
            const professionalsMap = new Map<string, Professional>();

            if (services && Array.isArray(services)) {
                services.forEach((service: any) => {
                    if (service.professional && !professionalsMap.has(service.professional.id)) {
                        professionalsMap.set(service.professional.id, {
                            ...service.professional,
                            service: {
                                id: service.id,
                                title: service.title,
                                description: service.description,
                                price_min: service.price,
                                currency: 'ARS',
                                delivery_time_days: service.delivery_time_days,
                                category: typeof service.category === 'string' ? service.category : service.category?.name
                            }
                        });
                    }
                });
            }

            return Array.from(professionalsMap.values()).slice(0, limit);
        }
    },

    /**
     * Get category statistics (service counts)
     */
    async getCategoryStats(): Promise<CategoryStats[]> {
        try {
            // Try dedicated stats endpoint
            return await api.get<CategoryStats[]>('/services/categories/stats');
        } catch (error) {
            // Fallback: get categories and approximate counts
            console.warn('Stats endpoint not available, using fallback');
            const categories = await api.get<any[]>('/services/categories');
            return categories.map(cat => ({
                category: cat.name,
                count: cat.count || 0,
                icon: cat.icon
            }));
        }
    }
};

export default professionalsService;
