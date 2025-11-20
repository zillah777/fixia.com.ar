/**
 * Client Core Circuit Type Definitions
 * 
 * Comprehensive type system for the client-side workflow in Fixia marketplace.
 * Follows strict TypeScript best practices and maintains consistency with existing codebase.
 * 
 * @module client-circuit
 * @author Fixia Engineering Team
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Project lifecycle states
 * Matches Prisma schema ProjectStatus enum
 */
export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Proposal negotiation states
 * Matches Prisma schema ProposalStatus enum
 */
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

/**
 * Match lifecycle states
 * Matches Prisma schema MatchStatus enum
 */
export type MatchStatus = 'active' | 'completed' | 'disputed' | 'cancelled';

/**
 * Maximum number of proposal attempts per professional per project
 * Business Rule: 2 attempts maximum (initial + 1 counter-proposal)
 */
export const MAX_PROPOSAL_ATTEMPTS = 2 as const;

/**
 * Attempt count type (1 or 2)
 */
export type AttemptCount = 1 | 2;

// ============================================================================
// CORE DOMAIN MODELS
// ============================================================================

/**
 * Project (Client's Need/Announcement)
 * Represents a client's posted project/need
 */
export interface Project {
    id: string;
    client_id: string;
    category_id?: string;
    title: string;
    description: string;
    budget_min?: number;
    budget_max?: number;
    deadline?: string;
    status: ProjectStatus;
    location?: string;
    skills_required: string[];
    main_image_url?: string;
    gallery_urls: string[];
    proposals_count: number;
    created_at: string;
    updated_at: string;

    // Relations (optional, loaded on demand)
    client?: ClientUser;
    category?: Category;
    proposals?: Proposal[];
}

/**
 * Proposal (Professional's Offer)
 * Represents a professional's proposal for a project
 */
export interface Proposal {
    id: string;
    project_id: string;
    professional_id: string;
    message: string;
    quoted_price: number;
    delivery_time_days: number;
    status: ProposalStatus;
    accepted_at?: string;
    rejected_at?: string;
    created_at: string;
    updated_at: string;
    parent_proposal_id?: string;
    version: number;

    // Relations (optional, loaded on demand)
    professional?: ProfessionalUser;
    project?: Project;
    parent_proposal?: Proposal;
    counter_proposals?: Proposal[];
    match?: Match;
}

/**
 * Enhanced Proposal with attempt tracking
 * Used in UI to enforce 2-attempt limit
 */
export interface ProposalWithAttempts extends Proposal {
    /**
     * Current attempt number (1 or 2)
     */
    attemptCount: AttemptCount;

    /**
     * Whether this professional has reached max attempts
     */
    isLocked: boolean;

    /**
     * Whether professional can send a counter-proposal
     * True only if: attemptCount === 1 && status === 'rejected'
     */
    canCounterPropose: boolean;

    /**
     * All proposals from this professional for this project
     * Used to calculate attempt count
     */
    allProposalsFromProfessional: Proposal[];
}

/**
 * Match (Accepted Proposal Connection)
 * Created when client accepts a proposal
 */
export interface Match {
    id: string;
    proposal_id: string;
    client_id: string;
    professional_id: string;
    project_id: string;
    job_id?: string;
    status: MatchStatus;
    phone_revealed_at?: string;
    phone_reveal_count: number;
    created_at: string;
    updated_at: string;

    // Relations (optional, loaded on demand)
    proposal?: Proposal;
    client?: ClientUser;
    professional?: ProfessionalUser;
    reviews?: MatchReview[];
}

/**
 * Match Review (Post-Completion Feedback)
 * Created after match completion
 */
export interface MatchReview {
    id: string;
    match_id: string;
    reviewer_id: string;
    reviewed_user_id: string;
    overall_rating: number;
    communication_rating?: number;
    quality_rating?: number;
    professionalism_rating?: number;
    timeliness_rating?: number;
    comment?: string;
    verified_match: boolean;
    created_at: string;
    updated_at: string;

