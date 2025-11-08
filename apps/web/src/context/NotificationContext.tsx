import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { notificationsService, type Notification as APINotification } from "../lib/services/notifications.service";
import { useSecureAuth } from "./SecureAuthContext";
import { useWebSocket, useWebSocketEvent } from "../hooks/useWebSocket";

interface Notification {
  id: string;
  type: 'message' | 'order' | 'payment' | 'review' | 'system' | 'promotion';
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
  const { user, isAuthenticated } = useSecureAuth();
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
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationsService.getNotifications({ limit: 50 }),
        notificationsService.getUnreadCount(),
      ]);

      const convertedNotifications = notificationsData.notifications.map(convertNotification);

      // Calculate actual unread count from notifications to prevent mismatch
      const actualUnreadCount = convertedNotifications.filter(n => !n.read).length;

      // Safety check: always use the actual count from the notifications array
      // This prevents phantom notifications where unreadCount > 0 but no notifications exist
      const finalUnreadCount = actualUnreadCount;

      // Debug logging for notification issues
      if (actualUnreadCount !== unreadCountData) {
        console.warn(`⚠️ Notification count mismatch for user ${user?.id}:`, {
          actualUnreadCount: actualUnreadCount,
          serverUnreadCount: unreadCountData,
          discrepancy: Math.abs(actualUnreadCount - unreadCountData)
        });
      }

      console.log(`📬 Notifications loaded for user ${user?.id}:`, {
        total: convertedNotifications.length,
        actualUnreadCount: actualUnreadCount,
        serverUnreadCount: unreadCountData,
        finalUnreadCount: finalUnreadCount,
        notifications: convertedNotifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          read: n.read,
          created_at: n.created_at
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
    setUnreadCount(prev => prev + 1);

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
    console.log('📊 Unread count updated:', data.count);
    setUnreadCount(data.count);
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
