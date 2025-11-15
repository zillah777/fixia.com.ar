'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, BarChart3, Users, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { reviewService, ReviewStats, MatchReview } from '@/lib/services/review.service';
import { Button } from '../ui/button';

interface UserReviewStatsProps {
  userId: string;
  userName?: string;
  showReviews?: boolean;
}

export function UserReviewStats({ userId, userName, showReviews = true }: UserReviewStatsProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<MatchReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [statsData, reviewsData] = await Promise.all([
        reviewService.getReviewStats(userId),
        showReviews ? reviewService.getUserReviews(userId, 100, 0) : Promise.resolve(null),
      ]);

      setStats(statsData);
      if (reviewsData) {
        setReviews(reviewsData.reviews);
      }
    } catch (err) {
      setError('No se pudieron cargar las estadísticas de reviews');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-glow border-primary/20">
        <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-white/70">Cargando estadísticas de calificaciones...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="glass-glow border-destructive/20">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
            <div>
              <p className="font-semibold text-destructive mb-2">Error</p>
              <p className="text-white/80 text-sm mb-4">{error}</p>
              <Button
                onClick={loadStats}
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

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const ratingPercentages = {
    five: stats?.rating_distribution?.five_star && stats.total_reviews > 0 ? (stats.rating_distribution.five_star / stats.total_reviews) * 100 : 0,
    four: stats?.rating_distribution?.four_star && stats.total_reviews > 0 ? (stats.rating_distribution.four_star / stats.total_reviews) * 100 : 0,
    three: stats?.rating_distribution?.three_star && stats.total_reviews > 0 ? (stats.rating_distribution.three_star / stats.total_reviews) * 100 : 0,
    two: stats?.rating_distribution?.two_star && stats.total_reviews > 0 ? (stats.rating_distribution.two_star / stats.total_reviews) * 100 : 0,
    one: stats?.rating_distribution?.one_star && stats.total_reviews > 0 ? (stats.rating_distribution.one_star / stats.total_reviews) * 100 : 0,
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-glow border-primary/20 overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Calificaciones</CardTitle>
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Main Rating Display */}
            {stats.total_reviews > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Overall Rating */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 text-center"
                >
                  <p className="text-xs sm:text-sm text-white/60 mb-2">Calificación General</p>
                  <div className="mb-2">
                    <span className="text-3xl sm:text-4xl font-bold text-primary">
                      {stats.average_overall_rating.toFixed(1)}
                    </span>
                    <span className="text-xs sm:text-sm text-white/60">/5</span>
                  </div>
                  <div className="flex gap-0.5 justify-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          star <= Math.round(stats.average_overall_rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/50">{stats.total_reviews} reseñas</p>
                </motion.div>

                {/* Detailed Ratings */}
                {[
                  { label: 'Comunicación', value: stats.average_communication_rating },
                  { label: 'Calidad', value: stats.average_quality_rating },
                  { label: 'Profesionalismo', value: stats.average_professionalism_rating },
                ].map((rating, index) => (
                  <motion.div
                    key={rating.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="bg-white/5 rounded-xl p-3 sm:p-4 text-center"
                  >
                    <p className="text-[10px] sm:text-xs text-white/60 mb-2 line-clamp-1">{rating.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {rating.value > 0 ? rating.value.toFixed(1) : '—'}
                    </p>
                    {rating.value > 0 && (
                      <div className="flex gap-0.5 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
                              star <= Math.round(rating.value)
                                ? 'bg-primary'
                                : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/70 mb-2">Sin calificaciones aún</p>
                <p className="text-sm text-white/60">
                  Las calificaciones aparecerán después de completar servicios
                </p>
              </div>
            )}

            {/* Rating Distribution */}
            {stats.total_reviews > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <p className="text-sm font-semibold text-white">Distribución de Calificaciones</p>
                {[
                  { stars: 5, count: stats?.rating_distribution?.five_star || 0, percentage: ratingPercentages.five },
                  { stars: 4, count: stats?.rating_distribution?.four_star || 0, percentage: ratingPercentages.four },
                  { stars: 3, count: stats?.rating_distribution?.three_star || 0, percentage: ratingPercentages.three },
                  { stars: 2, count: stats?.rating_distribution?.two_star || 0, percentage: ratingPercentages.two },
                  { stars: 1, count: stats?.rating_distribution?.one_star || 0, percentage: ratingPercentages.one },
                ].map((dist) => (
                  <div key={dist.stars} className="flex items-center gap-3">
                    <div className="flex gap-1 w-12">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= dist.stars
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <Progress value={dist.percentage} className="flex-1 h-2" />
                    <span className="text-xs text-white/60 w-12 text-right">
                      {dist.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Reviews List */}
      {showReviews && reviews.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-glow border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Reseñas Recientes</CardTitle>
                <Badge variant="outline">{reviews.length} total</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {displayedReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-white/5 border border-primary/10 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">
                        {review.reviewer?.name || 'Usuario Anónimo'}
                      </p>
                      <p className="text-xs text-white/60">
                        {new Date(review.created_at).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.overall_rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-sm text-white/80 mb-2">{review.comment}</p>
                  )}

                  {/* Detailed ratings if available */}
                  {(review.communication_rating ||
                    review.quality_rating ||
                    review.professionalism_rating) && (
                    <div className="flex gap-2 flex-wrap mt-2 pt-2 border-t border-white/10">
                      {review.communication_rating && (
                        <Badge variant="outline" className="text-xs">
                          Comunicación: {review.communication_rating}/5
                        </Badge>
                      )}
                      {review.quality_rating && (
                        <Badge variant="outline" className="text-xs">
                          Calidad: {review.quality_rating}/5
                        </Badge>
                      )}
                      {review.professionalism_rating && (
                        <Badge variant="outline" className="text-xs">
                          Profesionalismo: {review.professionalism_rating}/5
                        </Badge>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {reviews.length > 3 && !showAllReviews && (
                <Button
                  onClick={() => setShowAllReviews(true)}
                  variant="outline"
                  className="w-full text-white/70 hover:text-white hover:bg-white/10"
                >
                  Ver todas las reseñas ({reviews.length})
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
