import { useState } from 'react';
import { Star, Send, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { feedbackService } from '@/lib/services/feedback.service';
import { useToast } from '@/lib/hooks/use-toast';

interface ReviewCardProps {
  isOpen?: boolean;
  onClose?: () => void;
  professionalName: string;
  jobId: string;
  professionalId: string;
  onSuccess?: () => void;
}

export function ReviewCard({
  isOpen = true,
  onClose,
  professionalName,
  jobId,
  professionalId,
  onSuccess,
}: ReviewCardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'rating' | 'loading' | 'success'>('rating');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor, proporciona una calificación',
      });
      return;
    }

    try {
      setStep('loading');

      await feedbackService.giveFeedback({
        toUserId: professionalId,
        comment: comment || undefined,
        hasLike: rating >= 4,
        jobId: jobId,
      });

      setStep('success');
      onSuccess?.();
      toast({
        title: 'Éxito',
        description: `Gracias por tu reseña a ${professionalName}`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo enviar la reseña',
      });
      setStep('rating');
    }
  };

  const handleClose = () => {
    setStep('rating');
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose?.();
  };

  if (!isOpen) return null;

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1:
        return 'Pobre';
      case 2:
        return 'No muy bueno';
      case 3:
        return 'Bueno';
      case 4:
        return 'Muy bueno';
      case 5:
        return 'Excelente';
      default:
        return '';
    }
  };

  const getRatingColor = (r: number) => {
    if (r <= 2) return 'from-destructive/25 to-destructive/10';
    if (r === 3) return 'from-warning/25 to-warning/10';
    return 'from-success/25 to-success/10';
  };

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
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                  Dejar Reseña
                </h3>
                <p className="text-xs text-white/60 truncate">
                  Para: <span className="text-primary font-medium">{professionalName}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {rating > 0 && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                )}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </motion.div>
              </div>
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
                {step === 'rating' && (
                  <motion.div
                    key="rating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Star Rating */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className={`bg-gradient-to-r ${getRatingColor(hoveredRating || rating)} border border-white/20 rounded-xl p-4 space-y-4`}
                    >
                      <p className="text-sm text-white/80 text-center mb-4">
                        Selecciona una calificación *
                      </p>
                      <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="group relative transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg p-1"
                          >
                            <Star
                              className={`h-10 w-10 sm:h-12 sm:w-12 transition-all ${
                                star <= (hoveredRating || rating)
                                  ? 'fill-primary text-primary'
                                  : 'text-white/30'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center pt-2"
                        >
                          <p className="text-center text-primary font-semibold text-sm">
                            {getRatingLabel(rating)}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Comment Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium text-white">
                        Comentario (Opcional)
                      </label>
                      <Textarea
                        placeholder="Comparte detalles sobre tu experiencia con este profesional..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                        className="glass border-white/20 focus:border-primary/50 min-h-24 resize-none text-sm bg-white/5"
                      />
                      <p className="text-xs text-white/60 text-right">
                        {comment.length}/500
                      </p>
                    </motion.div>

                    {/* Info Box */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-success/10 border border-success/20 rounded-xl p-4"
                    >
                      <p className="text-xs text-white/80">
                        💡 Tu reseña ayuda a otros a tomar mejores decisiones y contribuye a mejorar la calidad de nuestro servicio.
                      </p>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-3"
                    >
                      <Button
                        onClick={handleClose}
                        variant="outline"
                        className="flex-1 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="flex-1 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        Enviar Reseña
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {step === 'loading' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-12"
                  >
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-white/70 text-sm">Enviando reseña...</p>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-6 py-8"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-success/60 shadow-lg">
                      <Star className="h-10 w-10 text-white fill-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">¡Gracias!</h3>
                      <p className="text-white/80 text-sm">
                        Tu reseña ha sido enviada exitosamente a {professionalName}
                      </p>
                    </div>

                    <Button
                      onClick={handleClose}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Cerrar
                    </Button>
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
