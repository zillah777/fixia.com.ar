'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { reviewService, MatchReview, ReviewStatus } from '@/lib/services/review.service';
import { useToast } from '@/lib/hooks/use-toast';

interface ReviewsSectionProps {
  matchId: string;
  currentUserId: string;
  reviewedUserName: string;
  reviewedUserId: string;
  isMatchCompleted: boolean;
}

export function ReviewsSection({
  matchId,
  currentUserId,
  reviewedUserName,
  reviewedUserId,
  isMatchCompleted,
}: ReviewsSectionProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<MatchReview[]>([]);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reviews and status
  useEffect(() => {
    loadReviews();
  }, [matchId]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [reviewsData, statusData] = await Promise.all([
        reviewService.getMatchReviews(matchId),
        reviewService.getReviewStatus(matchId),
      ]);

      setReviews(reviewsData);
      setReviewStatus(statusData);

      if (isMatchCompleted) {
        const canReviewResult = await reviewService.canLeaveReview(matchId);
        setCanReview(canReviewResult.can_review);
      }
    } catch (err) {
      setError('No se pudieron cargar las calificaciones');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    setIsSubmitting(false);
    toast({
      title: 'Éxito',
      description: 'Tu calificación ha sido enviada',
    });
    loadReviews();
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar tu calificación?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewService.deleteReview(reviewId);
      toast({
        title: 'Éxito',
        description: 'Calificación eliminada',
      });
      loadReviews();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar la calificación',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-glow border-primary/20">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-white/70">Cargando calificaciones...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-glow border-destructive/20">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
            <div>
              <p className="font-semibold text-destructive mb-2">Error</p>
              <p className="text-white/80 text-sm mb-4">{error}</p>
              <Button
                onClick={loadReviews}
                variant="outline"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Intentar de Nuevo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If match is not completed
  if (!isMatchCompleted) {
    return (
      <Card className="glass-glow border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-white/80 mb-2">
              Las calificaciones estarán disponibles después de que ambas partes confirmen la completación del servicio
            </p>
            <p className="text-sm text-white/60">
              Ambas partes deben confirmar que el trabajo está terminado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show form if review form is open
  if (showForm && canReview) {
    return (
      <ReviewForm
        matchId={matchId}
        reviewedUserName={reviewedUserName}
        onSuccess={handleReviewSuccess}
        onCancel={() => setShowForm(false)}
        isLoading={isSubmitting}
      />
    );
  }

  const currentUserReview = reviews.find((r) => r.reviewer_id === currentUserId);
  const otherUserReview = reviews.find((r) => r.reviewer_id !== currentUserId);

  return (
    <>
      <Card className="glass-glow border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Calificaciones</CardTitle>
            {canReview && !currentUserReview && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm"
                size="sm"
              >
                <Star className="h-3 w-3 mr-1" />
                Dejar Calificación
              </Button>
            )}
          </div>

          {/* Review Status Summary */}
          {reviewStatus && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded p-3">
                <p className="text-white/60 text-xs mb-1">Tu Calificación</p>
                <p className="font-semibold text-white">
                  {currentUserReview ? (
                    <span className="text-primary">✓ Completada</span>
                  ) : canReview ? (
                    <span className="text-white/70">Pendiente</span>
                  ) : (
                    <span className="text-white/50">No disponible</span>
                  )}
                </p>
              </div>
              <div className="bg-white/5 rounded p-3">
                <p className="text-white/60 text-xs mb-1">De {reviewedUserName}</p>
                <p className="font-semibold text-white">
                  {otherUserReview ? (
                    <span className="text-primary">✓ Completada</span>
                  ) : (
                    <span className="text-white/70">Pendiente</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70 mb-2">
                Todavía no hay calificaciones
              </p>
              <p className="text-sm text-white/60">
                Las calificaciones aparecerán aquí cuando se dejen
              </p>
            </div>
          ) : (
            <motion.div
              className="space-y-4"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              initial="hidden"
              animate="visible"
            >
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ReviewCard
                    review={review}
                    currentUserId={currentUserId}
                    onDelete={handleDeleteReview}
                    isLoading={isSubmitting}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Empty Hint */}
      {reviews.length === 0 && canReview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg"
        >
          <p className="text-sm text-white/80">
            Sé el primero en dejar una calificación.{' '}
            <button
              onClick={() => setShowForm(true)}
              className="text-primary font-semibold hover:underline"
            >
              Califica ahora
            </button>
          </p>
        </motion.div>
      )}
    </>
  );
}
