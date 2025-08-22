import { api, PaginatedResponse } from '../api';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  location: string;
  remote: boolean;
  deadline?: string;
  skills: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
    averageRating: number;
    totalProjects: number;
    location: string;
  };
  proposals: number;
  matchScore: number; // 0-100, how well it matches professional's profile
  isApplied: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface OpportunityFilters {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  remote?: boolean;
  location?: string;
  skills?: string[];
  priority?: Opportunity['priority'];
  minMatchScore?: number;
  excludeApplied?: boolean;
  search?: string;
  sortBy?: 'budget' | 'deadline' | 'match_score' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ApplicationData {
  message: string;
  proposedBudget: number;
  estimatedDuration: string;
  portfolio: string[];
}

export const opportunitiesService = {
  async getOpportunities(filters?: OpportunityFilters): Promise<PaginatedResponse<Opportunity>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/opportunities?${queryString}` : '/opportunities';
    
    return api.get<PaginatedResponse<Opportunity>>(url);
  },

  async getOpportunityById(id: string): Promise<Opportunity> {
    return api.get<Opportunity>(`/opportunities/${id}`);
  },

  async applyToOpportunity(opportunityId: string, applicationData: ApplicationData): Promise<void> {
    return api.post(`/opportunities/${opportunityId}/apply`, applicationData);
  },

  async getMyApplications(): Promise<Opportunity[]> {
    return api.get<Opportunity[]>('/opportunities/my-applications');
  },

  async withdrawApplication(opportunityId: string): Promise<void> {
    return api.delete(`/opportunities/${opportunityId}/apply`);
  },

  async getMatchingOpportunities(): Promise<Opportunity[]> {
    return api.get<Opportunity[]>('/opportunities/matching');
  },

  async markOpportunityAsSeen(opportunityId: string): Promise<void> {
    return api.patch(`/opportunities/${opportunityId}/seen`);
  },

  async saveOpportunity(opportunityId: string): Promise<void> {
    return api.post(`/opportunities/${opportunityId}/save`);
  },

  async unsaveOpportunity(opportunityId: string): Promise<void> {
    return api.delete(`/opportunities/${opportunityId}/save`);
  },

  async getSavedOpportunities(): Promise<Opportunity[]> {
    return api.get<Opportunity[]>('/opportunities/saved');
  },
};

export default opportunitiesService;