import React, { useState } from 'react';
import { ThumbsUp, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { feedbackService, CreateFeedbackRequest, Feedback } from '../../lib/services/feedback.service';
import { toast } from 'sonner';
import { extractErrorMessage } from '../../utils/errorHandler';

interface FeedbackCardProps {
  isOpen?: boolean;
  onClose?: () => void;
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

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  isOpen = true,
  onClose,
  toUser,
  jobId,
  serviceId,
  onSuccess,
}) => {
  const [comment, setComment] = useState('');
  const [hasLike, setHasLike] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
      setSubmitSuccess(true);
      onSuccess?.(feedback);

      setTimeout(() => {
        handleClose();
      }, 2000);
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
    setSubmitSuccess(false);
    onClose?.();
  };

  if (!isOpen) return null;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-white/8 via-white/6 to-white/4 backdrop-blur-md border border-white/15 hover:border-white/25 hover:bg-white/12 transition-all rounded-xl shadow-lg overflow-hidden">
        {/* Header - Always Visible */}
        <CardContent className="p-3 sm:p-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-11 w-11 sm:h-12 sm:w-12 ring-2 ring-primary/40 flex-shrink-0">
                  <AvatarImage src={toUser.avatar} alt={toUser.name} />
                  <AvatarFallback className="bg-primary/20 font-semibold">
                    {toUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                    Dar Feedback
                  </h3>
                  <p className="text-xs text-white/60 truncate">
                    A: <span className="text-primary font-medium">{toUser.name}</span>
                  </p>
                </div>
              </div>

              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </motion.div>
            </div>
          </button>
        </CardContent>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden border-t border-white/15"
            >
              <div className="p-3 sm:p-4 space-y-4 bg-gradient-to-b from-white/2 to-transparent">
                {!submitSuccess ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Info Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20"
                    >
                      <Avatar className="h-14 w-14 ring-2 ring-primary/40 shadow-lg flex-shrink-0">
                        <AvatarImage src={toUser.avatar} alt={toUser.name} />
                        <AvatarFallback className="bg-primary/20 font-semibold">
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

                    {/* Recommendation Toggle */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                            hasLike
                              ? 'bg-gradient-to-br from-primary to-primary/60 text-white shadow-lg'
                              : 'bg-white/10 text-white/50'
                          }`}
                        >
                          <ThumbsUp className="h-5 w-5" />
                        </div>
                        <div>
                          <Label htmlFor="hasLike" className="text-sm font-semibold text-white cursor-pointer">
                            Recomendar usuario
                          </Label>
                          <p className="text-xs text-white/60">Suma +1 a su confiabilidad</p>
                        </div>
                      </div>
                      <Switch id="hasLike" checked={hasLike} onCheckedChange={setHasLike} />
                    </motion.div>

                    {/* Comment Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="comment" className="text-white">
                        Comentario (Opcional)
                      </Label>
                      <Textarea
                        id="comment"
                        placeholder="Comparte tu experiencia trabajando con este usuario..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={1000}
                        rows={4}
                        className="glass border-white/20 resize-none bg-white/5"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {comment.length} / 1000
                      </p>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-3 pt-2 border-t border-white/10"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1 border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || (!comment.trim() && !hasLike)}
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-6 py-8"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-success/60 shadow-lg">
                      <ThumbsUp className="h-10 w-10 text-white fill-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">¡Gracias!</h3>
                      <p className="text-white/80 text-sm">
                        Tu feedback ha sido enviado exitosamente a {toUser.name}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
