import React from 'react';
import { Shield, ThumbsUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { TrustScore } from '../../lib/services/feedback.service';

interface TrustBadgeProps {
  trustScore: TrustScore;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  trustScore,
  size = 'md',
  showDetails = false,
}) => {
  const getTrustLevel = (percentage: number): { color: string; label: string } => {
    if (percentage >= 90) return { color: 'bg-success', label: 'Excelente' };
    if (percentage >= 75) return { color: 'bg-blue-500', label: 'Muy Bueno' };
    if (percentage >= 60) return { color: 'bg-warning', label: 'Bueno' };
    if (percentage >= 40) return { color: 'bg-orange-500', label: 'Regular' };
    return { color: 'bg-destructive', label: 'Bajo' };
  };

  const trustLevel = getTrustLevel(trustScore.trustPercentage);

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div
              className={`${sizeClasses[size]} ${trustLevel.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
            >
              <Shield className="h-4 w-4" />
            </div>
            {showDetails && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {trustScore.trustPercentage}% Confiabilidad
                </span>
                <span className="text-xs text-muted-foreground">
                  {trustScore.totalLikes} likes de {trustScore.totalFeedback} feedback
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{trustLevel.label}</p>
            <p className="text-xs">
              <ThumbsUp className="inline h-3 w-3 mr-1" />
              {trustScore.totalLikes} de {trustScore.totalFeedback} son positivos
            </p>
            <p className="text-xs text-muted-foreground">
              {trustScore.trustPercentage}% de confiabilidad
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
