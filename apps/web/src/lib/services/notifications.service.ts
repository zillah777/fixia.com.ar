import { api } from '../api';

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'order' | 'payment' | 'review' | 'system' | 'promotion';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata?: any;
  created_at: string;
  read_at?: string;
}

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  recentCount: number;
}

class NotificationsService {
  /**
   * Get user notifications with optional filters
   */
  async getNotifications(filters?: NotificationFilters): Promise<NotificationsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.read !== undefined) params.append('read', String(filters.read));
      if (filters?.type) params.append('type', filters.type);
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.offset) params.append('offset', String(filters.offset));

      const response = await api.get<NotificationsResponse>(`/notifications?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{ unreadCount: number }>('/notifications/unread-count');
      return response.data.unreadCount;
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    try {
      const response = await api.get<NotificationStats>('/notifications/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await api.put<{ notification: Notification }>(
        `/notifications/${notificationId}/read`
      );
      return response.data.notification;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ count: number }> {
    try {
      const response = await api.put<{ count: number }>('/notifications/mark-all-read');
      return response.data;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<{ count: number }> {
    try {
      const response = await api.delete<{ count: number }>('/notifications');
      return response.data;
    } catch (error: any) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  /**
   * Poll for new notifications (for fallback when SSE is not available)
   */
  startPolling(callback: (notifications: Notification[]) => void, interval: number = 30000): NodeJS.Timeout {
    const pollInterval = setInterval(async () => {
      try {
        const response = await this.getNotifications({ limit: 10 });
        callback(response.notifications);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);

    // Initial fetch
    this.getNotifications({ limit: 10 }).then(response => {
      callback(response.notifications);
    });

    return pollInterval;
  }

  /**
   * Stop polling for notifications
   */
  stopPolling(interval: NodeJS.Timeout): void {
    clearInterval(interval);
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
