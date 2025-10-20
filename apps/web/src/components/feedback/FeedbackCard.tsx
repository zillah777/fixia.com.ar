import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Feedback } from '../../lib/services/feedback.service';

interface FeedbackCardProps {
  feedback: Feedback;
  currentUserId: string;
  onEdit?: (feedback: Feedback) => void;
  onDelete?: (feedbackId: string) => void;
  variant?: 'received' | 'given';
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  currentUserId,
  onEdit,
  onDelete,
  variant = 'received',
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const displayUser = variant === 'received' ? feedback.fromUser : feedback.toUser;
  const canEdit = feedback.fromUser.id === currentUserId;

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(feedback.id);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass border-white/10 hover:border-white/20 transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
                <AvatarFallback className="glass">
                  {displayUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{displayUser.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {displayUser.userType === 'professional' ? 'Profesional' : 'Cliente'}
                  </Badge>
                  {feedback.hasLike && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Like
                    </Badge>
                  )}
                </div>

                {feedback.comment && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="leading-relaxed">{feedback.comment}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {format(new Date(feedback.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>

            {canEdit && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass border-white/20">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(feedback)}
                      className="hover:bg-white/10 cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="hover:bg-white/10 cursor-pointer text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
