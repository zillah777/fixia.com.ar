import { api } from '../api';

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

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'client' | 'professional' | 'dual';
    verified: boolean;
    location?: string;
    bio?: string;
    phone?: string;
    website?: string;
    // Professional specific
    specialties?: string[];
    rating?: number;
    totalServices?: number;
    // Settings
    notifications_messages?: boolean;
    notifications_orders?: boolean;
    notifications_projects?: boolean;
    notifications_newsletter?: boolean;
}

export interface UpdateProfileDto {
    name?: string;
    avatar?: string;
    location?: string;
    bio?: string;
    phone?: string;
    website?: string;
    specialties?: string[];
    notifications_messages?: boolean;
    notifications_orders?: boolean;
    notifications_projects?: boolean;
    notifications_newsletter?: boolean;
}

export const usersService = {
    getProfile: async (): Promise<UserProfile> => {
        return api.get<UserProfile>('/user/profile');
    },

    updateProfile: async (data: UpdateProfileDto): Promise<UserProfile> => {
        return api.put<UserProfile>('/user/profile', data);
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        return api.get<DashboardStats>('/user/dashboard');
    },

    getPublicProfile: async (userId: string): Promise<UserProfile> => {
        return api.get<UserProfile>(`/users/${userId}`);
    },

    deleteAccount: async (): Promise<void> => {
        return api.delete('/user/profile');
    }
};
