/**
 * Date formatting utilities for the application
 */

/**
 * Format a date for deadline display (e.g., "15 de Diciembre, 2024")
 */
export function formatDeadlineDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Sin especificar';

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = new Date(date);
    deadlineDate.setHours(0, 0, 0, 0);

    // Calculate days until deadline
    const timeDiff = deadlineDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Format: "15 de Diciembre, 2024"
    const formatted = new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);

    // Add relative time info
    if (daysDiff === 0) {
      return `${formatted} (Hoy)`;
    } else if (daysDiff === 1) {
      return `${formatted} (Mañana)`;
    } else if (daysDiff > 1 && daysDiff <= 7) {
      return `${formatted} (En ${daysDiff} días)`;
    } else if (daysDiff > 7) {
      return `${formatted} (En ${Math.floor(daysDiff / 7)} semanas)`;
    } else if (daysDiff < 0) {
      return `${formatted} (Vencido hace ${Math.abs(daysDiff)} días)`;
    }

    return formatted;
  } catch (error) {
    console.error('Error formatting deadline date:', error);
    return 'Fecha inválida';
  }
}

/**
 * Format a date for relative time display (e.g., "Hace 2 horas")
 */
export function formatTimeAgo(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return 'Hace un momento';
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
      return `Hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
    }

    const months = Math.floor(days / 30);
    return `Hace ${months} mes${months !== 1 ? 'es' : ''}`;
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'Hace poco';
  }
}

/**
 * Format a date for display in cards (compact format)
 * e.g., "15 dic" or "15 dic 2024"
 */
export function formatCompactDate(dateString: string | Date | null | undefined, includeYear = false): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    const formatter = new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short',
      ...(includeYear && { year: 'numeric' })
    });

    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting compact date:', error);
    return 'Fecha inválida';
  }
}

/**
 * Get the number of days until a deadline
 */
export function getDaysUntilDeadline(dateString: string | Date | null | undefined): number {
  if (!dateString) return -1;

  try {
    const date = new Date(dateString);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const timeDiff = date.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  } catch (error) {
    console.error('Error calculating days until deadline:', error);
    return -1;
  }
}
