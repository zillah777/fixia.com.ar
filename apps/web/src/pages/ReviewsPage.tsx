import React, { useState, useEffect, memo } from 'react';
import { Filter, TrendingUp, Users, MessageSquare, Shield, Award } from 'lucide-react';
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ReviewsSection } from '../components/reviews/ReviewsSection';
import { TrustBadge, TrustScoreDisplay } from '../components/trust/TrustBadge';
import { useSecureAuth } from '../context/SecureAuthContext';
import { reviewsService, Review, ReviewStats } from '../lib/services/reviews.service';
import { trustService, TrustScore } from '../lib/services/trust.service';

export const ReviewsPage = memo(() => {
  const { user } = useSecureAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    sortBy: 'newest' as const,
    rating: undefined as number | undefined,
    verifiedOnly: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, filters]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [reviewsData, trustData, statsData] = await Promise.all([
        reviewsService.getReviewsByProfessional(user.id, {
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        }),
        trustService.getMyTrustScore().catch(() => null),
        reviewsService.getProfessionalReviewStats(user.id).catch(() => null)
      ]);

      setReviews(reviewsData.reviews);
      setPagination(reviewsData.pagination);
      setTrustScore(trustData);
      setReviewStats(statsData);
    } catch (error) {
      console.error('Error loading reviews data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculateTrustScore = async () => {
    try {
      const updatedTrustScore = await trustService.calculateTrustScore();
      setTrustScore(updatedTrustScore);
    } catch (error) {
      console.error('Error recalculating trust score:', error);
    }
  };

  if (!user || user.userType !== 'professional') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass border-white/20">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Esta página solo está disponible para profesionales verificados.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Reseñas</h1>
            <p className="text-muted-foreground">
              Gestiona tu reputación y monitorea tu puntuación de confianza
            </p>
          </div>
          {trustScore && (
            <TrustBadge
              score={trustScore.overallScore}
              badge={trustScore.trustBadge || trustService.getBadgeFromScore(trustScore.overallScore)}
              size="lg"
              verificationBadges={{
                verifiedIdentity: trustScore.verifiedIdentity,
                verifiedSkills: trustScore.verifiedSkills,
                verifiedBusiness: trustScore.verifiedBusiness,
                backgroundChecked: trustScore.backgroundChecked
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calificación Promedio</p>
                <p className="text-2xl font-bold text-foreground">
                  {reviewStats?.average.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reseñas</p>
                <p className="text-2xl font-bold text-foreground">
                  {reviewStats?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trabajos Completados</p>
                <p className="text-2xl font-bold text-foreground">
                  {trustScore?.totalJobsCompleted || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Finalización</p>
                <p className="text-2xl font-bold text-foreground">
                  {trustScore?.completionRate.toFixed(0) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trust Score Details */}
      {trustScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Desglose de Puntuación de Confianza</span>
                <Button
                  onClick={handleRecalculateTrustScore}
                  variant="outline"
                  size="sm"
                >
                  Recalcular
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <TrustScoreDisplay
                  score={trustScore.reviewScore}
                  label="Reseñas"
                />
                <TrustScoreDisplay
                  score={trustScore.completionScore}
                  label="Finalización"
                />
                <TrustScoreDisplay
                  score={trustScore.communicationScore}
                  label="Comunicación"
                />
                <TrustScoreDisplay
                  score={trustScore.reliabilityScore}
                  label="Confiabilidad"
                />
                <TrustScoreDisplay
                  score={trustScore.verificationScore}
                  label="Verificación"
                />
              </div>

              {/* Next Badge Progress */}
              {(() => {
                const nextBadge = trustService.getNextBadgeRequirement(trustScore.overallScore);
                return nextBadge ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Progreso hacia {nextBadge.nextBadge}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {nextBadge.pointsNeeded.toFixed(1)} puntos restantes
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${nextBadge.currentProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-gold-100 rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-medium text-purple-600">
                      ¡Felicitaciones! Has alcanzado el nivel más alto
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filtros:</span>
        </div>

        <Select
          value={filters.sortBy}
          onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-48 glass border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más Recientes</SelectItem>
            <SelectItem value="oldest">Más Antiguos</SelectItem>
            <SelectItem value="rating_high">Mejor Calificados</SelectItem>
            <SelectItem value="rating_low">Menor Calificados</SelectItem>
            <SelectItem value="helpful">Más Útiles</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.rating?.toString() || ''}
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            rating: value ? parseInt(value) : undefined 
          }))}
        >
          <SelectTrigger className="w-40 glass border-white/20">
            <SelectValue placeholder="Calificación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="5">5 Estrellas</SelectItem>
            <SelectItem value="4">4 Estrellas</SelectItem>
            <SelectItem value="3">3 Estrellas</SelectItem>
            <SelectItem value="2">2 Estrellas</SelectItem>
            <SelectItem value="1">1 Estrella</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={filters.verifiedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
        >
          <Shield className="h-4 w-4 mr-2" />
          Solo Verificadas
        </Button>
      </motion.div>

      {/* Reviews Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ReviewsSection
          professionalId={user.id}
          reviews={reviews}
          trustScore={trustScore || undefined}
          isLoading={isLoading}
          canReview={false}
          onHelpfulVote={(reviewId, isHelpful) => {
            // Update helpful count locally for optimistic UI
            setReviews(prev => prev.map(review => 
              review.id === reviewId 
                ? { ...review, helpfulCount: review.helpfulCount + (isHelpful ? 1 : -1) }
                : review
            ));
          }}
          onFlagReview={(reviewId, reason) => {
            console.log('Flag review:', reviewId, reason);
            // Handle flag review
          }}
        />
      </motion.div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center space-x-2"
        >
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page <= 1}
          >
            Anterior
          </Button>
          
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? 'default' : 'outline'}
                onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.pages}
          >
            Siguiente
          </Button>
        </motion.div>
      )}
    </div>
  );
});

ReviewsPage.displayName = 'ReviewsPage';