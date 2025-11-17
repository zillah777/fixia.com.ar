// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  location: string;
  userType: 'client' | 'professional';
  avatar?: string;
  
  // Professional specific fields
  businessName?: string;
  serviceCategories: string[];
  description?: string;
  experience?: string;
  pricing?: string;
  availability?: string;
  portfolio?: string;
  certifications?: string;
  verified?: boolean;
  level?: string;
  rating?: number;
  reviewsCount?: number;
  
  // Subscription
  subscription?: {
    plan: 'free' | 'professional';
    status: 'active' | 'cancelled' | 'expired';
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  };
  
  // Dates
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
}

// Service Types
export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategories?: string[];
  price: number;
  priceType: 'fixed' | 'hourly' | 'quote';
  currency: 'ARS';
  
  // Professional info
  professionalId: string;
  professional: {
    id: string;
    name: string;
    avatar?: string;
    businessName?: string;
    location: string;
    verified: boolean;
    level: string;
    rating: number;
    reviewsCount: number;
    responseTime?: string;
  };
  
  // Media
  images: string[];
  videos?: string[];
  
  // Metadata
  tags: string[];
  featured: boolean;
  available: boolean;
  
  // Stats
  viewsCount: number;
  contactsCount: number;
  completedJobsCount: number;
  
  // Dates
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  id: string;
  serviceId: string;
  clientId: string;
  professionalId: string;
  
  rating: number;
  title: string;
  comment: string;
  
  // Client info
  client: {
    name: string;
    avatar?: string;
    location: string;
  };
  
  // Professional response
  response?: {
    comment: string;
    createdAt: string;
  };
  
  // Metadata
  verified: boolean;
  helpful: number;
  
  // Dates
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'opportunity' | 'review' | 'system' | 'payment' | 'verification';
  title: string;
  message: string;
  read: boolean;
  
  // Action
  actionUrl?: string;
  actionLabel?: string;
  
  // Metadata
  priority: 'low' | 'medium' | 'high';
  category?: string;
  
  // Related entities
  relatedUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  
  // Dates
  createdAt: string;
  expiresAt?: string;
}

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  
  // Status
  read: boolean;
  delivered: boolean;
  
  // Metadata
  replyToId?: string;
  editedAt?: string;
  
  // Dates
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: User[];
  
  // Service context
  serviceId?: string;
  service?: Service;
  
  // Last message
  lastMessage?: Message;
  lastActivity: string;
  
  // Status
  archived: boolean;
  blocked: boolean;
  
  // Metadata
  unreadCount: { [userId: string]: number };
  
  // Dates
  createdAt: string;
  updatedAt: string;
}

// Opportunity Types
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategories?: string[];
  
  // Client info
  clientId: string;
  client: {
    name: string;
    location: string;
    verified: boolean;
  };
  
  // Requirements
  budget: {
    min?: number;
    max?: number;
    type: 'fixed' | 'hourly' | 'quote';
    currency: 'ARS';
  };
  
  deadline?: string;
  location: string;
  remote: boolean;
  
  // Matching
  skills: string[];
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  
  // Status
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  applicationsCount: number;
  maxApplications?: number;
  
  // Dates
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

// Application Types
export interface Application {
  id: string;
  opportunityId: string;
  professionalId: string;
  
  // Proposal
  proposal: string;
  estimatedPrice: number;
  estimatedDuration: string;
  
  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  
  // Communication
  questions?: string[];
  attachments?: string[];
  
  // Dates
  createdAt: string;
  updatedAt: string;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  subcategories?: string[];
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  verified?: boolean;
  availability?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'reviews' | 'distance';
  page?: number;
  limit?: number;
}

export interface SearchResults<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Analytics Types
export interface Analytics {
  // Profile views
  profileViews: {
    total: number;
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
  
  // Service performance
  serviceViews: {
    total: number;
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
  
  // Contact rates
  contacts: {
    total: number;
    thisWeek: number;
    lastWeek: number;
    change: number;
    conversionRate: number;
  };
  
  // Reviews
  reviews: {
    total: number;
    average: number;
    distribution: { [key: number]: number };
    recent: Review[];
  };
  
  // Revenue (for professionals)
  revenue?: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    yearToDate: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  location: string;
  userType: 'client' | 'professional';
  
  // Professional fields
  businessName?: string;
  serviceCategories: string[];
  description?: string;
  experience?: string;
  pricing?: string;
  availability?: string;
  portfolio?: string;
  certifications?: string;
  
  // Agreements
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing?: boolean;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  userType?: 'client' | 'professional' | 'other';
  urgent?: boolean;
}

// Settings Types
export interface NotificationSettings {
  email: {
    newOpportunities: boolean;
    messages: boolean;
    marketing: boolean;
    security: boolean;
    reviews: boolean;
    payments: boolean;
  };
  push: {
    newOpportunities: boolean;
    messages: boolean;
    reminders: boolean;
    marketing: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'registered' | 'private';
  showLocation: boolean;
  showPhone: boolean;
  showEmail: boolean;
  allowIndexing: boolean;
  allowMarketing: boolean;
}

// Location Types
export interface Location {
  id: string;
  name: string;
  type: 'city' | 'province' | 'country';
  parentId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  subcategories?: Category[];
  servicesCount: number;
  popular: boolean;
  featured: boolean;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;