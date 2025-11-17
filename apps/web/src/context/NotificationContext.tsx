import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { notificationsService, type Notification as APINotification } from "../lib/services/notifications.service";
import { useAuth } from "./SecureAuthContext"; // CORRECTED: Use the new, secure useAuth hook
import { useWebSocket, useWebSocketEvent } from "../hooks/useWebSocket";

interface Notification {
  id: string;
  type: 'message' | 'system' | 'proposal_received' | 'review_received' | 'job_started' | 'job_completed' | 'job_milestone' | 'payment_received' | 'new_project' | 'match_created' | 'match_completed' | 'phone_revealed' | 'review_requested';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  metadata?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // WebSocket integration for real-time notifications
  const { socket, isConnected } = useWebSocket({ enabled: isAuthenticated });

  // Convert API notification to local format
  const convertNotification = (apiNotif: APINotification): Notification => ({
    id: apiNotif.id,
    type: apiNotif.type,
    title: apiNotif.title,
    message: apiNotif.message,
    read: apiNotif.read,
    timestamp: new Date(apiNotif.created_at),
    actionUrl: apiNotif.action_url,
    metadata: apiNotif.metadata,
  });

  // Fetch notifications from API
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const notificationsData = await notificationsService.getNotifications({ limit: 50 });

      const convertedNotifications = notificationsData.notifications.map(convertNotification);

      // Calculate actual unread count from notifications array
      const actualUnreadCount = convertedNotifications.filter(n => !n.read).length;

      // Use unreadCount from server response (authoritative source for total unread count)
      const serverUnreadCount = notificationsData.unreadCount || 0;

      // CRITICAL FIX: Never show a badge count higher than visible unread notifications
      // If server says 2 unread but we only see 0, use 0 to prevent phantom badges
      // This is a safety net in case of server/database inconsistencies
      let finalUnreadCount = serverUnreadCount;

      // If we're loading ALL notifications (when limit > total notifications)
      // then actualUnreadCount should match serverUnreadCount
      // If actualUnreadCount is less, it means there are unread notifications beyond the limit
      // But if actualUnreadCount is 0 and serverUnreadCount > 0, it's a phantom badge - use 0
      if (actualUnreadCount === 0 && serverUnreadCount > 0 && convertedNotifications.length < 50) {
        // We've loaded all notifications and none are unread, but server says some are
        // This is definitely a phantom badge - override with 0
        finalUnreadCount = 0;
        console.error(`🚨 PHANTOM BADGE DETECTED: Server says ${serverUnreadCount} unread but none found in notifications for user ${user?.id}`);
      }

      // Debug logging for notification issues
      if (actualUnreadCount !== serverUnreadCount) {
        console.warn(`⚠️ Notification count discrepancy for user ${user?.id}:`, {
          actualUnreadInThisLoad: actualUnreadCount,
          serverTotalUnread: serverUnreadCount,
          finalUnreadCount: finalUnreadCount,
          loadedCount: convertedNotifications.length,
          note: 'Server count may be higher if total unread > 50 (limit)'
        });
      }

      console.log(`📬 Notifications loaded for user ${user?.id}:`, {
        total: convertedNotifications.length,
        actualUnreadInThisLoad: actualUnreadCount,
        serverTotalUnread: serverUnreadCount,
        finalUnreadCount: finalUnreadCount,
        notifications: convertedNotifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          read: n.read,
          timestamp: n.timestamp
        }))
      });

      setNotifications(convertedNotifications);
      setUnreadCount(finalUnreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't show error toast on initial load or polling failures
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initial load and polling setup
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Initial fetch
    refreshNotifications();

    // Set up polling with adaptive interval:
    // - 30 seconds when WebSocket disconnected (fallback)
    // - 2 minutes when WebSocket connected (for sync/verification)
    const pollingIntervalMs = isConnected ? 120000 : 30000;
    const interval = setInterval(() => {
      refreshNotifications();
    }, pollingIntervalMs);

    setPollingInterval(interval);

    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, user, refreshNotifications, isConnected]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      action: notification.actionUrl ? {
        label: "Ver",
        onClick: () => window.location.href = notification.actionUrl!
      } : undefined,
    });
  };

  const markAsRead = async (id: string) => {
    try {
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Update on server
      await notificationsService.markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      await refreshNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);

      // Update on server
      await notificationsService.markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Error al marcar notificaciones como leídas');
      // Revert on error
      await refreshNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id);

      // Optimistically update UI
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Delete on server
      await notificationsService.deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar notificación');
      // Revert on error
      await refreshNotifications();
    }
  };

  // WebSocket event listener for real-time notifications
  useWebSocketEvent(socket, 'notification:new', (data: { notification: APINotification; receivedAt: string }) => {
    console.log('✅ Real-time notification received via WebSocket:', data.notification.id);

    // Add the new notification to the list
    const convertedNotif = convertNotification(data.notification);
    setNotifications(prev => [convertedNotif, ...prev]);

    // CRITICAL: Only increment unread count if the notification is actually unread
    if (!data.notification.read) {
      setUnreadCount(prev => prev + 1);
    } else {
      console.warn('⚠️ WebSocket sent notification that is already marked as read:', data.notification.id);
    }

    // Update localStorage with sync time
    localStorage.setItem('fixia_last_notification_sync', new Date().toISOString());

    // Show toast
    toast(data.notification.title, {
      description: data.notification.message,
      action: data.notification.action_url ? {
        label: "Ver",
        onClick: () => window.location.href = data.notification.action_url!
      } : undefined,
    });
  });

  // WebSocket event listener for unread count updates
  useWebSocketEvent(socket, 'notification:unread-count', (data: { count: number; updatedAt: string }) => {
    console.log('📊 Unread count updated from WebSocket:', data.count);
    // CRITICAL: Validate against actual notifications before setting
    // Calculate actual unread count from current notifications array
    const actualUnread = notifications.filter(n => !n.read).length;

    // If the count from server is higher than what we see, it's potentially a phantom badge
    // Override with actual count from array
    const safeCount = Math.min(data.count, actualUnread);

    if (data.count !== safeCount) {
      console.error(`🚨 PHANTOM BADGE PREVENTED: WebSocket tried to set count to ${data.count} but actual unread is ${actualUnread}, using ${safeCount}`);
    }

    setUnreadCount(safeCount);
  });

  // WebSocket event listener for sync requests
  useWebSocketEvent(socket, 'notification:sync-response', () => {
    console.log('🔄 Server confirmed notification sync request');
    refreshNotifications();
  });

  const value = {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
