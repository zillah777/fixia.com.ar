/**
 * Feature Flags Configuration
 * 
 * Controls feature availability across development and production environments.
 * 
 * @module config/features
 */

/**
 * Feature flags for the application
 */
export const FEATURES = {
    /**
     * Subscription Check Enforcement
     * 
     * When true: Professionals must have active subscription to publish services
     * When false: Subscription checks are bypassed (development mode)
     * 
     * @default false in development, true in production
     */
    ENABLE_SUBSCRIPTION_CHECK: import.meta.env.VITE_ENABLE_SUBSCRIPTION_CHECK === 'true',

    /**
     * Maximum number of services a free user can publish
     * Clients (free users) cannot publish services at all
     */
    MAX_SERVICES_FREE: 0,

    /**
     * Maximum number of services a professional can publish
     * Based on security review recommendations
     */
    MAX_SERVICES_PROFESSIONAL: 5,

    /**
     * Enable B2B matching features
     * Allows professionals to apply to other professionals' projects
     */
    ENABLE_B2B_MATCHING: true,

    /**
     * Enable service request notifications
     * Notify professionals when clients request their services
     */
    ENABLE_SERVICE_NOTIFICATIONS: true,

    /**
     * Enable professional dashboard analytics
     * Show performance metrics and insights
     */
    ENABLE_ANALYTICS: true,
} as const;

/**
 * Type-safe feature flag keys
 */
export type FeatureFlag = keyof typeof FEATURES;

/**
 * Check if a feature is enabled
 * 
 * @param feature - Feature flag to check
 * @returns Whether the feature is enabled
 * 
 * @example
 * ```typescript
 * if (isFeatureEnabled('ENABLE_B2B_MATCHING')) {
 *   // Show B2B features
 * }
 * ```
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
    return FEATURES[feature] === true;
}

/**
 * Development mode check
 * Useful for showing dev-only UI elements
 */
export const IS_DEVELOPMENT = import.meta.env.DEV;

/**
 * Production mode check
 */
export const IS_PRODUCTION = import.meta.env.PROD;
