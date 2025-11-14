import { api, PaginatedResponse } from '../api';
import { emitMatchCreatedEvent } from '@/hooks/useMatchesRefresh';

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
  myProposals?: number; // Number of proposals current user has submitted (0-2)
  isOwn?: boolean; // Flag to indicate this is user's own project
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
    const projects = await api.get('/projects');

    // DEBUG: Log raw response from backend
    console.log('🔍 getMyProjects RAW response:', {
      isArray: Array.isArray(projects),
      length: projects?.length,
      firstProject: projects?.[0],
      firstProjectKeys: projects?.[0] ? Object.keys(projects[0]) : [],
      hasProposalsKey: projects?.[0] ? 'proposals' in projects[0] : false,
      proposalsValue: projects?.[0]?.proposals,
      proposalsType: typeof projects?.[0]?.proposals,
      proposalsIsArray: Array.isArray(projects?.[0]?.proposals),
      hasNullElements: projects?.some((p: any) => p == null),
    });

    // CRITICAL: Filter out any undefined/null projects and ensure proposals is always an array
    if (!Array.isArray(projects)) {
      console.error('❌ getMyProjects received non-array:', projects);
      return [];
    }

    // Filter and log null/undefined projects
    const validProjects = projects.filter((project: any) => {
      if (project == null) {
        console.warn('⚠️ Found null/undefined project in array');
        return false;
      }
      return true;
    });

    console.log(`✅ Filtered ${projects.length - validProjects.length} null projects, ${validProjects.length} remaining`);

    return validProjects.map((project: any) => {
      // DEBUG: Log proposals state for this project
      if (!Array.isArray(project.proposals)) {
        console.warn(`⚠️ Project ${project.id} has non-array proposals:`, project.proposals);
      }

      return {
        ...project,
        // Defensive: Guarantee proposals is always an array
        proposals: Array.isArray(project.proposals)
          ? project.proposals
              .filter((proposal: any) => {
                if (proposal == null) {
                  console.warn(`⚠️ Found null/undefined proposal in project ${project.id}`);
                  return false;
                }
                return true;
              })
              .map((proposal: any) => ({
                ...proposal,
                professional: {
                  ...proposal.professional,
                  professional_profile: proposal.professional?.professional_profile
                    ? {
                        bio: proposal.professional.professional_profile.bio,
                        average_rating: proposal.professional.professional_profile.rating || 0,
                        total_reviews: proposal.professional.professional_profile.review_count || 0,
                      }
                    : undefined,
                  // Map user_type to expected name
                  userType: proposal.professional?.user_type,
                  // Map verified field
                  isVerified: proposal.professional?.verified || false,
                  // Map creation date
                  created_at: proposal.professional?.created_at,
                },
              }))
          : [], // Fallback to empty array if proposals is undefined/null
      };
    });
  },

  async updateProject(projectId: string, projectData: Partial<CreateOpportunityData>): Promise<any> {
    return api.put(`/projects/${projectId}`, projectData);
  },

  async deleteProject(projectId: string): Promise<void> {
    return api.delete(`/projects/${projectId}`);
  },

  // Proposal management methods
  async acceptProposal(projectId: string, proposalId: string): Promise<any> {
    const result = await api.put(`/opportunities/${projectId}/proposals/${proposalId}/accept`);

    // Emit event to trigger match refresh across all components
    if (result?.match) {
      emitMatchCreatedEvent({
        matchId: result.match.id,
        projectId: projectId,
        clientId: result.match.client_id,
        professionalId: result.match.professional_id,
        status: result.match.status,
      });
    }

    return result;
  },

  async rejectProposal(projectId: string, proposalId: string): Promise<any> {
    return api.put(`/opportunities/${projectId}/proposals/${proposalId}/reject`);
  },
};

export default opportunitiesService;