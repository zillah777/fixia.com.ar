import { toast } from 'sonner';
import { notificationService } from '../services/notification.service';

export interface NotificationErrorContext {
  notificationId: string;
  userId?: string;
  actionUrl?: string;
  notificationType?: string;
  error?: Error;
}

export interface NotificationHandlerResult {
  success: boolean;
  shouldDismiss: boolean;
  fallbackUrl?: string;
  message?: string;
}

/**
 * Smart notification error handler
 * Determines if a notification should be auto-dismissed or retried
 */
export async function handleNotificationError(
  context: NotificationErrorContext
): Promise<NotificationHandlerResult> {
  const { notificationId, actionUrl, notificationType, error } = context;

  // Determine if this is a retriable error or permanent
  const isRetriableError = isNetworkError(error);
  const isPermanentError = is404Error(error) || is403Error(error) || isInvalidResourceError(error);

  // If it's a network error, show retry message
  if (isRetriableError) {
    toast.error(
      'Error de conexión. Por favor intenta de nuevo.',
      {
        description: 'Las notificaciones se sincronizarán cuando la conexión se restablezca.'
      }
    );
    return {
      success: false,
      shouldDismiss: false,
      message: 'retry_later'
    };
  }

  // If it's a 404 or 403, the resource doesn't exist or you don't have access
  if (isPermanentError) {
    // Auto-dismiss the notification silently
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (deleteError) {
      console.warn('Failed to delete obsolete notification:', deleteError);
    }

    // Determine fallback location based on notification type
    const fallbackUrl = getFallbackUrl(notificationType, actionUrl);

    if (fallbackUrl) {
      toast.info(
        'Esta notificación ya no es válida',
        {
          description: 'Serás redirigido a un lugar útil.',
          duration: 2000
        }
      );
      return {
        success: true,
        shouldDismiss: true,
        fallbackUrl,
        message: 'notification_obsolete'
      };
    } else {
      toast.info(
        'Esta notificación ya no es válida',
        {
          description: 'Ha sido eliminada de tu bandeja.',
          duration: 2000
        }
      );
      return {
        success: false,
        shouldDismiss: true,
        message: 'notification_deleted'
      };
    }
  }

  // Unknown error - show generic message
  toast.error(
    'No se pudo acceder a esta notificación',
    {
      description: 'Por favor intenta de nuevo más tarde.'
    }
  );

  return {
    success: false,
    shouldDismiss: false,
    message: 'unknown_error'
  };
}

/**
 * Check if error is network-related (retriable)
 */
function isNetworkError(error?: Error): boolean {
  if (!error) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('fetch')
  );
}

/**
 * Check if error is 404 (resource not found)
 */
function is404Error(error?: Error): boolean {
  if (!error) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('404') ||
    message.includes('not found') ||
    message.includes('no existe')
  );
}

/**
 * Check if error is 403 (forbidden/no access)
 */
function is403Error(error?: Error): boolean {
  if (!error) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('403') ||
    message.includes('forbidden') ||
    message.includes('acceso denegado')
  );
}

/**
 * Check if the resource has become invalid
 */
function isInvalidResourceError(error?: Error): boolean {
  if (!error) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('invalid') ||
    message.includes('deleted') ||
    message.includes('removed') ||
    message.includes('no longer') ||
    message.includes('ya no')
  );
}

/**
 * Get fallback URL based on notification type
 */
export function getFallbackUrl(notificationType?: string, originalUrl?: string): string | undefined {
  if (!notificationType) return undefined;

  const fallbacks: Record<string, string> = {
    proposal_received: '/my-announcements',
    job_started: '/jobs',
    job_completed: '/jobs',
    job_milestone: '/jobs',
    review_received: '/jobs',
    message: '/messages',
    payment_received: '/wallet',
    announcement_limit: '/pricing',
    account_warning: '/settings/profile',
    verification_update: '/settings/profile'
  };

  return fallbacks[notificationType];
}

/**
 * Validate if a URL is accessible before navigation
 */
export async function validateNotificationUrl(url?: string): Promise<boolean> {
  if (!url) return false;

  try {
    // Check if it's an internal URL
    if (url.startsWith('/')) {
      // Internal URLs are assumed valid (React Router will handle 404)
      return true;
    }

    // Check if it's an external URL
    if (url.startsWith('http')) {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    }

    return false;
  } catch (error) {
    console.warn('Failed to validate notification URL:', error);
    return false;
  }
}

/**
 * Smart notification click handler with error recovery
 */
export async function handleNotificationClick(
  notificationId: string,
  actionUrl?: string,
  notificationType?: string,
  onNavigate?: (url: string) => void
): Promise<void> {
  try {
    if (!actionUrl) {
      toast.info('Esta notificación no tiene una acción asociada');
      return;
    }

    // Try to validate and navigate
    const isValid = await validateNotificationUrl(actionUrl);

    if (!isValid) {
      // URL validation failed, try fallback
      const fallbackUrl = getFallbackUrl(notificationType, actionUrl);

      if (fallbackUrl) {
        onNavigate?.(fallbackUrl);
        return;
      }

      throw new Error('404: URL no disponible');
    }

    // URL is valid, navigate
    if (actionUrl.startsWith('/')) {
      onNavigate?.(actionUrl);
    } else if (actionUrl.startsWith('http')) {
      window.open(actionUrl, '_blank');
    }
  } catch (error: any) {
    // Handle error gracefully
    const result = await handleNotificationError({
      notificationId,
      actionUrl,
      notificationType,
      error
    });

    // If we have a fallback URL, navigate to it
    if (result.fallbackUrl) {
      onNavigate?.(result.fallbackUrl);
    }
  }
}
