import React, { useState, memo } from 'react';
import { ThumbsUp, Flag, Shield, TrendingUp, Award } from 'lucide-react';
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';

interface Review {
  id: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  trustScore: number;
  communicationRating?: number;
  qualityRating?: number;
  timelinessRating?: number;
  professionalismRating?: number;
  helpfulCount: number;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
  service?: {
    id: string;
    title: string;
  };
  job?: {
    id: string;
    title: string;
  };
}

interface TrustScore {
  overallScore: number;
  trustBadge: string;
  badgeColor: string;
  totalJobsCompleted: number;
  totalReviewsReceived: number;
  averageRating: number;
  responseTimeHours: number;
  completionRate: number;
  verifiedIdentity: boolean;
  verifiedSkills: boolean;
  verifiedBusiness: boolean;
  backgroundChecked: boolean;
  scoreBreakdown: {
    reviewScore: number;
    completionScore: number;
    communicationScore: number;
    reliabilityScore: number;
    verificationScore: number;
  };
}

interface ReviewsSectionProps {
  professionalId: string;
  reviews: Review[];
  trustScore?: TrustScore;
  isLoading?: boolean;
  canReview?: boolean;
  onSubmitReview?: (reviewData: any) => void;
  onHelpfulVote?: (reviewId: string, isHelpful: boolean) => void;
  onFlagReview?: (reviewId: string, reason: string) => void;
}

export const ReviewsSection = memo<ReviewsSectionProps>(({
  professionalId,
  reviews,
  trustScore,
  isLoading = false,
  canReview = false,
  onSubmitReview,
  onHelpfulVote,
  onFlagReview
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    communicationRating: 5,
    qualityRating: 5,
    timelinessRating: 5,
    professionalismRating: 5
  });

  const renderStars = (rating: number, size = 'sm') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        )}
      />
    ));
  };

  const renderRatingInput = (
    label: string,
    value: number,
    onChange: (value: number) => void
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={cn(
                'h-6 w-6',
                i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmitReview = () => {
    if (onSubmitReview) {
      onSubmitReview({
        professionalId,
        ...newReview
      });
      setShowReviewForm(false);
      setNewReview({
        rating: 5,
        comment: '',
        communicationRating: 5,
        qualityRating: 5,
        timelinessRating: 5,
        professionalismRating: 5
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="glass border-white/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-white/10 rounded animate-pulse" />
            <div className="h-20 bg-white/10 rounded animate-pulse" />
            <div className="h-4 bg-white/10 rounded animate-pulse w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trust Score Section */}
      {trustScore && (
        <Card className="glass border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Puntuación de Confianza</h3>
              </div>
              <Badge className={cn('text-sm', trustScore.badgeColor)}>
                {trustScore.trustBadge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {trustScore.overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Puntuación General</div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {trustScore.totalJobsCompleted}
                </div>
                <div className="text-xs text-muted-foreground">Trabajos Completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {trustScore.averageRating.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Calificación Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {trustScore.completionRate.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Tasa de Finalización</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {trustScore.responseTimeHours}h
                </div>
                <div className="text-xs text-muted-foreground">Tiempo de Respuesta</div>
              </div>
            </div>

            {/* Verification Badges */}
            <div className="flex flex-wrap gap-2">
              {trustScore.verifiedIdentity && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Identidad Verificada
                </Badge>
              )}
              {trustScore.verifiedSkills && (
                <Badge variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Habilidades Verificadas
                </Badge>
              )}
              {trustScore.verifiedBusiness && (
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Negocio Verificado
                </Badge>
              )}
              {trustScore.backgroundChecked && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Antecedentes Verificados
                </Badge>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Desglose de Puntuación</h4>
              {Object.entries(trustScore.scoreBreakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="font-medium text-foreground">{value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Section */}
      <Card className="glass border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Reseñas ({reviews.length})
            </h3>
            {canReview && (
              <Button
                onClick={() => setShowReviewForm(true)}
                size="sm"
                className="liquid-gradient"
              >
                Escribir Reseña
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 glass rounded-lg border border-white/20"
              >
                <h4 className="font-medium text-foreground">Escribir una Reseña</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {renderRatingInput('Calificación General', newReview.rating, (value) =>
                    setNewReview(prev => ({ ...prev, rating: value }))
                  )}
                  {renderRatingInput('Comunicación', newReview.communicationRating, (value) =>
                    setNewReview(prev => ({ ...prev, communicationRating: value }))
                  )}
                  {renderRatingInput('Calidad', newReview.qualityRating, (value) =>
                    setNewReview(prev => ({ ...prev, qualityRating: value }))
                  )}
                  {renderRatingInput('Puntualidad', newReview.timelinessRating, (value) =>
                    setNewReview(prev => ({ ...prev, timelinessRating: value }))
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Comentario</label>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Comparte tu experiencia trabajando con este profesional..."
                    rows={4}
                    className="glass border-white/20"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleSubmitReview}
                    className="liquid-gradient"
                    disabled={!newReview.comment.trim()}
                  >
                    Publicar Reseña
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aún no hay reseñas para este profesional.
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 glass rounded-lg border border-white/20"
                >
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={review.reviewer.avatar} />
                      <AvatarFallback>
                        {review.reviewer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground">
                            {review.reviewer.name}
                          </span>
                          {review.verifiedPurchase && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Compra Verificada
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground ml-2">
                          ({review.rating}/5)
                        </span>
                      </div>

                      {review.comment && (
                        <p className="text-foreground">{review.comment}</p>
                      )}

                      {/* Detailed Ratings */}
                      {(review.communicationRating || review.qualityRating || 
                        review.timelinessRating || review.professionalismRating) && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {review.communicationRating && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Comunicación:</span>
                              <div className="flex items-center space-x-1">
                                {renderStars(review.communicationRating, 'xs')}
                              </div>
                            </div>
                          )}
                          {review.qualityRating && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Calidad:</span>
                              <div className="flex items-center space-x-1">
                                {renderStars(review.qualityRating, 'xs')}
                              </div>
                            </div>
                          )}
                          {review.timelinessRating && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Puntualidad:</span>
                              <div className="flex items-center space-x-1">
                                {renderStars(review.timelinessRating, 'xs')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <Separator className="bg-white/10" />

                      {/* Review Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onHelpfulVote?.(review.id, true)}
                            className="h-8 px-2"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Útil ({review.helpfulCount})
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFlagReview?.(review.id, 'inappropriate')}
                            className="h-8 px-2 text-muted-foreground"
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            Reportar
                          </Button>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Confianza: {review.trustScore.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ReviewsSection.displayName = 'ReviewsSection';