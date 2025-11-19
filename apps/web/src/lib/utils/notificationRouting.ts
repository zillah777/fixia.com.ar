/**
 * Notification Routing Helper
 * Maps notification types to appropriate URLs based on user type
 */

export type NotificationType =
  | 'message'
  | 'system'
  | 'proposal_received'
  | 'review_received'
  | 'job_started'
  | 'job_completed'
  | 'job_milestone'
  | 'payment_received'
  | 'new_project'
  | 'match_created'
  | 'match_completed'
  | 'phone_revealed'
  | 'review_requested';

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

  // Reviews
  'review_received': {
    professional: '/profile',
    client: '/profile',
    dual: '/profile',
  },

  'review_requested': {
    professional: '/my-jobs', // Professional needs to write a review
    client: '/projects',
    dual: '/my-jobs',
  },

  // Payments
  'payment_received': {
    professional: '/wallet', // Professional receives payments
    client: '/wallet', // Client sends payments
    dual: '/wallet',
  },

  // New projects/opportunities
  'new_project': {
    professional: '/opportunities', // Professional sees new projects
    client: '/projects', // Client's own projects
    dual: '/opportunities',
  },

  // Matching system
  'match_created': {
    professional: '/opportunities',
    client: '/projects',
    dual: '/opportunities',
  },

  'match_completed': {
    professional: '/my-jobs',
    client: '/projects',
    dual: '/my-jobs',
  },

  // Phone revealed notification
  'phone_revealed': {
    professional: '/profile',
    client: '/profile',
    dual: '/profile',
  },

  // System and general notifications
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
      notificationType === 'proposal_received' &&
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

    // For match notifications, append match ID or opportunity ID
    if (notificationType === 'match_created' && metadata.opportunityId) {
      url = `/projects/${metadata.opportunityId}`;
    }

    if (notificationType === 'match_completed' && metadata.matchId) {
      // If there's a specific match detail page, use it
      // Otherwise, fallback to default routing
      url = `/my-jobs/${metadata.matchId}`;
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
    'job_started': 'Ver trabajo',
    'job_completed': 'Ver trabajo',
    'job_milestone': 'Ver hito',
    'review_received': 'Ver reseña',
    'review_requested': 'Escribir reseña',
    'payment_received': 'Ver pago',
    'new_project': 'Ver anuncio',
    'match_created': 'Ver coincidencia',
    'match_completed': 'Ver resultado',
    'phone_revealed': 'Ver contacto',
    'system': 'Ver más',
  };

  return labels[notificationType] || 'Ver más';
}
