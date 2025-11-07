'use client';

import { motion } from 'framer-motion';
import { Star, MessageCircle, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { MatchReview } from '@/lib/services/review.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReviewCardProps {
  review: MatchReview;
  currentUserId?: string;
  onDelete?: (reviewId: string) => void;
  isLoading?: boolean;
}

export function ReviewCard({
  review,
  currentUserId,
  onDelete,
  isLoading = false,
}: ReviewCardProps) {
  const isOwnReview = currentUserId === review.reviewer_id;
  const reviewer = review.reviewer;
  const ratings = [
    {
      label: 'General',
      value: review.overall_rating,
    },
    ...(review.communication_rating ? [{ label: 'Comunicación', value: review.communication_rating }] : []),
    ...(review.quality_rating ? [{ label: 'Calidad', value: review.quality_rating }] : []),
    ...(review.professionalism_rating ? [{ label: 'Profesionalismo', value: review.professionalism_rating }] : []),
    ...(review.timeliness_rating ? [{ label: 'Puntualidad', value: review.timeliness_rating }] : []),
  ];

  const averageRating = ratings.length > 0
    ? Math.round((ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length) * 10) / 10
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-glow border-primary/10 overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          {/* Header with Reviewer Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={reviewer?.avatar} />
                <AvatarFallback>{reviewer?.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">
                  {reviewer?.name}
                </h4>
                <p className="text-xs text-white/60">
                  {format(new Date(review.created_at), 'd MMM yyyy', { locale: es })}
                </p>
              </div>
            </div>

            {isOwnReview && onDelete && (
              <Button
                onClick={() => onDelete(review.id)}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="ml-2 text-white/60 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Overall Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
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
            <span className="text-sm font-semibold text-white ml-2">
              {review.overall_rating}.0
            </span>
            {review.verified_match && (
              <Badge variant="outline" className="text-[10px] ml-auto h-5">
                ✓ Compra Verificada
              </Badge>
            )}
          </div>

          {/* Additional Ratings */}
          {ratings.length > 1 && (
            <div className="mb-4 space-y-2">
              {ratings.slice(1).map((rating) => (
                <div key={rating.label} className="flex items-center gap-2 text-xs">
                  <span className="text-white/60 w-20">{rating.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`h-3 w-3 rounded-full ${
                          star <= rating.value ? 'bg-primary' : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/80 font-semibold">{rating.value}/5</span>
                </div>
              ))}
            </div>
          )}

          {/* Comment */}
          {review.comment && (
            <div className="bg-white/5 border border-primary/10 rounded-lg p-3 mb-4">
              <p className="text-sm text-white/90 leading-relaxed">
                {review.comment}
              </p>
            </div>
          )}

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <p className="text-xs text-white/60">
              ID: {review.id.slice(0, 8)}...
            </p>
            <div className="flex gap-1 text-xs text-white/60">
              <MessageCircle className="h-3 w-3" />
              <span>Calificación Verificada</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
