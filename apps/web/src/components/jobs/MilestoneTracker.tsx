import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  DollarSign,
  Paperclip,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { cn } from '../ui/utils';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  amount?: number;
  attachments?: number;
  order: number;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  userRole: 'client' | 'professional';
  onMarkComplete?: (milestoneId: string) => void;
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (milestoneId: string) => void;
  onAdd?: () => void;
  className?: string;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  milestones,
  userRole,
  onMarkComplete,
  onEdit,
  onDelete,
  onAdd,
  className
}) => {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  const completedCount = milestones.filter(m => m.completed).length;
  const totalCount = milestones.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleExpand = (milestoneId: string) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  };

  return (
    <Card className={cn('glass border-white/10', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-primary" />
            Milestones del Proyecto
          </CardTitle>

          {userRole === 'professional' && onAdd && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAdd}
              className="glass border-white/20 hover:glass-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          )}
        </div>

        {/* Overall Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso General</span>
            <span className="font-semibold text-white">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {completedCount} de {totalCount} milestone{totalCount !== 1 ? 's' : ''} completado{completedCount !== 1 ? 's' : ''}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {milestones.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="h-16 w-16 liquid-gradient rounded-xl flex items-center justify-center mx-auto mb-4 opacity-50">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Sin Milestones</h3>
            <p className="text-muted-foreground/80 text-sm mb-4">
              {userRole === 'professional'
                ? 'Agrega milestones para estructurar el proyecto'
                : 'El profesional agregará milestones al proyecto'
              }
            </p>
            {userRole === 'professional' && onAdd && (
              <Button
                onClick={onAdd}
                variant="outline"
                className="glass border-white/20 hover:glass-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Milestone
              </Button>
            )}
          </div>
        ) : (
          // Milestones List
          <div className="space-y-3">
            {milestones
              .sort((a, b) => a.order - b.order)
              .map((milestone, index) => {
                const isExpanded = expandedMilestones.has(milestone.id);
                const isOverdue = milestone.due_date &&
                  new Date(milestone.due_date) < new Date() &&
                  !milestone.completed;

                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={cn(
                      'rounded-lg border transition-all duration-200',
                      milestone.completed
                        ? 'glass-medium border-emerald-500/20 bg-emerald-500/5'
                        : index === completedCount && !milestone.completed
                          ? 'glass border-blue-500/30 bg-blue-500/5'
                          : 'glass-medium border-white/10'
                    )}
                  >
                    {/* Milestone Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => toggleExpand(milestone.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox/Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {milestone.completed ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : index === completedCount ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <TrendingUp className="h-5 w-5 text-blue-500" />
                            </motion.div>
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className={cn(
                                'font-semibold text-sm truncate',
                                milestone.completed
                                  ? 'text-emerald-500 line-through'
                                  : 'text-white'
                              )}>
                                {milestone.title}
                              </h4>

                              {/* Quick Info */}
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {milestone.completed && (
                                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/40 text-xs px-1.5 py-0">
                                    Completado
                                  </Badge>
                                )}
                                {!milestone.completed && index === completedCount && (
                                  <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/40 text-xs px-1.5 py-0 animate-pulse">
                                    En progreso
                                  </Badge>
                                )}
                                {isOverdue && (
                                  <Badge className="bg-red-500/20 text-red-500 border-red-500/40 text-xs px-1.5 py-0">
                                    Atrasado
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Expand Icon */}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 border-t border-white/10 space-y-3">
                            {/* Description */}
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground">
                                {milestone.description}
                              </p>
                            )}

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-2">
                              {milestone.due_date && (
                                <div className="flex items-center gap-2 text-xs">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className={isOverdue ? 'text-red-500' : 'text-muted-foreground'}>
                                    {new Date(milestone.due_date).toLocaleDateString('es-AR')}
                                  </span>
                                </div>
                              )}
                              {milestone.amount !== undefined && (
                                <div className="flex items-center gap-2 text-xs">
                                  <DollarSign className="h-3.5 w-3.5 text-success" />
                                  <span className="text-success font-semibold">
                                    ${milestone.amount.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {milestone.attachments !== undefined && milestone.attachments > 0 && (
                                <div className="flex items-center gap-2 text-xs">
                                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {milestone.attachments} archivo{milestone.attachments > 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            {!milestone.completed && (
                              <div className="flex gap-2 pt-2">
                                {userRole === 'professional' && onMarkComplete && (
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMarkComplete(milestone.id);
                                    }}
                                    className="liquid-gradient text-white flex-1"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                    Marcar Completado
                                  </Button>
                                )}
                                {userRole === 'professional' && onEdit && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEdit(milestone);
                                    }}
                                    className="glass border-white/20"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {userRole === 'professional' && onDelete && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDelete(milestone.id);
                                    }}
                                    className="glass border-red-500/20 text-red-500 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
