import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { feedbackService } from '@/lib/services/feedback.service';
import { useToast } from '@/lib/hooks/use-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalName: string;
  jobId: string;
  professionalId: string;
  onSuccess?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  professionalName,
  jobId,
  professionalId,
  onSuccess,
}: ReviewModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'rating' | 'loading' | 'success'>('rating');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

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

      // Send feedback using the feedbackService
      // hasLike is true if rating >= 4 stars (good review)
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
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* ============================================
              BACKDROP - Glass morphism overlay
              ============================================ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-md z-modal-backdrop"
            aria-hidden="true"
          />

          {/* ============================================
              MODAL CONTAINER - Centered on desktop,
              full-screen on mobile
              ============================================ */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed z-modal-content flex flex-col inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:max-w-lg md:h-auto md:max-h-[92vh] md:overflow-hidden"
          >
            {/* ========================================
                MODAL PANEL - Fixia Glass Design
                ======================================== */}
            <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-slate-950/90 backdrop-blur-2xl border border-white/12 md:border-white/20 shadow-2xl">
              {/* ====================================
                  HEADER - Sticky with glass effect
                  ==================================== */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
                className="sticky top-0 z-10 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-900/40 border-b border-white/15 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-4 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate leading-tight">
                      Dejar Reseña
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {professionalName}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg transition-all hover:bg-white/20 hover:backdrop-blur-md active:bg-white/30 border border-white/10 hover:border-white/20"
                    aria-label="Cerrar modal"
                  >
                    <X className="h-4 w-4 text-slate-300 hover:text-white transition-colors" />
                  </button>
                </div>
              </motion.div>

              {/* ====================================
                  CONTENT - Scrollable area
                  ==================================== */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 space-y-2.5 sm:space-y-3 md:space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
                  <AnimatePresence mode="wait">
                    {step === 'rating' && (
                      <motion.div
                        key="rating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Header */}
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-4 shadow-lg">
                            <Star className="h-8 w-8 text-white" />
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-2">
                            Dejar Reseña
                          </h2>
                          <p className="text-white/80 text-sm sm:text-base">
                            ¿Cómo fue tu experiencia con {professionalName}?
                          </p>
                        </div>

                        {/* Star Rating */}
                        <div className="bg-white/5 border border-primary/20 rounded-xl p-6 space-y-4">
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
                                className="group relative transition-transform hover:scale-110"
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
                            <p className="text-center text-primary font-semibold text-sm">
                              {rating === 1 && 'Pobre'}
                              {rating === 2 && 'No muy bueno'}
                              {rating === 3 && 'Bueno'}
                              {rating === 4 && 'Muy bueno'}
                              {rating === 5 && 'Excelente'}
                            </p>
                          )}
                        </div>

                        {/* Comment Field */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">
                            Comentario (Opcional)
                          </label>
                          <Textarea
                            placeholder="Comparte detalles sobre tu experiencia con este profesional..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                            className="glass border-white/20 focus:border-primary/50 min-h-24 resize-none text-sm"
                          />
                          <p className="text-xs text-white/60 text-right">
                            {comment.length}/500
                          </p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                          <p className="text-xs text-white/80">
                            💡 Tu reseña ayuda a otros a tomar mejores decisiones y contribuye a mejorar la calidad de nuestro servicio.
                          </p>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3">
                          <Button
                            onClick={handleSubmit}
                            disabled={rating === 0}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="h-5 w-5 mr-2" />
                            Enviar Reseña
                          </Button>

                          <Button
                            onClick={handleClose}
                            variant="outline"
                            className="w-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                          >
                            Cancelar
                          </Button>
                        </div>
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
                  </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
