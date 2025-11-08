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
import { extractErrorMessage } from '../../utils/errorHandler';

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
    } catch (error: unknown) {
      console.error('Error giving feedback:', error);
      const errorMessage = extractErrorMessage(error, 'Error al enviar feedback');
      toast.error(errorMessage);
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
      <DialogContent className="bg-slate-900/95 border-white/30 max-w-[95%] sm:max-w-[500px] shadow-2xl backdrop-blur-xl">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-primary/20">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            Dar Feedback
          </DialogTitle>
          <DialogDescription className="text-slate-300 mt-2">
            Comparte tu experiencia con <span className="font-semibold text-white">{toUser.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20"
          >
            <Avatar className="h-14 w-14 ring-2 ring-primary/40 shadow-lg">
              <AvatarImage src={toUser.avatar} alt={toUser.name} />
              <AvatarFallback className="glass font-semibold">
                {toUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white">{toUser.name}</p>
              <p className="text-sm text-white/70">
                {toUser.userType === 'professional' ? '👨‍💼 Profesional' : '👤 Cliente'}
              </p>
            </div>
          </motion.div>

          {/* Like Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                  hasLike ? 'bg-gradient-to-br from-primary to-primary/60 text-white shadow-lg' : 'bg-white/10 text-white/50'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
              </div>
              <div>
                <Label htmlFor="hasLike" className="text-sm font-semibold text-white cursor-pointer">
                  Recomendar usuario
                </Label>
                <p className="text-xs text-white/60">
                  Suma +1 a su confiabilidad
                </p>
              </div>
            </div>
            <Switch id="hasLike" checked={hasLike} onCheckedChange={setHasLike} />
          </motion.div>

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

          <DialogFooter className="border-t border-white/10 pt-6 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg transition-all disabled:opacity-50"
                disabled={isSubmitting || (!comment.trim() && !hasLike)}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Enviar Feedback
                  </>
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