    // Relations (optional, loaded on demand)
    match?: Match;
    reviewer?: User;
    reviewed_user?: User;
}

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * Base User interface
 */
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    location?: string;
    phone?: string;
    whatsapp_number?: string;
    verified: boolean;
    user_type: 'client' | 'professional';
    created_at: string;
}

/**
 * Client-specific user
 */
export interface ClientUser extends User {
    user_type: 'client';
}

/**
 * Professional-specific user with profile
 */
export interface ProfessionalUser extends User {
    user_type: 'professional';
    professional_profile?: {
        description: string;
        average_rating: number;
        total_reviews: number;
        bio?: string;
        service_categories?: string[];
    };
}

/**
 * Category for projects
 */
export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

// ============================================================================
// UI-SPECIFIC TYPES
// ============================================================================

/**
 * Match Celebration Data
 * Used to display success modal when proposal is accepted
 */
export interface MatchCelebration {
    /**
     * Professional's display name
     */
    professionalName: string;

    /**
     * Professional's WhatsApp number (revealed on match)
     */
    whatsappNumber: string;

    /**
     * Project title for context
     */
    projectTitle: string;

    /**
     * Match ID for navigation
     */
    matchId: string;

    /**
     * Agreed price from proposal
     */
    agreedPrice: number;

    /**
     * Delivery time from proposal
     */
    deliveryTimeDays: number;

    /**
     * Optional metadata for B2B collaborations
     * Used to distinguish professional-to-professional matches
     */
    metadata?: {
        /**
         * Indicates this is a B2B collaboration
         */
        isB2B?: boolean;

        /**
         * Type of collaboration
         */
        collaborationType?: 'professional';

        /**
         * Partner's specialties
         */
        partnerSpecialties?: string[];

        /**
         * Collaboration agreement URL
         */
        agreementUrl?: string;
    };
}

/**
 * Review Blocker State
 * Used to block new project creation if user has pending reviews
 */
export interface ReviewBlocker {
    /**
     * Whether user has any pending reviews
     */
    hasPendingReview: boolean;

    /**
     * Match ID that needs review
     */
    matchId?: string;

    /**
     * Name of professional/client to review
     */
    revieweeName?: string;

    /**
     * Project title for context
     */
    projectTitle?: string;

    /**
     * When the match was completed (for urgency display)
     */
    completedAt?: string;
}

/**
 * Proposal Limit State
 * Tracks attempt count and lock status for a professional
 */
export interface ProposalLimitState {
    /**
     * Current attempt count (1 or 2)
     */
    attemptCount: AttemptCount;

    /**
     * Whether professional has reached max attempts
     */
    isLocked: boolean;

    /**
     * Whether professional can send counter-proposal
     */
    canCounterPropose: boolean;

    /**
     * All proposals from this professional
     */
    proposals: Proposal[];

    /**
     * Most recent proposal
     */
    latestProposal?: Proposal;
}

/**
 * Completion Status for a Match
 * Tracks who requested completion and if both parties confirmed
 */
export interface CompletionStatus {
    /**
     * Whether match is fully completed (both parties confirmed)
     */
    isCompleted: boolean;

    /**
     * User ID who requested completion (if any)
     */
    completionRequestedBy?: string;

    /**
     * When completion was requested
     */
    completionRequestedAt?: string;

    /**
     * Whether current user can leave a review
     */
    canLeaveReview: boolean;

