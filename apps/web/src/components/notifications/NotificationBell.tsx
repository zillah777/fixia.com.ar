import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { useNotifications } from '../../context/NotificationContext';
import { useSecureAuth } from '../../context/SecureAuthContext';
import { getNotificationUrl, type NotificationType, type UserType } from '../../lib/utils/notificationRouting';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'message' | 'service' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  avatar?: string;
}

interface NotificationBellProps {
  className?: string;
}

const notificationTypeConfig: Record<string, { color: string; icon: string }> = {
  order: { color: 'bg-blue-500', icon: '🔨' },
  payment: { color: 'bg-emerald-500', icon: '💰' },
  payment_received: { color: 'bg-emerald-500', icon: '💰' },
  review: { color: 'bg-warning', icon: '⭐' },
  message: { color: 'bg-pink-500', icon: '💬' },
  promotion: { color: 'bg-orange-500', icon: '📋' },
  system: { color: 'bg-gray-500', icon: '🔔' },
  proposal_received: { color: 'bg-purple-500', icon: '📋' },
  proposal_accepted: { color: 'bg-green-500', icon: '✅' },
  job_started: { color: 'bg-blue-500', icon: '🚀' },
  job_completed: { color: 'bg-emerald-500', icon: '🎉' },
  job_milestone: { color: 'bg-yellow-500', icon: '⭐' },
  review_received: { color: 'bg-orange-500', icon: '⭐' },
  review_requested: { color: 'bg-yellow-500', icon: '✍️' },
  new_project: { color: 'bg-blue-500', icon: '📁' },
  match_created: { color: 'bg-purple-500', icon: '🤝' },
  match_completed: { color: 'bg-green-500', icon: '✅' },
  phone_revealed: { color: 'bg-cyan-500', icon: '📞' }
};

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { user } = useSecureAuth();
  const navigate = useNavigate();

  // Calculate actual unread count from notifications to prevent phantom badges
  const actualUnreadCount = notifications.filter(n => !n.read).length;


  // Handle notification click
  const handleNotificationClick = (notification: Notification): void => {
    try {
      if (!notification.read) {
        markAsRead(notification.id);
      }

      // Close the notification panel
      setIsOpen(false);

      // Get the appropriate redirect URL based on notification type and user role
      let redirectUrl: string;

      if (notification.actionUrl) {
        // Prefer existing actionUrl if available
        redirectUrl = notification.actionUrl;
      } else {
        // Use smart routing based on notification type and user role
        const userType = (user?.userType || 'professional') as UserType;
        // For basic notification types, use simple routing
        const typeMap: Record<string, NotificationType> = {
          'message': 'message',
          'service': 'new_project', // Map service to new_project
          'payment': 'payment_received',
          'system': 'system'
        };
        const mappedType = typeMap[notification.type] || 'system';
        redirectUrl = getNotificationUrl(mappedType, userType);
      }

      // Use React Router navigate instead of window.location.href
      navigate(redirectUrl);
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast.error('Error al abrir la notificación');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  // Handle delete notification
  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
    toast.success('Notificación eliminada');
  };

  // Format relative time
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 w-9 p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {actualUnreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {actualUnreadCount > 99 ? '99+' : actualUnreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/20" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 z-50 mt-2 w-96"
            >
              <Card className="shadow-xl border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Notificaciones</CardTitle>
                    <div className="flex items-center gap-2">
                      {actualUnreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          className="text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Marcar todas
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {actualUnreadCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {actualUnreadCount} notificación{actualUnreadCount !== 1 ? 'es' : ''} sin leer
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No hay notificaciones</p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {notifications.map((notification, index) => {
                          const config = notificationTypeConfig[notification.type] || { color: 'bg-gray-500', icon: '🔔' };
                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <div
                                className={cn(
                                  "flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer border-l-4 transition-colors",
                                  !notification.read && "bg-primary/10 border-l-primary",
                                  notification.read && "border-l-transparent"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className={cn(
                                  "h-8 w-8 rounded-full flex items-center justify-center text-white text-sm",
                                  config.color
                                )}>
                                  {config.icon}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className={cn(
                                      "text-sm truncate",
                                      !notification.read && "font-semibold"
                                    )}>
                                      {notification.title}
                                    </h4>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                      {formatTime(notification.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              {index < notifications.length - 1 && <Separator />}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  
                  <Separator />
                  <div className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/notifications');
                      }}
                    >
                      Ver todas las notificaciones
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}