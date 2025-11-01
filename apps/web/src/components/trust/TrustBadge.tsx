import React, { memo } from 'react';
import { Shield, Heart, TrendingUp, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../ui/utils';

interface TrustBadgeProps {
  score: number;
  badge: string;
  badgeColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showIcon?: boolean;
  showTooltip?: boolean;
  verificationBadges?: {
    verifiedIdentity?: boolean;
    verifiedSkills?: boolean;
    verifiedBusiness?: boolean;
    backgroundChecked?: boolean;
  };
  className?: string;
}

export const TrustBadge = memo<TrustBadgeProps>(({
  score,
  badge,
  badgeColor,
  size = 'md',
  showScore = true,
  showIcon = true,
  showTooltip = true,
  verificationBadges,
  className
}) => {
  const getBadgeIcon = (badgeName: string) => {
    switch (badgeName) {
      case 'Top Rated Plus':
        return <Heart className={cn(
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
          'mr-1'
        )} />;
      case 'Highly Trusted':
        return <Shield className={cn(
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
          'mr-1'
        )} />;
      case 'Trusted Professional':
        return <CheckCircle className={cn(
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
          'mr-1'
        )} />;
      case 'Verified Professional':
        return <Heart className={cn(
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
          'mr-1'
        )} />;
      default:
        return <Shield className={cn(
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
          'mr-1'
        )} />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-purple-600';
    if (score >= 85) return 'text-success';
    if (score >= 75) return 'text-blue-600';
    if (score >= 65) return 'text-orange-600';
    if (score >= 50) return 'text-gray-600';
    return 'text-slate-600';
  };

  const getBadgeVariant = (score: number) => {
    if (score >= 85) return 'default';
    if (score >= 65) return 'secondary';
    return 'outline';
  };

  const tooltipContent = (
    <div className="space-y-2">
      <div className="font-medium">{badge}</div>
      <div className="text-sm">Puntuación de Confianza: {score.toFixed(1)}/100</div>
      {verificationBadges && (
        <div className="space-y-1">
          <div className="text-xs font-medium">Verificaciones:</div>
          <div className="space-y-1 text-xs">
            {verificationBadges.verifiedIdentity && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Identidad verificada
              </div>
            )}
            {verificationBadges.verifiedSkills && (
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-blue-500" />
                Habilidades verificadas
              </div>
            )}
            {verificationBadges.verifiedBusiness && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-purple-500" />
                Negocio verificado
              </div>
            )}
            {verificationBadges.backgroundChecked && (
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-500" />
                Antecedentes verificados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const badgeElement = (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge
        variant={getBadgeVariant(score)}
        className={cn(
          badgeColor || `${getScoreColor(score).replace('text-', 'text-')} bg-${getScoreColor(score).replace('text-', '').replace('-600', '-100')}`,
          size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-2' : 'text-xs px-2 py-1'
        )}
      >
        {showIcon && getBadgeIcon(badge)}
        {badge}
        {showScore && (
          <span className="ml-1 font-bold">
            {score.toFixed(0)}
          </span>
        )}
      </Badge>

      {/* Verification mini-badges */}
      {verificationBadges && size !== 'sm' && (
        <div className="flex gap-1">
          {verificationBadges.verifiedIdentity && (
            <div className="flex items-center justify-center w-5 h-5 bg-success/10 rounded-full">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
          )}
          {verificationBadges.verifiedSkills && (
            <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full">
              <Heart className="h-3 w-3 text-blue-600" />
            </div>
          )}
          {verificationBadges.verifiedBusiness && (
            <div className="flex items-center justify-center w-5 h-5 bg-purple-100 rounded-full">
              <TrendingUp className="h-3 w-3 text-purple-600" />
            </div>
          )}
          {verificationBadges.backgroundChecked && (
            <div className="flex items-center justify-center w-5 h-5 bg-emerald-100 rounded-full">
              <Shield className="h-3 w-3 text-emerald-600" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!showTooltip) {
    return badgeElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeElement}
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

TrustBadge.displayName = 'TrustBadge';

// Helper component for displaying trust score with progress bar
export const TrustScoreDisplay = memo<{
  score: number;
  label?: string;
  showProgressBar?: boolean;
  className?: string;
}>(({ score, label = 'Confianza', showProgressBar = true, className }) => {
  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-purple-600';
    if (score >= 85) return 'text-success';
    if (score >= 75) return 'text-blue-600';
    if (score >= 65) return 'text-orange-600';
    if (score >= 50) return 'text-gray-600';
    return 'text-slate-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 95) return 'bg-purple-500';
    if (score >= 85) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 65) return 'bg-orange-500';
    if (score >= 50) return 'bg-gray-500';
    return 'bg-slate-500';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn('text-sm font-bold', getScoreColor(score))}>
          {score.toFixed(1)}
        </span>
      </div>
      {showProgressBar && (
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className={cn('h-2 rounded-full transition-all duration-300', getProgressColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
});

TrustScoreDisplay.displayName = 'TrustScoreDisplay';