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
}

type RatingType = 'overall' | 'communication' | 'quality' | 'professionalism' | 'timeliness';

export function ReviewForm({
  matchId,
  reviewedUserName,
  onSuccess,
  onCancel,
  isLoading = false,
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

  const RatingSection = ({
    type,
    label,
    description,
  }: {
    type: RatingType;
    label: string;
    description: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">{label}</label>
        {ratings[type] > 0 && (
          <span className="text-xs text-primary font-semibold">{ratings[type]} / 5</span>
        )}
      </div>
      <p className="text-xs text-white/60 mb-3">{description}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(type, star)}
            onMouseEnter={() => setHoveredRating((prev) => ({ ...prev, [type]: star }))}
            onMouseLeave={() => setHoveredRating((prev) => ({ ...prev, [type]: 0 }))}
            className="group relative"
          >
            <Star
              className={`h-6 w-6 transition-all ${
                star <= (hoveredRating[type] || ratings[type])
                  ? 'fill-primary text-primary'
                  : 'text-white/30'
              } group-hover:scale-110`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-glow border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Dejar Calificación</CardTitle>
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
          <p className="text-sm text-white/70 mt-2">
            Cuéntanos tu experiencia trabajando con {reviewedUserName}
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Comentario (Opcional)
            </label>
            <Textarea
              placeholder="Comparte más detalles sobre tu experiencia..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              className="glass border-white/20 focus:border-primary/50 min-h-24 resize-none text-sm"
            />
            <p className="text-xs text-white/60 text-right">
              {comment.length} / 1000
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading || !ratings.overall}
              className="flex-1 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Calificación
            </Button>

            {onCancel && (
              <Button
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
                variant="outline"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            )}
          </div>

          {/* Info Note */}
          <p className="text-xs text-white/60 text-center">
            Tu calificación es verificada y ayuda a otros usuarios a tomar mejores decisiones
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
