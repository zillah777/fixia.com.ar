import { useCallback } from 'react';
import { useMatchCelebration } from './useMatchCelebration';
import type { MatchCelebration } from '@/types/client-circuit';

/**
 * B2B Match Celebration Data
 * Extended interface for professional-to-professional collaborations
 */
export interface B2BMatchCelebration extends MatchCelebration {
    /**
     * Indicates this is a B2B collaboration (always true)
     */
    isB2B: true;

    /**
     * Partner professional's name (instead of "professional")
     */
    partnerName: string;

    /**
     * Type of collaboration
     */
    collaborationType: 'professional';

    /**
     * Optional: Partner's specialties
     */
    partnerSpecialties?: string[];

    /**
     * Optional: Collaboration agreement URL
     */
    agreementUrl?: string;
}

/**
 * useB2BMatchCelebration Hook
 * 
 * Extended version of useMatchCelebration specifically for B2B collaborations.
 * Provides professional-specific messaging and partnership emphasis.
 * 
 * **Key Differences from Client Celebration:**
 * - Different messaging (collaboration vs. hiring)
 * - Shows both professionals' info
 * - Emphasizes partnership
 * - Different CTA (collaboration agreement vs. contact)
 * - Purple theme instead of primary
 * 
 * **2025 Best Practices:**
 * - Extends base hook via composition
 * - Type-safe with explicit interfaces
 * - Proper callback memoization
 * - Clean separation of concerns
 * 
 * @example
 * ```tsx
 * const { showCelebration, matchData, celebrateB2B, dismiss } = useB2BMatchCelebration();
 * 
 * const handleAcceptB2BProposal = async () => {
 *   const match = await acceptProposal(proposalId);
 *   celebrateB2B({
 *     partnerName: match.professional.name,
 *     whatsappNumber: match.professional.whatsapp_number,
 *     projectTitle: match.project.title,
 *     matchId: match.id,
 *     agreedPrice: match.proposal.quoted_price,
 *     deliveryTimeDays: match.proposal.delivery_time_days,
 *     isB2B: true,
 *     collaborationType: 'professional',
 *     partnerSpecialties: match.professional.specialties,
 *   });
 * };
 * ```
 */
export function useB2BMatchCelebration() {
    const base = useMatchCelebration();

    /**
     * Trigger B2B collaboration celebration
     * Enhances base celebration with B2B-specific data
     */
    const celebrateB2B = useCallback((data: Omit<B2BMatchCelebration, 'professionalName'>) => {
        // Map B2B data to base celebration format
        const enhancedData: MatchCelebration = {
            professionalName: data.partnerName,
            whatsappNumber: data.whatsappNumber,
            projectTitle: data.projectTitle,
            matchId: data.matchId,
            agreedPrice: data.agreedPrice,
            deliveryTimeDays: data.deliveryTimeDays,
            // Store B2B metadata in a way the modal can detect
            metadata: {
                isB2B: true,
                collaborationType: data.collaborationType,
                partnerSpecialties: data.partnerSpecialties,
                agreementUrl: data.agreementUrl,
            },
        };

        base.celebrate(enhancedData);
    }, [base]);

    return {
        ...base,
        /**
         * Trigger B2B collaboration celebration
         */
        celebrateB2B,
    };
}

/**
 * Helper: Check if celebration is B2B
 * Utility function to detect B2B celebrations in components
 */
export function isB2BCelebration(data: MatchCelebration | null): boolean {
    if (!data) return false;
    return (data as any).metadata?.isB2B === true;
}
