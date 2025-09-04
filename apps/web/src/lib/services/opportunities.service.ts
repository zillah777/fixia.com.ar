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

export interface CreateOpportunityData {
  title: string;
  description: string;
  category_id?: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  location?: string;
  skills_required?: string[];
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

  // Client methods for creating opportunities/projects
  async createOpportunity(opportunityData: CreateOpportunityData): Promise<any> {
    return api.post('/projects', opportunityData);
  },

  async getMyProjects(): Promise<any[]> {
    return api.get('/projects');
  },

  async updateProject(projectId: string, projectData: Partial<CreateOpportunityData>): Promise<any> {
    return api.put(`/projects/${projectId}`, projectData);
  },

  async deleteProject(projectId: string): Promise<void> {
    return api.delete(`/projects/${projectId}`);
  },
};

export default opportunitiesService;