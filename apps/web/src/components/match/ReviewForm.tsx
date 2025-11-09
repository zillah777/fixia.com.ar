'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { reviewService, CreateReviewPayload } from '@/lib/services/review.service';
import { useToast } from '@/lib/hooks/use-toast';

interface ReviewFormProps {
  matchId: string;
  reviewedUserName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  workSuccessful?: boolean;
  jobTitle?: string;
  agreedPrice?: number;
}

type RatingType = 'overall' | 'communication' | 'quality' | 'professionalism' | 'timeliness';

export function ReviewForm({
  matchId,
  reviewedUserName,
  onSuccess,
  onCancel,
  isLoading = false,
  workSuccessful = true,
  jobTitle,
  agreedPrice,
}: ReviewFormProps) {
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Record<RatingType, number>>({
    overall: 0,
    communication: 0,
    quality: 0,
    professionalism: 0,
    timeliness: 0,
  });
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState<Record<RatingType, number>>({
    overall: 0,
    communication: 0,
    quality: 0,
    professionalism: 0,
    timeliness: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const overallRating = ratings.overall;

  const handleStarClick = (ratingType: RatingType, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [ratingType]: prev[ratingType] === value ? 0 : value,
    }));
  };

  const handleSubmit = async () => {
    if (!ratings.overall) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide an overall rating',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateReviewPayload = {
        overall_rating: ratings.overall,
        ...(ratings.communication > 0 && { communication_rating: ratings.communication }),
        ...(ratings.quality > 0 && { quality_rating: ratings.quality }),
        ...(ratings.professionalism > 0 && { professionalism_rating: ratings.professionalism }),
        ...(ratings.timeliness > 0 && { timeliness_rating: ratings.timeliness }),
        ...(comment && { comment }),
      };

      await reviewService.createReview(matchId, payload);

      toast({
        title: 'Éxito',
        description: `Gracias por tu calificación a ${reviewedUserName}`,
      });

      onSuccess?.();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo enviar la calificación',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 5) return 'text-success';
    if (rating >= 4) return 'text-primary';
    if (rating >= 3) return 'text-warning';
    return 'text-destructive';
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return '';
    if (rating === 5) return 'Excelente';
    if (rating === 4) return 'Muy bueno';
    if (rating === 3) return 'Bueno';
    if (rating === 2) return 'Aceptable';
    return 'Requiere mejora';
  };

  const RatingSection = ({
    type,
    label,
    description,
  }: {
    type: RatingType;
    label: string;
    description: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">{label}</label>
        {ratings[type] > 0 && (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${getRatingColor(ratings[type])}`}>
              {getRatingLabel(ratings[type])}
            </span>
            <span className={`text-sm font-bold ${getRatingColor(ratings[type])}`}>
              {ratings[type]} / 5
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-white/60">{description}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(type, star)}
            onMouseEnter={() => setHoveredRating((prev) => ({ ...prev, [type]: star }))}
            onMouseLeave={() => setHoveredRating((prev) => ({ ...prev, [type]: 0 }))}
            className="group relative transition-transform hover:scale-110"
          >
            <Star
              className={`h-7 w-7 transition-all ${
                star <= (hoveredRating[type] || ratings[type])
                  ? `fill-primary text-primary scale-105`
                  : 'text-white/20'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-glow border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
                workSuccessful
                  ? 'bg-gradient-to-br from-success/40 to-success/20'
                  : 'bg-gradient-to-br from-warning/40 to-warning/20'
              }`}>
                {workSuccessful ? '✓' : '!'}
              </div>
              <div>
                <CardTitle className="text-lg">Evalúa tu Experiencia</CardTitle>
                <p className="text-xs text-white/60 mt-1">
                  {workSuccessful ? 'Gracias por completar este trabajo' : 'Tu retroalimentación es valiosa'}
                </p>
              </div>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Job Context */}
          {(jobTitle || agreedPrice) && (
            <div className="bg-white/5 border border-primary/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-2">Trabajo Completado</p>
              <div className="space-y-1">
                {jobTitle && (
                  <p className="text-sm text-white/90 font-medium truncate">📋 {jobTitle}</p>
                )}
                {agreedPrice && (
                  <p className="text-sm text-success font-semibold">💰 {agreedPrice}</p>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-white/70">
            Cuéntanos tu experiencia trabajando con <span className="font-semibold text-primary">{reviewedUserName}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overall Rating - Required */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <RatingSection
              type="overall"
              label="Calificación General *"
              description="¿Cómo fue tu experiencia general?"
            />
          </div>

          {/* Additional Ratings - Optional */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-white/60 font-semibold">
              Calificaciones Adicionales (Opcional)
            </p>

            <RatingSection
              type="communication"
              label="Comunicación"
              description="¿Qué tan responsive y comunicativo fue?"
            />

            <RatingSection
              type="quality"
              label="Calidad del Trabajo"
              description="¿Cuál fue la calidad del trabajo entregado?"
            />

            <RatingSection
              type="professionalism"
              label="Profesionalismo"
              description="¿Cuán profesional fue durante el proceso?"
            />

            <RatingSection
              type="timeliness"
              label="Puntualidad"
              description="¿Cumplió con los plazos acordados?"
            />
          </div>

          {/* Comment */}
          <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-4">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              💬 Comentario (Opcional)
              <span className="text-xs text-white/50">Máximo 1000 caracteres</span>
            </label>
            <Textarea
              placeholder="Comparte más detalles sobre tu experiencia con esta persona..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              className="glass border-white/20 focus:border-primary/50 min-h-28 resize-none text-sm bg-white/5"
            />
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Tu mensaje será visible en el perfil</span>
              <span className={comment.length > 900 ? 'text-warning font-semibold' : ''}>
                {comment.length} / 1000
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading || !ratings.overall}
                className={`flex-1 h-12 font-semibold flex items-center justify-center gap-2 transition-all ${
                  !ratings.overall
                    ? 'opacity-50'
                    : 'bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Enviar
                  </>
                )}
              </Button>

              {onCancel && (
                <Button
                  onClick={onCancel}
                  disabled={isSubmitting || isLoading}
                  variant="outline"
                  className="h-12 text-white/70 hover:text-white hover:bg-white/10 font-semibold"
                >
                  Cancelar
                </Button>
              )}
            </div>

            {/* Overall Rating Indicator */}
            {ratings.overall > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border text-sm text-center font-semibold ${
                  ratings.overall >= 4
                    ? 'bg-success/10 border-success/30 text-success'
                    : ratings.overall >= 3
                    ? 'bg-warning/10 border-warning/30 text-warning'
                    : 'bg-destructive/10 border-destructive/30 text-destructive'
                }`}
              >
                {ratings.overall >= 4
                  ? '✨ Excelente retroalimentación'
                  : ratings.overall >= 3
                  ? '👍 Retroalimentación constructiva'
                  : '⚠️ Asegúrate que sea justa y respetuosa'}
              </motion.div>
            )}
          </div>

          {/* Info Note */}
          <p className="text-xs text-white/60 text-center italic">
            Tu calificación es pública, verificada y ayuda a otros usuarios a tomar mejores decisiones
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