    /**
     * Whether current user has already left a review
     */
    hasLeftReview: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * API response for project list
 */
export type ProjectListResponse = PaginatedResponse<Project>;

/**
 * API response for proposal list
 */
export type ProposalListResponse = PaginatedResponse<Proposal>;

/**
 * API response for match list
 */
export type MatchListResponse = PaginatedResponse<Match>;

// ============================================================================
// FORM DATA TYPES
// ============================================================================

/**
 * Create Project Form Data
 */
export interface CreateProjectFormData {
    title: string;
    description: string;
    category_id?: string;
    budget_min?: number;
    budget_max?: number;
    deadline?: string;
    location?: string;
    skills_required: string[];
    main_image_url?: string;
    gallery_urls?: string[];
}

/**
 * Create Proposal Form Data
 */
export interface CreateProposalFormData {
    message: string;
    quoted_price: number;
    delivery_time_days: number;
    parent_proposal_id?: string; // For counter-proposals
}

/**
 * Create Review Form Data
 */
export interface CreateReviewFormData {
    overall_rating: number;
    communication_rating?: number;
    quality_rating?: number;
    professionalism_rating?: number;
    timeliness_rating?: number;
    comment?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract ID type from any entity
 */
export type EntityId<T extends { id: string }> = T['id'];

/**
 * Make all properties optional except specified keys
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Status badge configuration
 */
export interface StatusBadgeConfig {
    label: string;
    color: string;
    icon: string;
}

/**
 * Status badge configurations map
 */
export type StatusBadgeMap<T extends string> = Record<T, StatusBadgeConfig>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if proposal is locked (max attempts reached)
 */
export function isProposalLocked(state: ProposalLimitState): boolean {
    return state.attemptCount >= MAX_PROPOSAL_ATTEMPTS;
}

/**
 * Check if professional can send counter-proposal
 */
export function canSendCounterProposal(state: ProposalLimitState): boolean {
    return (
        state.attemptCount === 1 &&
        state.latestProposal?.status === 'rejected' &&
        !state.isLocked
    );
}

/**
 * Check if match is active
 */
export function isMatchActive(match: Match): boolean {
    return match.status === 'active';
}

/**
 * Check if match is completed
 */
export function isMatchCompleted(match: Match): boolean {
    return match.status === 'completed';
}

/**
 * Check if project can be deleted
 * Rule: Can delete if no proposals or all proposals are rejected
 */
export function canDeleteProject(project: Project): boolean {
    if (!project.proposals || project.proposals.length === 0) {
        return true;
    }

    return project.proposals.every(p => p.status === 'rejected');
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Project status badge configurations
 */
export const PROJECT_STATUS_BADGES: StatusBadgeMap<ProjectStatus> = {
    open: {
        label: 'Abierto',
        color: 'bg-success/20 text-success border-success/30',
        icon: '🟢',
    },
    in_progress: {
        label: 'En Progreso',
        color: 'bg-primary/20 text-primary border-primary/30',
        icon: '🔵',
    },
    completed: {
        label: 'Completado',
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        icon: '✅',
    },
    cancelled: {
        label: 'Cancelado',
        color: 'bg-destructive/20 text-destructive border-destructive/30',
        icon: '❌',
    },
};

/**
 * Proposal status badge configurations
 */
export const PROPOSAL_STATUS_BADGES: StatusBadgeMap<ProposalStatus> = {
    pending: {
        label: 'Pendiente',
        color: 'bg-warning/20 text-warning border-warning/30',
        icon: '⏳',
    },
    accepted: {
        label: 'Aceptada',
        color: 'bg-success/20 text-success border-success/30',
        icon: '✅',
    },
    rejected: {
        label: 'Rechazada',
        color: 'bg-destructive/20 text-destructive border-destructive/30',
        icon: '❌',
    },
    withdrawn: {
        label: 'Retirada',
        color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        icon: '🔙',
    },
};

/**
 * Match status badge configurations
 */
export const MATCH_STATUS_BADGES: StatusBadgeMap<MatchStatus> = {
    active: {
        label: 'Activo',
        color: 'bg-primary/20 text-primary border-primary/30',
        icon: '🔵',
    },
    completed: {
        label: 'Completado',
        color: 'bg-success/20 text-success border-success/30',
        icon: '✅',
    },
    disputed: {
        label: 'En Disputa',
        color: 'bg-warning/20 text-warning border-warning/30',
        icon: '⚠️',
    },
    cancelled: {
        label: 'Cancelado',
        color: 'bg-destructive/20 text-destructive border-destructive/30',
        icon: '❌',
    },
};
