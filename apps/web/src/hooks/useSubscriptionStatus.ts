import { useCurrentUser } from '@/utils/useCurrentUser';
import { FEATURES } from '@/config/features';

/**
 * Subscription status information
 */
export interface SubscriptionStatus {
    /**
     * Whether the subscription is currently active
     */
    isActive: boolean;

    /**
     * Whether the user is a professional
     */
    isProfessional: boolean;

    /**
     * Whether the user can publish services
     */
    canPublishServices: boolean;

    /**
     * Whether the user can apply to B2B projects
     */
    canApplyToProjects: boolean;

    /**
     * Whether the user has reached the service limit
     */
    hasReachedServiceLimit: boolean;

    /**
     * Current number of active services
     */
    activeServicesCount: number;

    /**
     * Maximum allowed services
     */
    maxServices: number;

    /**
     * Subscription expiration date (if applicable)
     */
    expiresAt?: string;

    /**
     * Days remaining until expiration
     */
    daysRemaining?: number;

    /**
     * Subscription type (e.g., 'monthly', 'annual')
     */
    subscriptionType?: string;
}

/**
 * useSubscriptionStatus Hook
 * 
 * Centralized hook for checking subscription status and permissions.
 * Handles both development bypass and production enforcement.
 * 
 * @returns Subscription status and permissions
 * 
 * @example
 * ```typescript
 * const { isActive, canPublishServices, daysRemaining } = useSubscriptionStatus();
 * 
 * if (!canPublishServices) {
 *   return <SubscriptionPaywall />;
 * }
 * ```
 */
export function useSubscriptionStatus(activeServicesCount: number = 0): SubscriptionStatus {
    const { data: user } = useCurrentUser();

    const isProfessional = user?.userType === 'professional';

    // Check if subscription is active
    // In development mode, bypass subscription check if flag is disabled
    const isActive = !!(isProfessional && (
        !FEATURES.ENABLE_SUBSCRIPTION_CHECK || // Dev bypass
        (
            user?.subscriptionStatus === 'active' &&
            user?.subscriptionExpiresAt &&
            new Date(user.subscriptionExpiresAt) > new Date()
        )
    ));

    // Calculate days remaining
    const daysRemaining = user?.subscriptionExpiresAt
        ? Math.ceil(
            (new Date(user.subscriptionExpiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
        : undefined;

    // Determine max services based on user type
    const maxServices = isProfessional
        ? FEATURES.MAX_SERVICES_PROFESSIONAL
        : FEATURES.MAX_SERVICES_FREE;

    // Check if service limit reached
    const hasReachedServiceLimit = activeServicesCount >= maxServices;

    return {
        isActive,
        isProfessional,
        canPublishServices: !!(isActive && !hasReachedServiceLimit),
        canApplyToProjects: !!(isActive && FEATURES.ENABLE_B2B_MATCHING),
        hasReachedServiceLimit,
        activeServicesCount,
        maxServices,
        expiresAt: user?.subscriptionExpiresAt,
        daysRemaining,
        subscriptionType: user?.subscriptionType,
    };
}

/**
 * useSubscriptionWarning Hook
 * 
 * Check if subscription is expiring soon and needs warning
 * 
 * @returns Warning information
 */
export function useSubscriptionWarning() {
    const { isActive, daysRemaining, expiresAt } = useSubscriptionStatus();

    const isExpiringSoon = isActive && daysRemaining !== undefined && daysRemaining <= 7;
    const isExpired = !isActive && expiresAt !== undefined;

    return {
        isExpiringSoon,
        isExpired,
        daysRemaining,
        warningMessage: isExpiringSoon
            ? `Tu suscripción vence en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}`
            : isExpired
                ? 'Tu suscripción ha expirado'
                : null,
    };
}
