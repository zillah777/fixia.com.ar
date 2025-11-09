/**
 * Notification Routing Helper
 * Maps notification types to appropriate URLs based on user type
 */

export type NotificationType =
  | 'message'
  | 'order'
  | 'payment'
  | 'review'
  | 'system'
  | 'promotion'
  | 'proposal_received'
  | 'proposal_accepted'
  | 'job_started'
  | 'job_completed'
  | 'job_milestone'
  | 'review_received';

export type UserType = 'professional' | 'client' | 'dual';

interface NotificationRoute {
  professional?: string;
  client?: string;
  dual?: string;
  fallback?: string;
}

/**
 * Map notification types to their respective routes for each user type
 */
const notificationRoutes: Record<NotificationType, NotificationRoute> = {
  // Messages - Same for all user types
  'message': {
    professional: '/messages',
    client: '/messages',
    dual: '/messages',
  },

  // Proposals - Professional submits, Client receives
  'proposal_received': {
    client: '/projects', // Client sees proposals in their projects
    professional: '/opportunities', // Fallback for dual users
    dual: '/projects', // Dual role as client
  },

  'proposal_accepted': {
    professional: '/my-jobs', // Professional sees accepted proposals in jobs
    client: '/projects', // Client can view from projects
    dual: '/my-jobs',
  },

  // Job/Work related
  'job_started': {
    professional: '/my-jobs',
    client: '/projects',
    dual: '/my-jobs',
  },

  'job_completed': {
    professional: '/my-jobs',
    client: '/projects',
    dual: '/my-jobs',
  },

  'job_milestone': {
    professional: '/my-jobs',
    client: '/projects',
    dual: '/my-jobs',
  },

  // Reviews - Both types receive reviews
  'review': {
    professional: '/profile', // View profile to see reviews
    client: '/profile',
    dual: '/profile',
  },

  'review_received': {
    professional: '/profile',
    client: '/profile',
    dual: '/profile',
  },

  // Payments
  'payment': {
    professional: '/wallet', // Professional receives payments
    client: '/wallet', // Client sends payments
    dual: '/wallet',
  },

  // Orders
  'order': {
    professional: '/orders',
    client: '/orders',
    dual: '/orders',
  },

  // Promotions and system messages
  'promotion': {
    professional: '/notifications',
    client: '/notifications',
    dual: '/notifications',
    fallback: '/notifications',
  },

  'system': {
    professional: '/notifications',
    client: '/notifications',
    dual: '/notifications',
    fallback: '/notifications',
  },
};

/**
 * Get the appropriate URL for a notification based on type and user role
 * @param notificationType - The type of notification
 * @param userType - The user's role (professional, client, or dual)
 * @param metadata - Optional metadata that might contain specific IDs
 * @returns The URL to redirect to
 */
export function getNotificationUrl(
  notificationType: NotificationType,
  userType: UserType,
  metadata?: Record<string, any>
): string {
  const route = notificationRoutes[notificationType];

  if (!route) {
    // Default to notifications page if type not found
    return '/notifications';
  }

  // Get URL based on user type
  let url = route[userType] || route.professional || route.fallback;

  if (!url) {
    return '/notifications';
  }

  // Append specific IDs if available in metadata
  if (metadata) {
    // For proposal routes, append proposal ID
    if (
      (notificationType === 'proposal_received' || notificationType === 'proposal_accepted') &&
      metadata.projectId
    ) {
      url = `/projects/${metadata.projectId}`;
    }

    // For job routes, append job ID
    if (
      (notificationType === 'job_started' ||
       notificationType === 'job_completed' ||
       notificationType === 'job_milestone') &&
      metadata.jobId
    ) {
      url = `/my-jobs/${metadata.jobId}`;
    }

    // For messages, append conversation ID if available
    if (notificationType === 'message' && metadata.conversationId) {
      url = `/messages/${metadata.conversationId}`;
    }
  }

  return url;
}

/**
 * Get a human-readable action label for a notification
 */
export function getNotificationActionLabel(notificationType: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    'message': 'Ver mensaje',
    'proposal_received': 'Ver propuesta',
    'proposal_accepted': 'Ver trabajo',
    'job_started': 'Ver trabajo',
    'job_completed': 'Ver trabajo',
    'job_milestone': 'Ver trabajo',
    'review': 'Ver reseña',
    'review_received': 'Ver reseña',
    'payment': 'Ver pago',
    'order': 'Ver pedido',
    'promotion': 'Ver promoción',
    'system': 'Ver más',
  };

  return labels[notificationType] || 'Ver más';
}
