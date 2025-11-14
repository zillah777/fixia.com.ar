// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  user_type: 'client' | 'professional' | 'dual';
  location?: string;
  verified: boolean;
  email_verified: boolean;
  phone?: string;
  whatsapp_number?: string;
  bio?: string;
  social_linkedin?: string;
  social_twitter?: string;
  social_facebook?: string;
  social_instagram?: string;
  notifications_messages?: boolean;
  notifications_orders?: boolean;
  notifications_projects?: boolean;
  notifications_newsletter?: boolean;
  timezone?: string;
  createdAt?: string;
  created_at: string;
  updated_at: string;
  professionalProfile?: ProfessionalProfile;
  userType?: 'client' | 'professional' | 'dual';
  planType?: string;
}

export interface ProfessionalProfile {
  id: string;
  user_id: string;
  bio?: string;
  specialties: string[];
  years_experience?: number;
  level: 'Nuevo' | 'ProfesionalVerificado' | 'TopRatedPlus' | 'TecnicoCertificado';
  rating: number;
  review_count: number;
  total_earnings: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  response_time_hours: number;
  created_at: string;
  updated_at: string;
}

// Service Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  popular: boolean;
  service_count: number;
  created_at: string;
}

export interface Service {
  id: string;
  professional_id: string;
  category_id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  main_image?: string;
  gallery: string[];
  tags: string[];
  delivery_time_days?: number;
  revisions_included: number;
  active: boolean;
  featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  professional?: User;
  category?: Category;
  reviews?: Review[];
}

// Project Types
export interface Project {
  id: string;
  client_id: string;
  category_id?: string;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  skills_required: string[];
  proposals_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  client?: User;
  category?: Category;
  proposals?: Proposal[];
}

export interface Proposal {
  id: string;
  project_id: string;
  professional_id: string;
  message: string;
  quoted_price: number;
  delivery_time_days: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
  // Relations
  project?: Project;
  professional?: User;
}

// Review Types
export interface Review {
  id: string;
  service_id: string;
  reviewer_id: string;
  professional_id: string;
  rating: number;
  comment?: string;
  helpful_count: number;
  created_at: string;
  // Relations
  service?: Service;
  reviewer?: User;
  professional?: User;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  user_type: 'client' | 'professional';
  location?: string;
  phone?: string;
  whatsapp_number?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  status_code: number;
}

// Search and Filter Types
export interface ServiceFilters {
  category_id?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  rating_min?: number;
  professional_level?: string;
  search?: string;
  sort_by?: 'price' | 'rating' | 'created_at' | 'popularity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProjectFilters {
  category_id?: string;
  location?: string;
  min_budget?: number;
  max_budget?: number;
  status?: string;
  search?: string;
  sort_by?: 'created_at' | 'budget_max' | 'proposals_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: 'new_project' | 'proposal_received' | 'review_received' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

// Form Types
export interface CreateServiceData {
  title: string;
  description: string;
  price: number;
  category_id: string;
  delivery_time_days?: number;
  revisions_included?: number;
  tags?: string[];
  main_image?: string;
  gallery?: string[];
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  active?: boolean;
  featured?: boolean;
}

export interface CreateProjectData {
  title: string;
  description: string;
  category_id?: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  location?: string;
  skills_required?: string[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
}

// Dashboard Types
export interface DashboardStats {
  total_services: number;
  active_projects: number;
  total_earnings: number;
  average_rating: number;
  review_count: number;
  profile_views: number;
  messages_count: number;
  pending_proposals: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  date: string;
  related_resource?: {
    id: string;
    type: 'service' | 'project' | 'proposal' | 'review';
    title: string;
  };
}