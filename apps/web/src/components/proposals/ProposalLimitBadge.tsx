import { AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { AttemptCount } from '@/types/client-circuit';

interface ProposalLimitBadgeProps {
    /**
     * Current attempt count (1 or 2)
     */
    attemptCount: AttemptCount;

    /**
     * Whether professional has reached max attempts
     */
    isLocked: boolean;

    /**
     * Whether professional can send counter-proposal
     */
    canCounterPropose: boolean;

    /**
     * Proposal status
     */
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';

    /**
     * Optional size variant
     */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Proposal Limit Badge
 * 
 * Visual indicator for the 2-attempt limit rule.
 * Shows different states:
 * - First attempt pending
 * - First attempt rejected (can counter-propose)
 * - Second attempt (last chance)
 * - Locked (max attempts reached)
 * 
 * @component
 */
export function ProposalLimitBadge({
    attemptCount,
    isLocked,
    canCounterPropose,
    status,
    size = 'md',
}: ProposalLimitBadgeProps) {
    // Don't show badge if proposal is accepted or withdrawn
    if (status === 'accepted' || status === 'withdrawn') {
        return null;
    }

    // Size classes
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    // LOCKED STATE (2 attempts used, all rejected)
    if (isLocked) {
        return (
            <Badge
                className={`
          bg-destructive/20 text-destructive border-destructive/30
          font-semibold flex items-center gap-1.5
          ${sizeClasses[size]}
        `}
            >
                <Lock className={iconSizes[size]} />
                <span>Máximo de Intentos Alcanzado (2/2)</span>
            </Badge>
        );
    }

    // COUNTER-PROPOSAL ELIGIBLE (1 attempt, rejected, can try again)
    if (canCounterPropose && status === 'rejected') {
        return (
            <Badge
                className={`
          bg-warning/20 text-warning border-warning/30
          font-semibold flex items-center gap-1.5 animate-pulse
          ${sizeClasses[size]}
        `}
            >
                <RefreshCw className={iconSizes[size]} />
                <span>Última Oportunidad (1/2 intentos)</span>
            </Badge>
        );
    }

    // SECOND ATTEMPT PENDING (last chance)
    if (attemptCount === 2 && status === 'pending') {
        return (
            <Badge
                className={`
          bg-warning/20 text-warning border-warning/30
          font-semibold flex items-center gap-1.5
          ${sizeClasses[size]}
        `}
            >
                <AlertCircle className={iconSizes[size]} />
                <span>Segundo Intento (2/2)</span>
            </Badge>
        );
    }

    // FIRST ATTEMPT REJECTED (but not eligible for counter-proposal yet)
    if (attemptCount === 1 && status === 'rejected') {
        return (
            <Badge
                className={`
          bg-gray-500/20 text-gray-300 border-gray-500/30
          font-medium flex items-center gap-1.5
          ${sizeClasses[size]}
        `}
            >
                <span>Propuesta Rechazada (1/2)</span>
            </Badge>
        );
    }

    // FIRST ATTEMPT PENDING (normal state)
    if (attemptCount === 1 && status === 'pending') {
        return (
            <Badge
                className={`
          bg-primary/20 text-primary border-primary/30
          font-medium flex items-center gap-1.5
          ${sizeClasses[size]}
        `}
            >
                <span>Primer Intento (1/2)</span>
            </Badge>
        );
    }

    // Default: don't show badge
    return null;
}

/**
 * Compact version for use in lists
 */
export function ProposalLimitBadgeCompact({
    attemptCount,
    isLocked,
}: Pick<ProposalLimitBadgeProps, 'attemptCount' | 'isLocked'>) {
    if (isLocked) {
        return (
            <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs px-2 py-0.5">
                🔒 2/2
            </Badge>
        );
    }

    return (
        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-2 py-0.5">
            {attemptCount}/2
        </Badge>
    );
}
