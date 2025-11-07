import { api } from '../api';

export interface Notification {
  id: string;
  user_id: string;
  type: 'match_created' | 'match_completed' | 'phone_revealed' | 'review_requested' | 'review_received';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
  unread_count: number;
}

export const notificationService = {
  /**
   * Get user notifications
   */
  async getUserNotifications(
    limit = 20,
    offset = 0,
  ): Promise<NotificationResponse> {
    return api.get(`/notifications?limit=${limit}&offset=${offset}`);
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ unread_count: number }> {
    return api.get('/notifications/unread');
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    return api.put(`/notifications/${notificationId}/read`, {});
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    return api.put('/notifications/mark-all-read', {});
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    return api.delete(`/notifications/${notificationId}`);
  },
};
