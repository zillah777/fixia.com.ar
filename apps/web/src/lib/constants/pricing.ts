/**
 * Pricing constants for all subscription plans
 * This is the single source of truth for all pricing information
 */

export const CLIENT_SUBSCRIPTION_PLANS = {
  free: {
    price: 0,
    currency: 'ARS',
    name: 'Plan Gratuito',
    limits: {
      announcements: 3,
      proposals: 3,
      feedback: 3,
    },
  },
  premium: {
    price: 2500,
    currency: 'ARS',
    name: 'Plan Premium',
    limits: {
      announcements: Infinity,
      proposals: Infinity,
      feedback: Infinity,
    },
  },
};

export const PROFESSIONAL_SUBSCRIPTION_PLANS = {
  basic: {
    price: 3900,
    currency: 'ARS',
    name: 'Plan Profesional',
    limits: {
      services: 5,
    },
  },
};

/**
 * Format price for display
 * @param price - Price in cents or as whole number
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
};

/**
 * Get the client premium plan price
 */
export const getClientPremiumPrice = (): number => {
  return CLIENT_SUBSCRIPTION_PLANS.premium.price;
};

/**
 * Get the client premium plan price formatted for display
 */
export const getClientPremiumPriceFormatted = (): string => {
  return formatPrice(getClientPremiumPrice());
};
