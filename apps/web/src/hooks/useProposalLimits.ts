import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Proposal, ProposalLimitState, AttemptCount } from '@/types/client-circuit';
import { MAX_PROPOSAL_ATTEMPTS } from '@/types/client-circuit';

interface UseProposalLimitsParams {
    /**
     * Project ID
     */
    projectId: string;

    /**
     * Professional ID to check limits for
     */
    professionalId: string;

    /**
     * Whether to enable the query
     */
    enabled?: boolean;
}

/**
 * Fetch proposals for a specific professional on a project
 */
async function fetchProposalsForProfessional(
    projectId: string,
    professionalId: string
): Promise<Proposal[]> {
    try {
        const response = await api.get<Proposal[]>(
            `/projects/${projectId}/proposals?professionalId=${professionalId}`
        );
        return response;
    } catch (error) {
        console.error('Error fetching proposals for professional:', error);
        return [];
    }
}

/**
 * useProposalLimits Hook
 * 
 * Manages the 2-attempt limit rule for proposals.
 * 
 * Business Rules:
 * - Professional can submit maximum 2 proposals per project
 * - First proposal: Initial offer
 * - Second proposal: Counter-proposal (only if first was rejected)
 * - After 2 attempts, professional is locked out
 * 
 * @param params - Hook parameters
 * @returns Proposal limit state with attempt count and lock status
 * 
 * @example
 * ```tsx
 * const { attemptCount, isLocked, canCounterPropose } = useProposalLimits({
 *   projectId: '123',
 *   professionalId: '456',
 * });
 * 
 * if (isLocked) {
 *   return <ProposalLimitBadge isLocked />;
 * }
 * ```
 */
export function useProposalLimits({
    projectId,
    professionalId,
    enabled = true,
}: UseProposalLimitsParams): ProposalLimitState & {
    isLoading: boolean;
    error: Error | null;
} {
    const {
        data: proposals = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['proposalLimits', projectId, professionalId],
        queryFn: () => fetchProposalsForProfessional(projectId, professionalId),
        enabled: enabled && !!projectId && !!professionalId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    });

    // Calculate attempt count
    const attemptCount = Math.min(proposals.length, MAX_PROPOSAL_ATTEMPTS) as AttemptCount;

    // Check if locked (2 or more proposals)
    const isLocked = proposals.length >= MAX_PROPOSAL_ATTEMPTS;

    // Get latest proposal
    const latestProposal = proposals.length > 0
        ? proposals.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
        : undefined;

    // Can counter-propose if:
    // 1. Has exactly 1 proposal
    // 2. That proposal was rejected
    // 3. Not locked
    const canCounterPropose =
        attemptCount === 1 &&
        latestProposal?.status === 'rejected' &&
        !isLocked;

    return {
        attemptCount: attemptCount || 1,
        isLocked,
        canCounterPropose,
        proposals,
        latestProposal,
        isLoading,
        error: error as Error | null,
    };
}

/**
 * useProposalLimitsForMultiple Hook
 * 
 * Batch version for checking limits for multiple professionals at once.
 * Useful for displaying proposal limits in a list of proposals.
 * 
 * @param projectId - Project ID
 * @param professionalIds - Array of professional IDs
 * @returns Map of professional ID to their limit state
 * 
 * @example
 * ```tsx
 * const limitsMap = useProposalLimitsForMultiple('project-123', ['pro-1', 'pro-2']);
 * 
 * proposals.map(proposal => {
 *   const limits = limitsMap[proposal.professional_id];
 *   return <ProposalCard {...proposal} limits={limits} />;
 * });
 * ```
 */
export function useProposalLimitsForMultiple(
    projectId: string,
    professionalIds: string[]
): Record<string, ProposalLimitState> {
    const { data: allProposals = [] } = useQuery({
        queryKey: ['allProposals', projectId],
        queryFn: () => api.get<Proposal[]>(`/projects/${projectId}/proposals`),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
    });

    // Group proposals by professional
    const proposalsByProfessional = allProposals.reduce((acc, proposal) => {
        if (!acc[proposal.professional_id]) {
            acc[proposal.professional_id] = [];
        }
        acc[proposal.professional_id].push(proposal);
        return acc;
    }, {} as Record<string, Proposal[]>);

    // Calculate limits for each professional
    const limitsMap: Record<string, ProposalLimitState> = {};

    professionalIds.forEach(professionalId => {
        const proposals = proposalsByProfessional[professionalId] || [];
        const attemptCount = Math.min(proposals.length, MAX_PROPOSAL_ATTEMPTS) as AttemptCount;
        const isLocked = proposals.length >= MAX_PROPOSAL_ATTEMPTS;

        const latestProposal = proposals.length > 0
            ? proposals.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
            : undefined;

        const canCounterPropose =
            attemptCount === 1 &&
            latestProposal?.status === 'rejected' &&
            !isLocked;

        limitsMap[professionalId] = {
            attemptCount: attemptCount || 1,
            isLocked,
            canCounterPropose,
            proposals,
            latestProposal,
        };
    });

    return limitsMap;
}
