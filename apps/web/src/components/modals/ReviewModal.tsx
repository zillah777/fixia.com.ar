import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { feedbackService } from '@/lib/services/feedback.service';
import { useToast } from '@/lib/hooks/use-toast';
import { BaseModal } from './BaseModal';

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
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Dejar Reseña"
      subtitle={professionalName}
    >
      {step === 'rating' && (
        <motion.div
          key="rating"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
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
              className="glass border-white/20 focus:border-primary/50 min-h-24 resize-none text-sm bg-white/5"
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
          <div className="flex gap-3">
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
    </BaseModal>
  );
}
