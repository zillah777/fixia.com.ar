/**
 * Professional Circuit Type Definitions
 * 
 * Types for professional-specific features including:
 * - Service management (CRUD)
 * - B2B interactions
 * - Privacy controls
 * - Service requests
 * 
 * @module types/professional-circuit
 */

import type { User, Category } from './index';

// ============================================================================
// SERVICE TYPES
// ============================================================================

/**
 * Service model (matches Prisma schema)
 */
export interface Service {
    id: string;
    professional_id: string;
    category_id: string | null;
    title: string;
    description: string;
    price: number;
    currency: string;
    main_image: string | null;
    gallery: string[];
    tags: string[];
    delivery_time_days: number | null;
    revisions_included: number;
    active: boolean;
    featured: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;

    // Relations (optional, loaded on demand)
    professional?: ProfessionalUser;
    category?: Category;
    reviews?: ServiceReview[];
    average_rating?: number;
    total_reviews?: number;
}

/**
 * Service form data for creation/editing
 */
export interface ServiceFormData {
    title: string;
    description: string;
    category_id: string;
    price: number;
    delivery_time_days?: number;
    revisions_included?: number;
    main_image?: string;
    gallery?: string[];
    tags?: string[];
}

/**
 * Service with stats (for dashboard)
 */
export interface ServiceWithStats extends Service {
    requests_count: number;
    views_this_month: number;
    conversion_rate: number;
}

// ============================================================================
// PRIVACY & VISIBILITY TYPES
// ============================================================================

/**
 * Public service data (shown before match)
 * Implements privacy controls - NO personal info revealed
 */
export interface PublicServiceData {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    delivery_time_days: number | null;
    revisions_included: number;
    main_image: string | null;
    gallery: string[];
    tags: string[];

    // Limited professional info
    professional_first_name: string; // Only first name
    professional_rating: number;
    professional_reviews_count: number;
    professional_location_general: string; // e.g., "Buenos Aires" (not full address)
    professional_verified: boolean;

    // Hidden until match
    // professional_full_name: HIDDEN
    // professional_whatsapp: HIDDEN
    // professional_email: HIDDEN
}

/**
 * Private service data (revealed after match)
 */
export interface PrivateServiceData extends PublicServiceData {
    professional_full_name: string;
    professional_whatsapp: string;
    professional_email: string;
    professional_phone: string | null;
}

// ============================================================================
// SERVICE REQUEST TYPES
// ============================================================================

/**
 * Service request (client requesting a service)
 */
export interface ServiceRequest {
    id: string;
    service_id: string;
    client_id: string;
    status: ServiceRequestStatus;
    message?: string;
    created_at: string;
    updated_at: string;

    // Relations
    service?: Service;
    client?: ClientUser;
}

export type ServiceRequestStatus =
    | 'pending'    // Waiting for professional response
    | 'accepted'   // Professional accepted, match created
    | 'rejected'   // Professional rejected
    | 'cancelled'; // Client cancelled

// ============================================================================
// B2B TYPES (Professional to Professional)
// ============================================================================

/**
 * B2B Project (professional seeking help from another professional)
 */
export interface B2BProject {
    id: string;
    professional_id: string; // Who posted the project
    category_id: string | null;
    title: string;
    description: string;
    budget_min: number | null;
    budget_max: number | null;
    deadline: string | null;
    skills_required: string[];
    status: B2BProjectStatus;
    created_at: string;
    updated_at: string;

    // Relations
    professional?: ProfessionalUser;
    category?: Category;
    proposals?: B2BProposal[];
}

export type B2BProjectStatus =
    | 'open'       // Accepting proposals
    | 'in_progress' // Match created, work ongoing
    | 'completed'  // Work finished
    | 'cancelled'; // Project cancelled

/**
 * B2B Proposal (professional applying to another professional's project)
 */
export interface B2BProposal {
    id: string;
    project_id: string;
    professional_id: string; // Who is applying
    message: string;
    quoted_price: number;
    delivery_time_days: number;
    status: B2BProposalStatus;
    created_at: string;
    updated_at: string;

    // Relations
    project?: B2BProject;
    professional?: ProfessionalUser;
}

export type B2BProposalStatus =
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'withdrawn';

