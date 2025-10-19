import { useState, useEffect } from 'react';
import { Star, Shield, MessageSquare, Heart, TrendingUp, Users } from 'lucide-react';
import { motion } from "framer-motion";
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useSecureAuth } from '../context/SecureAuthContext';
import { reviewsService } from '../lib/services/reviews.service';
import { trustService } from '../lib/services/trust.service';

interface SimpleReview {
  id: string;
  rating: number;
  comment?: string;
  verifiedPurchase: boolean;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
  professional: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    title: string;
  };
}

export const ReviewsPage = () => {
  const { user } = useSecureAuth();
  const [reviews, setReviews] = useState<SimpleReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    jobsCompleted: 0,
    completionRate: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadReviews();
    }
  }, [user?.id]);

  const loadReviews = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const reviewsData = await reviewsService.getMyReviews({ page: 1, limit: 50 });

      setReviews(reviewsData.reviews || []);

      // Calculate simple stats
      if (reviewsData.reviews && reviewsData.reviews.length > 0) {
        const avgRating = reviewsData.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.reviews.length;
        setStats({
          total: reviewsData.reviews.length,
          average: avgRating,
          jobsCompleted: 0,
          completionRate: 0
        });
      }

      // Try to get trust score for professionals
      if (user.userType === 'professional') {
        try {
          const trustData = await trustService.getMyTrustScore();
          setStats(prev => ({
            ...prev,
            jobsCompleted: trustData.totalJobsCompleted || 0,
            completionRate: trustData.completionRate || 0
          }));
        } catch (err) {
          // Ignore trust score errors
          console.log('Could not load trust score');
        }
      }
    } catch (err: any) {
      console.error('Error loading reviews:', err);
      setError(err?.message || 'Error al cargar las reseñas');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="glass border-white/20">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Debes iniciar sesión para ver tus reseñas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isClient = user.userType === 'client';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Mis Reseñas</h1>
        <p className="text-muted-foreground">
          {isClient
            ? 'Reseñas que has escrito sobre profesionales'
            : 'Reseñas que has recibido de tus clientes'
          }
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`grid grid-cols-1 md:grid-cols-2 ${isClient ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-6`}
      >
        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calificación Promedio</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.average > 0 ? stats.average.toFixed(1) : '0.0'}
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
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isClient && (
          <>
            <Card className="glass border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trabajos Completados</p>
                    <p className="text-2xl font-bold text-foreground">{stats.jobsCompleted}</p>
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
                      {stats.completionRate > 0 ? stats.completionRate.toFixed(0) : '0'}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>

      {/* Reviews List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass border-white/20">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando reseñas...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={loadReviews}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Reintentar
                </button>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aún no tienes reseñas.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 glass rounded-lg border border-white/20"
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={review.reviewer?.avatar || ''} />
                        <AvatarFallback>
                          {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">
                              {review.reviewer?.name || 'Usuario'}
                            </span>
                            {review.verifiedPurchase && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('es-AR')}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating || 0)}
                          <span className="text-sm text-muted-foreground ml-2">
                            ({review.rating || 0}/5)
                          </span>
                        </div>

                        {review.comment && (
                          <p className="text-foreground">{review.comment}</p>
                        )}

                        {review.service?.title && (
                          <p className="text-sm text-muted-foreground">
                            Servicio: {review.service.title}
                          </p>
                        )}

                        {review.professional?.name && isClient && (
                          <p className="text-sm text-muted-foreground">
                            Profesional: {review.professional.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

ReviewsPage.displayName = 'ReviewsPage';
