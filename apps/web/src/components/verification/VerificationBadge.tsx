import React from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface VerificationBadgeProps {
  isVerified: boolean;
  verificationLevel?: 'Verificado' | 'Elite' | 'Avanzado' | 'Intermedio' | 'Básico' | 'Principiante';
  userType?: 'client' | 'professional' | 'dual';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function VerificationBadge({
  isVerified,
  verificationLevel = 'Verificado',
  userType = 'client',
  size = 'md',
  showLabel = true,
  className = ''
}: VerificationBadgeProps) {
  if (!isVerified) return null;

  const sizeMap = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const badgeSizeMap = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const isProfessional = userType === 'professional' || userType === 'dual';

  // For professionals, show tier colors; for clients, show simple verified
  const badgeContent = showLabel ? (
    <span className="flex items-center gap-1.5">
      <CheckCircle2 className={`${sizeMap[size]} fill-success text-success`} />
      <span className="font-semibold">
        {isProfessional ? verificationLevel : 'Verificado'}
      </span>
    </span>
  ) : (
    <CheckCircle2 className={`${sizeMap[size]} fill-success text-success`} />
  );

  const tooltipText = isProfessional
    ? `Nivel de verificación: ${verificationLevel}. Este profesional ha completado la verificación de su perfil.`
    : 'Identidad verificada. Este usuario ha completado la verificación de su cuenta en Fixia.';

  const badge = (
    <Badge
      className={`bg-success/15 text-success border-success/30 hover:bg-success/25 transition-colors ${badgeSizeMap[size]} ${className}`}
    >
      {badgeContent}
    </Badge>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="bg-success/20 border-success/30 text-success">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
