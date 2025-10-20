import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { feedbackService, CreateFeedbackRequest, Feedback } from '../../lib/services/feedback.service';
import { toast } from 'sonner';

interface GiveFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  toUser: {
    id: string;
    name: string;
    avatar?: string;
    userType: 'client' | 'professional';
  };
  jobId?: string;
  serviceId?: string;
  onSuccess?: (feedback: Feedback) => void;
}

export const GiveFeedbackModal: React.FC<GiveFeedbackModalProps> = ({
  isOpen,
  onClose,
  toUser,
  jobId,
  serviceId,
  onSuccess,
}) => {
  const [comment, setComment] = useState('');
  const [hasLike, setHasLike] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim() && !hasLike) {
      toast.error('Debes agregar un comentario o un like');
      return;
    }

    setIsSubmitting(true);

    try {
      const data: CreateFeedbackRequest = {
        toUserId: toUser.id,
        comment: comment.trim() || undefined,
        hasLike,
        jobId,
        serviceId,
      };

      const feedback = await feedbackService.giveFeedback(data);

      toast.success('Feedback enviado exitosamente');
      onSuccess?.(feedback);
      handleClose();
    } catch (error: any) {
      console.error('Error giving feedback:', error);
      toast.error(error.response?.data?.message || 'Error al enviar feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComment('');
    setHasLike(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass border-white/20 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Dar Feedback
          </DialogTitle>
          <DialogDescription>
            Comparte tu experiencia con {toUser.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg glass-medium">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={toUser.avatar} alt={toUser.name} />
              <AvatarFallback className="glass">
                {toUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{toUser.name}</p>
              <p className="text-sm text-muted-foreground">
                {toUser.userType === 'professional' ? 'Profesional' : 'Cliente'}
              </p>
            </div>
          </div>

          {/* Like Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg glass-medium">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                  hasLike ? 'bg-blue-500/20 text-blue-400' : 'bg-muted'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
              </div>
              <div>
                <Label htmlFor="hasLike" className="text-sm font-semibold cursor-pointer">
                  Recomendar usuario
                </Label>
                <p className="text-xs text-muted-foreground">
                  Suma +1 a su confiabilidad
                </p>
              </div>
            </div>
            <Switch id="hasLike" checked={hasLike} onCheckedChange={setHasLike} />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Comentario (Opcional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Comparte tu experiencia trabajando con este usuario..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              className="glass border-white/20 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length} / 1000
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="liquid-gradient"
              disabled={isSubmitting || (!comment.trim() && !hasLike)}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
