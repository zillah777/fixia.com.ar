import { api, PaginatedResponse } from '../api';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  requirements: string[];
  skills: string[];
  attachments: string[];
  location: string;
  remote: boolean;
  client: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
    averageRating: number;
    totalProjects: number;
  };
  proposals: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  deadline?: string;
  requirements: string[];
  skills: string[];
  location: string;
  remote: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ProjectFilters {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  remote?: boolean;
  location?: string;
  skills?: string[];
  status?: Project['status'];
  priority?: Project['priority'];
  search?: string;
  sortBy?: 'budget' | 'deadline' | 'proposals' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const projectsService = {
  async getProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
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
    const url = queryString ? `/projects?${queryString}` : '/projects';
    
    return api.get<PaginatedResponse<Project>>(url);
  },

  async getProjectById(id: string): Promise<Project> {
    return api.get<Project>(`/projects/${id}`);
  },

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    return api.post<Project>('/projects', projectData);
  },

  async updateProject(id: string, projectData: Partial<CreateProjectRequest>): Promise<Project> {
    return api.put<Project>(`/projects/${id}`, projectData);
  },

  async deleteProject(id: string): Promise<void> {
    return api.delete(`/projects/${id}`);
  },

  async getMyProjects(status?: Project['status']): Promise<Project[]> {
    const params = status ? `?status=${status}` : '';
    return api.get<Project[]>(`/projects/my-projects${params}`);
  },

  async updateProjectStatus(id: string, status: Project['status']): Promise<Project> {
    return api.patch<Project>(`/projects/${id}/status`, { status });
  },
};

export default projectsService;