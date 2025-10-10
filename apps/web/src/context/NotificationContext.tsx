import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { notificationsService, type Notification as APINotification } from "../lib/services/notifications.service";
import { useSecureAuth } from "./SecureAuthContext";

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

      setNotifications(notificationsData.notifications.map(convertNotification));
      setUnreadCount(unreadCountData);
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

    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    setPollingInterval(interval);

    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, user, refreshNotifications]);

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
