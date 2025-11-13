/**
 * Project creation limits configuration
 * These values can be overridden via environment variables
 */
export const projectLimitsConfig = {
  // Free plan: Maximum projects per month
  FREE_PLAN_MONTHLY_LIMIT: parseInt(
    process.env.PROJECT_FREE_PLAN_MONTHLY_LIMIT || '3',
    10
  ),

  // Premium plan: Maximum projects per month (0 = unlimited)
  PREMIUM_PLAN_MONTHLY_LIMIT: parseInt(
    process.env.PROJECT_PREMIUM_PLAN_MONTHLY_LIMIT || '0',
    10
  ),

  // Professional plan: Maximum projects per month (0 = unlimited)
  PROFESSIONAL_PLAN_MONTHLY_LIMIT: parseInt(
    process.env.PROJECT_PROFESSIONAL_PLAN_MONTHLY_LIMIT || '0',
    10
  ),

  // Default message for limit exceeded
  LIMIT_EXCEEDED_MESSAGE: (plan: string, limit: number): string => {
    if (limit === 0) {
      return `Your ${plan} plan allows unlimited projects.`;
    }
    return `You've reached the limit of ${limit} projects per month on your ${plan} plan. Upgrade to create more.`;
  },
};

/**
 * Get the monthly project limit for a user based on their subscription
 */
export function getProjectMonthlyLimit(
  subscriptionType?: string | null,
  subscriptionStatus?: string | null
): number {
  const isActive = subscriptionStatus === 'active';

  if (!subscriptionType || !isActive) {
    return projectLimitsConfig.FREE_PLAN_MONTHLY_LIMIT;
  }

  switch (subscriptionType.toLowerCase()) {
    case 'premium':
      return projectLimitsConfig.PREMIUM_PLAN_MONTHLY_LIMIT;
    case 'professional':
      return projectLimitsConfig.PROFESSIONAL_PLAN_MONTHLY_LIMIT;
    case 'free':
    default:
      return projectLimitsConfig.FREE_PLAN_MONTHLY_LIMIT;
  }
}

/**
 * Check if a user has reached their monthly project limit
 * Returns { exceeded: boolean, remaining: number, limit: number }
 */
export function checkProjectLimit(
  projectsThisMonth: number,
  subscriptionType?: string | null,
  subscriptionStatus?: string | null
): { exceeded: boolean; remaining: number; limit: number } {
  const limit = getProjectMonthlyLimit(subscriptionType, subscriptionStatus);

  // If limit is 0, it means unlimited
  if (limit === 0) {
    return { exceeded: false, remaining: Infinity, limit: 0 };
  }

  const exceeded = projectsThisMonth >= limit;
  const remaining = Math.max(0, limit - projectsThisMonth);

  return { exceeded, remaining, limit };
}
