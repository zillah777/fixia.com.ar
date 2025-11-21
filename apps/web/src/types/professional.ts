/**
 * TypeScript interfaces for professional data
 * Used for simulated data and API responses
 */

export type ProfessionalLevel = 'Nuevo' | 'Intermedio' | 'Experto' | 'Elite';

export interface ProfessionalProfile {
    rating: number; // 0.0 - 5.0
    review_count: number;
    level: ProfessionalLevel;
    years_experience: number;
    completed_jobs: number;
    response_time_hours: number;
}

export interface ProfessionalService {
    id: string;
    title: string;
    description: string;
    price_min: number;
    price_max: number;
    currency: string;
    delivery_time_days: number;
    category: string;
}

export interface SimulatedProfessional {
    id: string;
    name: string;
    avatar: string;
    location: string;
    verified: boolean;
    professional_profile: ProfessionalProfile;
    service: ProfessionalService;
    specialties: string[];
    bio: string;
    whatsapp_number?: string;
}

export interface CategoryProfessionals {
    category: string;
    professionals: SimulatedProfessional[];
}
