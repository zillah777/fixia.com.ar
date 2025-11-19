import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  MessageCircle,
  Paperclip,
  User,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';

export interface TimelineEvent {
  id: string;
  type: 'status_change' | 'milestone' | 'message' | 'payment' | 'review';
  title: string;
  description?: string;
  timestamp: string;
  actor: {
    name: string;
    avatar?: string;
    role: 'client' | 'professional';
  };
  metadata?: {
    status?: string;
    amount?: number;
    rating?: number;
    attachments?: number;
  };
}

interface JobProgressTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const eventConfig = {
  status_change: {
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  milestone: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  message: {
    icon: MessageCircle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  payment: {
    icon: AlertCircle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  review: {
    icon: User,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20'
  }
};

export const JobProgressTimeline: React.FC<JobProgressTimelineProps> = ({
  events,
  className
}) => {
  return (
    <Card className={cn('glass border-white/10', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Calendar className="h-5 w-5 text-primary" />
          Timeline del Proyecto
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

          {/* Events */}
          <div className="space-y-6">
            {events.map((event, index) => {
              const config = eventConfig[event.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative pl-14"
                >
                  {/* Icon Circle */}
                  <div
                    className={cn(
                      'absolute left-0 top-0 h-12 w-12 rounded-full flex items-center justify-center border-2',
                      config.bgColor,
                      config.borderColor
                    )}
                  >
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </div>

                  {/* Event Content */}
                  <div className={cn(
                    'glass-medium rounded-lg p-4 border',
                    config.borderColor,
                    'hover:glass transition-all duration-200'
                  )}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>

                    {/* Actor Info */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={event.actor.avatar} alt={event.actor.name} />
                        <AvatarFallback className="text-xs">
                          {event.actor.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm text-white truncate">{event.actor.name}</span>
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0 flex-shrink-0"
                        >
                          {event.actor.role === 'client' ? 'Cliente' : 'Pro'}
                        </Badge>
                      </div>

                      {/* Metadata */}
                      {event.metadata && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {event.metadata.attachments !== undefined && (
                            <div className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              <span>{event.metadata.attachments}</span>
                            </div>
                          )}
                          {event.metadata.rating !== undefined && (
                            <div className="flex items-center gap-1 text-warning">
                              <span>★</span>
                              <span>{event.metadata.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-12">
            <div className="h-16 w-16 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-4 opacity-50">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Sin actividad aún</h3>
            <p className="text-muted-foreground/80 text-sm">
              El timeline del proyecto aparecerá aquí cuando haya actualizaciones
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to format timestamps
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Ahora';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  if (diffInDays < 7) return `Hace ${diffInDays}d`;

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
