import React, { memo, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { motion } from 'motion/react';

// Memoized Service Card for service listings
interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  price: string;
  rating: number;
  provider: {
    name: string;
    avatar?: string;
  };
  category: string;
  onClick?: (id: string) => void;
}

export const ServiceCard = memo<ServiceCardProps>(({
  id,
  title,
  description,
  price,
  rating,
  provider,
  category,
  onClick
}) => {
  const handleClick = useCallback(() => {
    onClick?.(id);
  }, [onClick, id]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-300 glass border-white/10"
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base line-clamp-2 mb-1">{title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {description}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="ml-2 text-xs">
              {category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={provider.avatar} />
                <AvatarFallback className="text-xs">
                  {provider.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground truncate">
                {provider.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-yellow-400">
                <span className="text-xs">★</span>
                <span className="text-xs ml-1">{rating.toFixed(1)}</span>
              </div>
              <span className="font-semibold text-primary">{price}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Memoized Notification Item
interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'message' | 'service' | 'payment' | 'system';
  onMarkAsRead?: (id: string) => void;
  onClick?: (id: string) => void;
}

export const NotificationItem = memo<NotificationItemProps>(({
  id,
  title,
  message,
  timestamp,
  read,
  type,
  onMarkAsRead,
  onClick
}) => {
  const handleClick = useCallback(() => {
    if (!read) {
      onMarkAsRead?.(id);
    }
    onClick?.(id);
  }, [id, read, onMarkAsRead, onClick]);

  const getTypeColor = useCallback(() => {
    switch (type) {
      case 'message': return 'bg-blue-500';
      case 'service': return 'bg-green-500';
      case 'payment': return 'bg-yellow-500';
      case 'system': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  }, [type]);

  const formatTimestamp = useCallback((date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}d`;
  }, []);

  return (
    <div
      className={`p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
        !read ? 'bg-primary/5' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor()}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium truncate ${
              !read ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {title}
            </h4>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(timestamp)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {message}
          </p>
        </div>
        {!read && (
          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
        )}
      </div>
    </div>
  );
});

// Memoized Stats Card
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const StatsCard = memo<StatsCardProps>(({
  title,
  value,
  description,
  icon,
  trend,
  loading
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium animate-pulse bg-muted h-4 w-20 rounded" />
          <div className="animate-pulse bg-muted h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-muted h-8 w-16 rounded mb-2" />
          <div className="animate-pulse bg-muted h-3 w-24 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{value}</div>
        <div className="flex items-center space-x-2">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className={`flex items-center text-xs ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// Memoized Action Button with loading state
interface ActionButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
}

export const ActionButton = memo<ActionButtonProps>(({
  onClick,
  loading,
  disabled,
  variant,
  size,
  children,
  className
}) => {
  const handleClick = useCallback(() => {
    if (!loading && !disabled) {
      onClick();
    }
  }, [onClick, loading, disabled]);

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
          <span>Cargando...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
});

ServiceCard.displayName = 'ServiceCard';
NotificationItem.displayName = 'NotificationItem';  
StatsCard.displayName = 'StatsCard';
ActionButton.displayName = 'ActionButton';