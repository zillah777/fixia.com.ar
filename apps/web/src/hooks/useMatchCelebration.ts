import { useState, useCallback } from 'react';
import type { MatchCelebration } from '@/types/client-circuit';

/**
 * useMatchCelebration Hook
 * 
 * Manages the state for showing the match success celebration modal.
 * 
 * Usage:
 * 1. Call `celebrate()` when proposal is accepted
 * 2. Modal automatically shows with celebration animation
 * 3. User can dismiss modal
 * 4. State is cleared on dismiss
 * 
 * @returns Match celebration state and controls
 * 
 * @example
 * ```tsx
 * const { showCelebration, matchData, celebrate, dismiss } = useMatchCelebration();
 * 
 * const handleAcceptProposal = async () => {
 *   const match = await acceptProposal(proposalId);
 *   celebrate({
 *     professionalName: match.professional.name,
 *     whatsappNumber: match.professional.whatsapp_number,
 *     projectTitle: match.project.title,
 *     matchId: match.id,
 *     agreedPrice: match.proposal.quoted_price,
 *     deliveryTimeDays: match.proposal.delivery_time_days,
 *   });
 * };
 * 
 * return (
 *   <>
 *     <Button onClick={handleAcceptProposal}>Aceptar</Button>
 *     <MatchSuccessModal
 *       isOpen={showCelebration}
 *       data={matchData}
 *       onClose={dismiss}
 *     />
 *   </>
 * );
 * ```
 */
export function useMatchCelebration() {
    const [showCelebration, setShowCelebration] = useState(false);
    const [matchData, setMatchData] = useState<MatchCelebration | null>(null);

    /**
     * Trigger celebration modal with match data
     */
    const celebrate = useCallback((data: MatchCelebration) => {
        setMatchData(data);
        setShowCelebration(true);
    }, []);

    /**
     * Dismiss celebration modal and clear data
     */
    const dismiss = useCallback(() => {
        setShowCelebration(false);
        // Clear data after animation completes
        setTimeout(() => {
            setMatchData(null);
        }, 300);
    }, []);

    /**
     * Reset celebration state (useful for cleanup)
     */
    const reset = useCallback(() => {
        setShowCelebration(false);
        setMatchData(null);
    }, []);

    return {
        /**
         * Whether celebration modal is currently showing
         */
        showCelebration,

        /**
         * Match data for the celebration
         */
        matchData,

        /**
         * Trigger celebration with match data
         */
        celebrate,

        /**
         * Dismiss celebration modal
         */
        dismiss,

        /**
         * Reset all celebration state
         */
        reset,
    };
}

/**
 * useMatchCelebrationWithTracking Hook
 * 
 * Extended version that tracks celebration events for analytics.
 * 
 * @param onCelebrate - Optional callback when celebration is triggered
 * @param onDismiss - Optional callback when celebration is dismissed
 * 
 * @example
 * ```tsx
 * const celebration = useMatchCelebrationWithTracking({
 *   onCelebrate: (data) => {
 *     analytics.track('Match Celebration Shown', {
 *       matchId: data.matchId,
 *       professionalId: data.professionalId,
 *     });
 *   },
 *   onDismiss: () => {
 *     analytics.track('Match Celebration Dismissed');
 *   },
 * });
 * ```
 */
export function useMatchCelebrationWithTracking(options?: {
    onCelebrate?: (data: MatchCelebration) => void;
    onDismiss?: () => void;
}) {
    const base = useMatchCelebration();

    const celebrate = useCallback((data: MatchCelebration) => {
        base.celebrate(data);
        options?.onCelebrate?.(data);
    }, [base, options]);

    const dismiss = useCallback(() => {
        base.dismiss();
        options?.onDismiss?.();
    }, [base, options]);

    return {
        ...base,
        celebrate,
        dismiss,
    };
}