// ============================================================================
// USER TYPES (Extended)
// ============================================================================

/**
 * Client user (inherits from base User)
 */
export interface ClientUser extends User {
    userType: 'client';
    // Clients can create projects and receive proposals
}

/**
 * Professional user (inherits from base User + subscription)
 */
export interface ProfessionalUser extends User {
    userType: 'professional';

    // Subscription fields
    isSubscriptionActive: boolean;
    subscriptionStatus: string;
    subscriptionType: string;
    subscriptionExpiresAt: string;

    // Professional-specific
    isProfessionalActive: boolean;
    professionalSince: string | null;

    // Stats
    services?: Service[];
    servicesCount?: number;
    averageRating?: number;
    totalReviews?: number;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

/**
 * Service review
 */
export interface ServiceReview {
    id: string;
    service_id: string;
    client_id: string;
    rating: number; // 1-5
    comment: string;
    created_at: string;

    // Relations
    client?: ClientUser;
    service?: Service;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Professional dashboard stats
 */
export interface ProfessionalDashboardStats {
    // Services
    totalServices: number;
    activeServices: number;
    inactiveServices: number;

    // Performance
    totalViews: number;
    viewsThisMonth: number;
    totalRequests: number;
    requestsThisMonth: number;

    // Revenue (if tracked)
    totalRevenue?: number;
    revenueThisMonth?: number;

    // Rating
    averageRating: number;
    totalReviews: number;

    // Subscription
    subscriptionStatus: string;
    subscriptionExpiresAt: string | null;
    daysUntilExpiration: number | null;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/**
 * Service notification
 */
export interface ServiceNotification {
    id: string;
    professional_id: string;
    type: ServiceNotificationType;
    title: string;
    message: string;
    read: boolean;
    created_at: string;

    // Metadata
    service_id?: string;
    request_id?: string;
    client_id?: string;
}

export type ServiceNotificationType =
    | 'service_request'     // Client requested service
    | 'service_view'        // Service was viewed
    | 'service_favorite'    // Service was favorited
    | 'review_received'     // New review
    | 'subscription_expiring' // Subscription expiring soon
    | 'subscription_expired'; // Subscription expired

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Service filters for search/discovery
 */
export interface ServiceFilters {
    category_id?: string;
    min_price?: number;
    max_price?: number;
    max_delivery_days?: number;
    min_rating?: number;
    tags?: string[];
    search_query?: string;
    sort_by?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
}

/**
 * Pagination params
 */
export interface PaginationParams {
    page: number;
    limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if user is a professional
 */
export function isProfessional(user: User | null | undefined): user is ProfessionalUser {
    return user?.userType === 'professional';
}

/**
 * Check if user is a client
 */
export function isClient(user: User | null | undefined): user is ClientUser {
    return user?.userType === 'client';
}

/**
 * Check if service is active
 */
export function isServiceActive(service: Service): boolean {
    return service.active === true;
}

/**
 * Check if service can be edited
 */
export function canEditService(service: Service, userId: string): boolean {
    return service.professional_id === userId;
}

/**
 * Check if service can be deleted
 */
export function canDeleteService(service: Service, userId: string): boolean {
    // Can delete if owner and no active requests
    return service.professional_id === userId;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Service status badge configurations
 */
export const SERVICE_STATUS_BADGES = {
    active: {
        label: 'Activo',
        color: 'bg-success/20 text-success border-success/30',
        icon: '✓',
    },
    inactive: {
        label: 'Pausado',
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        icon: '⏸',
    },
    featured: {
        label: 'Destacado',
        color: 'bg-primary/20 text-primary border-primary/30',
        icon: '⭐',
    },
} as const;

/**
 * Request status badge configurations
 */
export const REQUEST_STATUS_BADGES = {
    pending: {
        label: 'Pendiente',
        color: 'bg-warning/20 text-warning border-warning/30',
        icon: '⏳',
    },
    accepted: {
        label: 'Aceptada',
        color: 'bg-success/20 text-success border-success/30',
        icon: '✓',
    },
    rejected: {
        label: 'Rechazada',
        color: 'bg-destructive/20 text-destructive border-destructive/30',
        icon: '✗',
    },
    cancelled: {
        label: 'Cancelada',
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        icon: '⊘',
    },
} as const;
