import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Clock,
  DollarSign,
  Calendar,
  MessageCircle,
  Paperclip,
  Star,
  CheckCircle,
  AlertCircle,
  Eye,
  XCircle,
  TrendingUp,
  User,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { cn } from '../ui/utils';
import type { Job } from '../../lib/services/jobs.service';

interface ActiveJobCardProps {
  job: Job;
  userRole: 'client' | 'professional';
  onViewDetails?: () => void;
  onSendMessage?: () => void;
  onMarkComplete?: () => void;
  onReview?: () => void;
}

const statusConfig = {
  not_started: {
    label: 'No Iniciado',
    color: 'bg-slate-500',
    gradient: 'from-slate-400 to-slate-600',
    textColor: 'text-slate-700',
    icon: Clock,
    description: 'Trabajo pendiente de inicio'
  },
  in_progress: {
    label: 'En Progreso',
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    textColor: 'text-blue-700',
    icon: TrendingUp,
    description: 'Trabajo activo'
  },
  milestone_review: {
    label: 'En Revisión',
    color: 'bg-amber-500',
    gradient: 'from-amber-400 to-amber-600',
    textColor: 'text-amber-700',
    icon: Eye,
    description: 'Esperando aprobación'
  },
  completed: {
    label: 'Completado',
    color: 'bg-emerald-500',
    gradient: 'from-emerald-400 to-emerald-600',
    textColor: 'text-emerald-700',
    icon: CheckCircle,
    description: 'Trabajo finalizado'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-500',
    gradient: 'from-red-400 to-red-600',
    textColor: 'text-red-700',
    icon: XCircle,
    description: 'Trabajo cancelado'
  },
  disputed: {
    label: 'En Disputa',
    color: 'bg-violet-500',
    gradient: 'from-violet-400 to-violet-600',
    textColor: 'text-violet-700',
    icon: AlertCircle,
    description: 'Requiere mediación'
  }
};

export const ActiveJobCard: React.FC<ActiveJobCardProps> = ({
  job,
  userRole,
  onViewDetails,
  onSendMessage,
  onMarkComplete,
  onReview
}) => {
  const status = statusConfig[job.status];
  const StatusIcon = status.icon;

  const otherParty = userRole === 'client' ? job.professional : job.client;
  const myInfo = userRole === 'client' ? job.client : job.professional;

  // Calculate days remaining
  const daysRemaining = job.delivery_date
    ? Math.ceil((new Date(job.delivery_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Count completed milestones
  const completedMilestones = job.milestones?.filter(m => m.completed).length || 0;
  const totalMilestones = job.milestones?.length || 0;

  // Check if can review (job completed and confirmed by both)
  const canReview = job.status === 'completed' &&
    job.completion_requested_at &&
    job.completion_confirmed_at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={cn(
        "glass border-white/10 overflow-hidden relative",
        job.status === 'cancelled' && "opacity-70 saturate-50"
      )}>
        {/* Status Banner */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          status.gradient
        )} />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            {/* Status Badge */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge
                className={cn(
                  "gap-1 text-white",
                  status.color,
                  job.status === 'in_progress' && "animate-pulse"
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </motion.div>

            {/* Price & Time */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold text-foreground">
                  ${job.agreed_price.toLocaleString()} {job.currency}
                </span>
              </div>
              {daysRemaining !== null && (
                <div className={cn(
                  "flex items-center gap-1",
                  daysRemaining < 0 ? "text-red-500" : "text-muted-foreground"
                )}>
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">
                    {daysRemaining < 0
                      ? `${Math.abs(daysRemaining)} días atrasado`
                      : daysRemaining === 0
                        ? 'Hoy'
                        : `${daysRemaining} días`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Parties Info */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* My Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={myInfo.avatar} alt={myInfo.name} />
                <AvatarFallback className="text-xs bg-primary/10">
                  {myInfo.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{myInfo.name}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {userRole === 'client' ? 'Cliente' : 'Pro'}
                  </Badge>
                  <div className="flex items-center gap-0.5 text-xs text-warning">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{myInfo.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Party Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={otherParty.avatar} alt={otherParty.name} />
                <AvatarFallback className="text-xs bg-primary/10">
                  {otherParty.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{otherParty.name}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {userRole === 'client' ? 'Pro' : 'Cliente'}
                  </Badge>
                  <div className="flex items-center gap-0.5 text-xs text-warning">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{otherParty.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Job Title */}
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>
          </div>

          {/* Progress Section */}
          {job.status !== 'cancelled' && job.status !== 'not_started' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-semibold">{job.progress_percentage}%</span>
              </div>
              <Progress value={job.progress_percentage} className="h-2" />

              {/* Milestones Summary */}
              {totalMilestones > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3" />
                  <span>
                    {completedMilestones} de {totalMilestones} milestones completados
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Milestones Preview */}
          {totalMilestones > 0 && (
            <div className="space-y-1.5">
              {job.milestones.slice(0, 3).map((milestone, index) => (
                <div
                  key={milestone.id}
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded-md transition-colors",
                    milestone.completed
                      ? "bg-emerald-500/10 text-emerald-700"
                      : index === 0
                        ? "bg-blue-500/10 text-blue-700"
                        : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {milestone.completed ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  ) : index === 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  <span className="flex-1 truncate">{milestone.title}</span>
                  {milestone.completed && (
                    <span className="text-emerald-600 font-medium">Completado</span>
                  )}
                  {!milestone.completed && index === 0 && (
                    <span className="text-blue-600 font-medium">En progreso</span>
                  )}
                </div>
              ))}
              {totalMilestones > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{totalMilestones - 3} milestone{totalMilestones - 3 > 1 ? 's' : ''} más
                </p>
              )}
            </div>
          )}

          {/* Activity Indicators */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {job.unread_messages_count && job.unread_messages_count > 0 && (
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                <span>{job.unread_messages_count} mensaje{job.unread_messages_count > 1 ? 's' : ''} nuevo{job.unread_messages_count > 1 ? 's' : ''}</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
            )}
            {job.attachments_count && job.attachments_count > 0 && (
              <div className="flex items-center gap-1.5">
                <Paperclip className="h-4 w-4" />
                <span>{job.attachments_count} archivo{job.attachments_count > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-white/5"
              onClick={onViewDetails}
            >
              <Briefcase className="h-4 w-4 mr-1.5" />
              Ver Detalles
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-white/5"
              onClick={onSendMessage}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Mensaje
            </Button>

            {/* Dynamic CTA based on status and role */}
            {job.status === 'in_progress' && onMarkComplete && (
              <Button
                size="sm"
                className="flex-1 liquid-gradient text-white"
                onClick={onMarkComplete}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Completar
              </Button>
            )}

            {canReview && onReview && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                onClick={onReview}
              >
                <Star className="h-4 w-4 mr-1.5 fill-current" />
                Calificar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
