import { api } from '../api';

/**
 * Public Profile Response Interface
 */
export interface PublicProfileResponse {
    id: string;
    name: string;
    avatar: string | null;
    location: string | null;
    verified: boolean;
    user_type: 'client' | 'professional' | 'dual';
    created_at: string;
    bio: string | null;
    phone: string | null;
    whatsapp_number: string | null;
    social_linkedin: string | null;
    social_twitter: string | null;
    social_facebook: string | null;
    social_instagram: string | null;
    professional_profile: {
        bio: string | null;
        specialties: string[];
        rating: number;
        review_count: number;
        level: string;
        years_experience: number;
        availability_status: string;
        response_time_hours: number;
    } | null;
    services: Array<{
        id: string;
        title: string;
        description: string;
        price: number;
        main_image: string | null;
        view_count: number;
        created_at: string;
        category: {
            name: string;
            slug: string;
            icon: string | null;
        };
    }>;
    reviews_received: Array<{
        id: string;
        rating: number;
        comment: string | null;
        created_at: string;
        reviewer: {
            name: string;
            avatar: string | null;
            verified: boolean;
        };
        service: {
            title: string;
        } | null;
    }>;
}

/**
 * User Stats Response Interface
 */
export interface UserStatsResponse {
    completionRate: number;
    onTimeDelivery: number;
    repeatClients: number;
    avgProjectValue: number;
    completedProjects: number;
    totalProjects: number;
}

/**
 * Fetch public profile data for a user
 */
export async function fetchPublicProfile(userId: string): Promise<PublicProfileResponse> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
}

/**
 * Fetch calculated stats for a professional
 * Returns null for non-professionals
 */
export async function fetchUserStats(userId: string): Promise<UserStatsResponse | null> {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
}
