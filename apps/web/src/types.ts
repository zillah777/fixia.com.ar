export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  userType: 'client' | 'professional' | 'dual';
  location?: string;
  bio?: string;
  // ... otros campos de usuario
}

export interface Professional {
  id: string;
  name: string;
  avatar?: string;
  verified: boolean;
  level: string;
  location?: string;
  average_rating?: number;
  total_reviews?: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  professional: Professional;
  image: string;
  price: number;
  originalPrice?: number;
  duration?: string;
  rating: number;
  reviews: number;
  category: string;
  tags: string[];
  deliveryTime?: string;
  featured?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  deadline: string | null;
  location: string | null;
  skillsRequired: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  category: { name: string; slug: string; icon: string; } | null;
  _count: { proposals: number; };
  proposals?: Proposal[];
}

export interface Proposal {
  id:string;
  message: string;
  quotedPrice: number;
  professional: Professional;
  // ... otros campos de propuesta
}